// 检查无障碍服务是否已经启用，如果没有启用则跳转到无障碍服务启用界面，并等待无障碍服务启动；当无障碍服务启动后脚本会继续运行。
auto.waitFor();
//打开猫眼app
app.launchApp("猫眼");

openConsole();
console.setTitle("余票监控 go!", "#ff11ee00", 30);

//监控刷新票档时间间隔，单位：秒
const monitorIntervalSeconds = 2;

//WebHook地址，用于抢到了之后推送消息
const webHookNoticeUrl="";
//是否响铃提醒
const isRingingBell = true

//是否在测试调试，测试时不会点击支付按钮，避免生成过多订单
var isDebug = false;

//默认参数收集，如果设置了默认值，可以直接使用默认值，不再需要弹窗输入，加快脚本启动进程
//默认场次信息，例如：05-18,05-19
var defaultPlayEtcStr;
//默认最高票价，例如：800
var defaultMaxTicketPrice;
//默认观演人，例如：观演人a,观演人b
var defaultViewers;

main();


//获取输入票价信息
function getMaxTicketPrice() {
    var ticketPrice = rawInput("请输入监控最高票价", "800");
    if (ticketPrice == null || ticketPrice.trim() == '') {
        alert("请输入监控最高票价!");
        return getMaxTicketPrice();
    }
    return ticketPrice;
}

//获取输入的场次信息
function getPlayEtc() {
    var playEtc = rawInput("请输入场次关键字(按照默认格式)", "05-18,05-19");
    if (playEtc == null || playEtc.trim() == '') {
        alert("请输入场次信息!");
        return getPlayEtc();
    }
    return playEtc;
}

//获取输入的观演人姓名
function getViewers() {
    var viewers = rawInput("请输入观演人姓名(多个以英文逗号分隔)", "默认人");
    if (viewers == null || viewers.trim() == '') {
        alert("请输入观演人姓名!");
        return getViewers();
    }
    return viewers;
}



function main() {
    var playEtcStr = defaultPlayEtcStr ? defaultPlayEtcStr : getPlayEtc();
    let playEtcArr = playEtcStr.split(',');
    console.log("监控购票场次：" + playEtcArr);
    var maxTicketPrice = defaultMaxTicketPrice ? defaultMaxTicketPrice : getMaxTicketPrice();
    console.log("监控最高票价：" + maxTicketPrice);
    var viewers = defaultViewers ? defaultViewers : getViewers();
    console.log("观演人：" + viewers);

    //等待一小会儿，避免上个弹窗还没关闭，无法正确判断票档区布局元素是否存在
    sleep(50);
    if (!textContains("¥").exists()) {
        refresh_ticket_dom();
    }
    if (!textContains("¥").exists()) {
        console.log('请主动点击中间票档区域任意按钮刷新dom')
    }
    console.log('进入监控')

    //出现刷新按钮时点击刷新
    threads.start(function () {
        log('刷新按钮自动点击线程已启动')
        while(true){
            textContains("刷新").waitFor()
            textContains("刷新").findOne().click()
            log("点击刷新...")
            //避免点击过快
            sleep(100)
        }
    });

    threads.start(function () {
        console.log("开启票档扫描线程");
        while (true) {
            //当前还在票档界面，就持续扫描
            while (textContains("¥").exists()) {
                cycleMonitor(maxTicketPrice, viewers);
                //50ms扫描一次
                sleep(50);
            }
            sleep(1000);
        }
    });

    sleep(1000);
    while (true) {
        //只要当前在场次选择界面，就点击刷新余票信息
        if(className("android.widget.TextView").text("场次").exists() && !textContains("数量").exists()){
            for(let playEtc of playEtcArr){
                if(isDebug){
                    log("刷新场次余票信息："+playEtc)
                }
                //刷新余票信息
                textContains(playEtc).findOne().click();
                //点击一个场次，间隔时间后继续点击下一个场次
                sleep(monitorIntervalSeconds * 1000);
            }
        }
    }



}

function cycleMonitor(maxTicketPrice, viewers) {
    //等待余票信息加载出来
    // textContains("请选择票档").waitFor();
    //获取符合条件的票档数组
    let targetTickets = get_less_than_tickets(maxTicketPrice)
    for (let amount of targetTickets) {
        log("开冲一个：" + amount);
        doSubmit(amount, viewers);
    }
}

function doSubmit(amount, viewers) {

    let viewersArr = viewers.split(',');

    textContains("¥" + amount).findOne().click();
    textContains("数量").waitFor();

    if (textMatches("\\d+份").exists()) {
        let curCount = parseInt(textMatches("\\d+份").findOne().text().replace("份", ""));
        //根据观演人数点+1
        let plusObj;
        for (let i = curCount; i < viewersArr.length; i++) {
            if(!plusObj){
                let ticketNumParent = textMatches('/\\d+份/').findOne().parent()
                plusObj = ticketNumParent.children()[ticketNumParent.childCount() - 1]
            }
            plusObj.click() ;
        }
    }
    //plus点击后，等待数量组件框刷新，很重要
    textMatches("\\d+份").waitFor();
    if(!text(viewersArr.length + "份").exists()){
        console.log("票数不足，继续刷新");
        return true;
    }

    let attemptCnt = 0;
    let attemptMaxCnt = 150;
    while (text("确认").exists() && attemptCnt <= attemptMaxCnt) {
        click("确认");if(isDebug){
            console.log("点击确认");
        }
        if (className("android.widget.Button").exists()) {
            if(isDebug){
                console.log("找到支付按钮，准备支付");
            }
            break;
        }
        attemptCnt++;
    }
    if (attemptCnt >= attemptMaxCnt && !className("android.widget.Button").exists()) {
        if(isDebug){
            console.log("尝试次数过多，继续刷新");
        }
        return false;
    }
    log("尝试次数：" + attemptCnt);

    //等待立即支付按钮出现
    className("android.widget.Button").waitFor();
    //选择对应的观演人
    if(viewersArr.length != 1 || viewers != "默认人"){
        uncheckIfDefaultUserNotInViewer(viewersArr);
        for (let i = 0; i < viewersArr.length; i++) {
            let viewer = viewersArr[i];
            let viewerObj = className("android.widget.TextView").text(viewer).findOne();
            checkViewer(viewerObj);
        }
    }

    if(!isDebug){
        console.log("准备点击 ");
        for (let cnt = 0; className("android.widget.Button").exists(); cnt++) {
            //直接猛点就完事了
            var c = className("android.widget.Button").findOne().click();
            sleep(50);
            if (cnt % 20 == 0) {
                log("点支付次数:" + cnt + " 可继续等待或返回上一个界面继续刷新其他票档");
            }
            //TODO 出现类似【票已经卖完了】退出循环，继续刷新票档
        }
    }

    console.log("结束，等待5秒后触发判断是否抢到")
    sleep(5000)
    if(textContains("微信支付").exists() || descContains("微信支付").exists()){
        log("抢到啦！！！请尽快支付！！！")
        //webHook推送
        if(webHookNoticeUrl.length > 0){
            webHookSend("抢到啦！！！请尽快支付！！！");
        }
        //播放提示音
        if(isRingingBell){
            ringingBell(0);
        }
    }
    return true;
}


/**
 * 当默认人不在观演人列表中时，取消默认人的选中状态
 */
function uncheckIfDefaultUserNotInViewer(viewersArr) {
    let defaultUserObj = text("默认").findOne().parent().children()[0];
    let defaultUser = defaultUserObj.text();
    if (!viewersArr.includes(defaultUser)) {
        uncheckViewer(defaultUserObj);
    }
}

function checkViewer(viewerObj) {
    clickViewerCheckBox(viewerObj, true);
}

function uncheckViewer(viewerObj) {
    clickViewerCheckBox(viewerObj, false);
}

/**
 * 点击观演人勾选框
 * @param {viewerObj} 观演人姓名text所在的对象 
 * @param {*} isChecked 当前目标操作是否为选中
 */
function clickViewerCheckBox(viewerObj, isChecked) {
    viewerObj.parent().parent().children()
    .forEach(function(child){
        // console.log(child.className()+" "+child.text());
        if(child.className() == "android.widget.Image" ){
            //当前目标操作为选中 且 当前当前状态为未选中
            if(isChecked && child.text() == "wc0GRRGh2f2pQAAAABJRU5ErkJggg=="){
                console.log("选中观演人："+viewerObj.text());
                child.click();
            }
            //当前目标操作为取消选中 且 当前当前状态为选中
            if(!isChecked && child.text() == "B85bZ04Z1b5tAAAAAElFTkSuQmCC"){
                console.log("取消选中观演人："+viewerObj.text());
                child.click();
            }
        }
    })
}


/**
* 
* @returns 大麦服务器时间戳
*/
function getDamaiTimestamp() {
    return JSON.parse(http.get("https://mtop.damai.cn/gw/mtop.common.getTimestamp/", {
        headers: {
            'Host': 'mtop.damai.cn',
            'Content-Type': 'application/json;charset=utf-8',
            'Accept': '*/*',
            'User-Agent': 'floattime/1.1.1 (iPhone; iOS 15.6; Scale/3.00)',
            'Accept-Language': 'zh-Hans-CN;q=1, en-CN;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive'
        }
    }).body.string()).data.t;
}

/**
* 
* @param {时间戳} timestamp 
* @returns ISO 8601 格式的北京时间
*/
function convertToTime(timestamp) {
    var date = new Date(Number(timestamp));
    var year = date.getUTCFullYear();
    var month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
    var day = date.getUTCDate().toString().padStart(2, "0");
    var hours = (date.getUTCHours() + 8).toString().padStart(2, "0");
    var minutes = date.getUTCMinutes().toString().padStart(2, "0");
    var seconds = date.getUTCSeconds().toString().padStart(2, "0");
    var milliseconds = date.getUTCMilliseconds().toString().padStart(3, "0");
    var iso8601 = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
    return iso8601;
}

/**
 * alert一个弹窗，提前使用异步线程延时点击关闭alert弹窗
 */
function refresh_ticket_dom() {
    threads.start(function () {
        id("md_buttonDefaultPositive").findOne().click()
    });
    alert("刷新dom!");
}

function get_less_than_tickets(maxTicketPrice) {
    var targetTickets = [];
    textContains("¥").find().forEach(function (btn) {
        // log(btn.text());
        //适配：某些设备上，缺货提示在文本中；某些设备上，缺货提示在兄弟元素中
        if ((btn.parent().childCount() == 1 && !btn.text().includes("缺货")) 
            || (btn.parent().childCount() >= 1 && descOrTextNotContains(btn.parent(), "缺货"))){
            let match = btn.text().match(/\¥(\d+)/);
            let amount;
            if (match && (amount = parseInt(match[1])) < maxTicketPrice) {
                targetTickets.push(amount);
            }

        }
    });
    targetTickets.sort(function (a, b) {
        return a - b;
    });

    if(isDebug){
        log("符合条件:" + targetTickets);
    }
    return targetTickets;
}

/**
 * 查看node几点及其所有子节点是否包含str
 * @param {*} node 
 * @param {*} str 
 * @returns 
 */
function descOrTextNotContains(node, str){
    if((node.text() != null && node.text().includes(str)) 
        || (node.desc() != null && node.desc().includes(str))){
        return false;
    }
    if(node.childCount() > 0){
        for(let i = 0; i < node.childCount(); i++){
            if(!descOrTextNotContains(node.children()[i], str)){
                return false;
            }
        }
    }
}


function webHookSend(content){
    let res = http.postJson(webHookNoticeUrl, {
        "msg_type": "text",
        "content": {
            "text": content
        }
    }, {
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        });
    console.log("webHook通知结果："+res.body.string());
}

function ringingBell(铃声类型, 是否循环播放, 播放时长) {
    var 播放时长 = 播放时长 || 10000;
    var 是否循环播放 = 是否循环播放 || false;
    if (是否循环播放) {
        播放时长 = 666 * 1000;
    }
    var 铃声选择结果 = android.media.RingtoneManager.TYPE_NOTIFICATION;
    switch (铃声类型) {
        case 0:
            铃声选择结果 = android.media.RingtoneManager.TYPE_RINGTONE;
            break;
        case 1:
            铃声选择结果 = android.media.RingtoneManager.TYPE_ALARM;
            break;
        case 2:
            铃声选择结果 = android.media.RingtoneManager.TYPE_ALL;
            break;
        default:
            break;
    }
    var mp = new android.media.MediaPlayer();
    mp.setDataSource(context, android.media.RingtoneManager.getDefaultUri(铃声选择结果));
    if (是否循环播放) mp.setLooping(true);
    mp.prepare();
    log("播放铃声...")
    mp.start();
    threads.start(function () {
        sleep(播放时长);
        if (mp.isPlaying()) {
            mp.stop();
        }
    });

    events.on("exit", function () {
        if (mp.isPlaying()) {
            mp.stop();
        }
    });
    return mp;
}
