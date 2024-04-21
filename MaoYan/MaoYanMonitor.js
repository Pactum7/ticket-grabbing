// 检查无障碍服务是否已经启用，如果没有启用则跳转到无障碍服务启用界面，并等待无障碍服务启动；当无障碍服务启动后脚本会继续运行。
auto.waitFor();
//打开猫眼app
app.launchApp("猫眼");

openConsole();
console.setTitle("余票监控 go!", "#ff11ee00", 30);

//监控刷新票档时间间隔，单位：秒
const monitorIntervalSeconds = 2;

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
    if (!textContains("看台").exists()) {
        refresh_ticket_dom();
    }
    console.log('进入监控')

    while (true) {
        for(let playEtc of playEtcArr){
            cycleMonitor(maxTicketPrice, viewers);
            log('准备刷新余票');
            //刷新余票信息
            textContains(playEtc).findOne().click();
            sleep(1000)
        }
        //每2秒刷新一次票档
        sleep(monitorIntervalSeconds * 1000);
    }



}

function cycleMonitor(maxTicketPrice, viewers) {
    //等待余票信息加载出来
    textContains("请选择票档").waitFor();
    //获取符合条件的票档数组
    let targetTickets = get_less_than_tickets(maxTicketPrice)
    for (let amount of targetTickets) {
        log("开冲一个：" + amount);
        //返回true表示走完了流程还没抢到，需要刷新票档，返回false表示没确认成功，更换一个票档继续尝试确认
        if (doSubmit(amount, viewers)) {
            break;
        }
    }
}

function doSubmit(amount, viewers) {

    let viewersArr = viewers.split(',');

    textContains("¥" + amount).findOne().click();
    textContains("数量").waitFor();

    if (text("1份").exists()) {
        //根据观演人数点+1
        let plusObj;
        for (let i = 0; i < viewersArr.length - 1; i++) {
            if(!plusObj){
                let ticketNumParent = textMatches('/\\d+份/').findOne().parent()
                plusObj = ticketNumParent.children()[ticketNumParent.childCount() - 1]
            }
            plusObj.click() ;
        }
    }

    let attemptCnt = 0;
    let attemptMaxCnt = 150;
    while (className("android.widget.TextView").text("确认").exists() && attemptMaxCnt <= attemptMaxCnt) {
        click("确认");
        if (className("android.widget.Button").exists()) {
            break;
        }
        attemptCnt++;
    }
    if (attemptCnt >= attemptMaxCnt && !className("android.widget.Button").exists()) {
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

    console.log("准备点击 ");
    for (let cnt = 0; className("android.widget.Button").exists(); cnt++) {
        //直接猛点就完事了
        var c = className("android.widget.Button").findOne().click();
        sleep(50);
        if (cnt % 20 == 0) {
            log("已点击支付次数：" + cnt);
        }
        //TODO 出现类似【票已经卖完了】退出循环，继续刷新票档
    }

    console.log("结束时间：" + convertToTime(getDamaiTimestamp()))
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
        //正则判断如果btn.text()内容包含中文，例如看台、内场
        if (btn.text().match(/[\u4e00-\u9fa5]/) != null) {
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
    log("符合条件:" + targetTickets);
    return targetTickets;
}

//点击控件所在坐标
function btn_position_click(x) {
    if (x) {
        var b = x.bounds();
        print(b.centerX())
        print(b.centerY())
        var c = click(b.centerX(), b.centerY())

        console.log("点击是否成功：" + c);
    }
}

