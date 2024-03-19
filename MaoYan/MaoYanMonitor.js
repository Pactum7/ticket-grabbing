
openConsole();
console.setTitle("余票监控 go!", "#ff11ee00", 30);

//统计绝对坐标
//关闭Alert弹窗坐标
const closeAlertX = 864;
const closeAlertY = 1128;
const closeAlertLantency = 50;
//确认选票坐标
const ConfirmX = 865;
const ConfirmY = 1834;
//选票档界面+1份坐标
const pulsOneX = 980;
const pulsOneY = 1699;
//缺票登记坐标
const closeTicketRegisterX = 963;
const closeTicketRegisterY = 769;
//四排票档坐标
const ticketBtnArr = [
    [215, 1080], [505, 1080], [830, 1080],
    [215, 1250], [505, 1250], [830, 1250],
    [215, 1400], [505, 1400], [830, 1400],
    [215, 1620], [505, 1620], [830, 1620]
];

//监控时间间隔，单位：秒
const monitorIntervalSeconds = 5;

main();


//获取输入票价信息
function getMaxTicketPrice() {
    var ticketPrice = rawInput("请输入监控最高票价", "1000");
    if (ticketPrice == null || ticketPrice.trim() == '') {
        alert("请输入监控最高票价!");
        return getMaxTicketPrice();
    }


    return ticketPrice;
}


function main() {
    var maxTicketPrice = getMaxTicketPrice();
    console.log("监控最高票价：" + maxTicketPrice);
    sleep(50);
    if (!descContains("看台").exists()) {
        refresh_ticket_dom();
    }

    while (true) {
        cycleMonitor(maxTicketPrice);
        //每5秒刷新一次票档
        sleep(monitorIntervalSeconds * 1000);
        //刷新余票信息
        textMatches(/202\d\-\d+\-\d+ 周.*/).findOne().click();
        sleep(1000)
    }



}

function cycleMonitor(maxTicketPrice) {
    //等待余票信息加载出来
    descContains("请选择票档").waitFor();
    //获取符合条件的票档数组
    let targetTickets = get_less_than_tickets(maxTicketPrice)
    for (let amount of targetTickets) {
        log("开冲一个：" + amount);
        //返回true表示走完了流程还没抢到，需要刷新票档，返回false表示没确认成功，更换一个票档继续尝试确认
        if (doSubmit(amount)) {
            break;
        }
    }
}

function doSubmit(amount) {

    descContains("¥" + amount).findOne().click();
    descContains("数量").waitFor();
    if (desc("1份").exists()) {
        //点+1
        click(pulsOneX, pulsOneY);
        log('点+1');
    }

    let attemptCnt = 0;
    let attemptMaxCnt = 150;
    while (desc("确认").exists() && attemptMaxCnt <= attemptMaxCnt) {
        // 点击确认
        // if(desc("确认").exists()){
        desc("确认").click();
        // log('点确认按钮');
        // }else{
        click(ConfirmX, ConfirmY);
            log('点确认坐标');
        // }
        sleep(50);
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
    desc("默认").waitFor();
    //没有选择观演人时，把所有没选的都选上
    if (desc("wc0GRRGh2f2pQAAAABJRU5ErkJggg==").exists()) {
        desc("wc0GRRGh2f2pQAAAABJRU5ErkJggg==").click();
    }
    // //点击支付
    // var c = className("android.widget.Button").findOne().click();
    // console.log("点击立即支付 "+c);
    // console.log("休息2秒,如果立即支付按钮还在再点击一次")
    // //休息2秒
    // sleep(2000)
    // if(className("android.widget.Button").exists()){
    //     var c = className("android.widget.Button").findOne().click();
    //     console.log("继续点击立即支付 "+c);  
    // }
    console.log("准备点击 ");
    for (let cnt = 0; className("android.widget.Button").exists(); cnt++) {
        //直接猛点就完事了
        var c = className("android.widget.Button").findOne().click();
        sleep(closeAlertLantency);
        if (cnt % 20 == 0) {
            log("已点击支付次数：" + cnt);
        }
        //TODO 出现类似【票已经卖完了】退出循环，继续刷新票档
    }

    console.log("结束时间：" + convertToTime(getDamaiTimestamp()))
    return true;
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
function refresh_dom() {
    threads.start(function () {
        sleep(20)
        //点确定关闭alert弹窗
        click(closeAlertX, closeAlertY);
    });
    // rawInput("请输入场次关键字(按照默认格式)", "周六");
    alert("刷新dom!");
}

/**
 * 刷新票档区域的布局结构，不刷新的话票档区域的布局内容无法选中；
 * 实测发现弹窗可以触发票档区域布局的重新加载，因此事先统计好几
 * 排票档的绝对坐标，依次点击触发“缺票登记”弹窗再关闭即可；
 * 兜底情况alert一个弹窗，提前使用异步线程延时点击关闭alert弹窗
 */
function refresh_ticket_dom() {
    for (let i = 0; i < ticketBtnArr.length; i++) {
        click(ticketBtnArr[i][0], ticketBtnArr[i][1]);
        if (descContains('登记号码').exists()) {
            click(closeTicketRegisterX, closeTicketRegisterY);
            console.log("成功刷新dom");
            return;
        }
    }
    //三排票档都点完了还没搞出来弹窗那就直接弹个窗刷新dom
    refresh_dom();
}

function get_less_than_tickets(maxTicketPrice) {
    var targetTickets = [];
    descContains("¥").find().forEach(function (btn) {
        // log(btn.desc());
        if (!btn.desc().includes("缺货登记")) {
            let match = btn.desc().match(/.{2,6}\¥(\d+)/);
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

