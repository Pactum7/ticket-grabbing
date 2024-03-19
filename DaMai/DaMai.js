 // 检查无障碍服务是否已经启用，如果没有启用则跳转到无障碍服务启用界面，并等待无障碍服务启动；当无障碍服务启动后脚本会继续运行。
 auto.waitFor();
 //打开猫眼app
 app.launchApp("大麦");
 openConsole();
 console.setTitle("大麦 go!","#ff11ee00",30);
 
main();
 
//获取输入的场次信息
function getPlayEtc(){
    var playEtc = rawInput("请输入场次关键字(按照默认格式)", "周五");
    if (playEtc == null || playEtc.trim()=='') {
        alert("请输入场次信息!");
        return getPlayEtc();
    }
    console.log("手动输入的场次信息："+playEtc);
    return playEtc;
}
 
//获取输入票价信息
function getTicketPrice(){
    var ticketPrice = rawInput("请输入票价关键字(按照默认格式)", "1180");
    if (ticketPrice == null || ticketPrice.trim()=='') {
        alert("请输入票价信息!");
        return getTicketPrice();
     }
 
    console.log("手动输入的票价信息："+ticketPrice);
    return ticketPrice;
}
 
//获取输入的抢票时间
function getSellTime(){
    var sellTime = rawInput("请输入抢票时间(按照默认格式)", "03-18 11:00");
    if (sellTime == null || sellTime.trim()=='') {
        alert("请输入抢票时间!");
        return getSellTime();
     }
    return sellTime;
}
 
 
function main() {
    console.log("开始大麦抢票!");
    var preBook= text("已预约").findOne(2000)
    var preBook2 = textContains("已设置").exists()
    var isPreBook = preBook2!=null||preBook!=null;
    var playEtc;
    var ticketPrice;
    console.log("界面是否已预约："+isPreBook);
    if(!isPreBook){
        console.log("无预约信息，请输入抢票信息!");
        playEtc = getPlayEtc();
        ticketPrice = getTicketPrice();
    }
 
    var month;
    var day;
    var hour;
    var minute;
 
    var inputTime = getSellTime();
    //在这里使用输入的时间进行后续操作
    console.log("输入的抢票时间：" + inputTime);
    var times = inputTime.split(" ");
    var time1 = times[0]
    var time2 = times[1]
    var monthDay= time1.split("-");
    month = monthDay[0] - 1;
    day = monthDay[1];
    var hourMinute= time2.split(":");
    hour = hourMinute[0];
    minute=  hourMinute[1];
 
    // 设置开抢时间
    var year = new Date().getFullYear();
    var second = 0;
    var msecond = 0;
    var startTimestamp = new Date(year, month, day, hour, minute, second, msecond).getTime();
     // 减去 45ms 的网络延迟
    startTimestamp = startTimestamp - 45;
    var damaiTimestamp;
    var startTime = convertToTime(startTimestamp);
    console.log("开抢时间：", startTime);
    console.log("等待开抢...");
    // 循环等待
    while (true) {
        damaiTimestamp = getDamaiTimestamp();
 
        if (damaiTimestamp >= startTimestamp) {
            break;
        }
    }
 
    var realStartTime = getDamaiTimestamp();
    console.log("冲啊！！！");
    var goRes = id("trade_project_detail_purchase_status_bar_container_fl").findOne().click()
    console.log("点击了立即购票相关按钮："+goRes)
    
    if(!isPreBook){
        console.log('进入了，准备选择场次：'+playEtc);
        // 选择场次
        //textContains(playEtc).findOne().parent().click();
        // textContains(" "+playEtc+" ").waitFor();
        // textContains(" "+playEtc+" ").findOne().click();
        // console.log("选择场次");
        // ticketPrice = "¥"+ticketPrice
        
        // app.sendBroadcast("inspect_layout_bounds");
        // sleep(2000);
        // back();
        // sleep(2000);
        
        textContains("看台").waitFor();
        textContains(ticketPrice).findOne().click();
        console.log("选择票档");
    }
    //className("android.widget.TextView").text("确认").waitFor();
    // classNameStartsWith('android.widget.').text("确认").findOne().click();
    
    textContains("数量").waitFor();
    click(878,2263);
    console.log("点击确认");
    // while(className("android.widget.TextView").text("确认").exists()){
    //     console.log("确认按钮还在，继续点击");
    // }
    //等待立即支付按钮出现
    className("android.widget.Button").waitFor();
    var c = className("android.widget.Button").findOne().click();
    console.log("点击立即支付 "+c);  
    var t = getDamaiTimestamp() - realStartTime
    console.log("花费时间："+t)
    console.log("休息2秒,如果立即支付按钮还在再点击一次")
    //休息2秒
    sleep(2000)
    if(className("android.widget.Button").exists()){
        var c = className("android.widget.Button").findOne().click();
        console.log("继续点击立即支付 "+c);  
    }
    //立即支付按钮一直在一直支付
    // while(className("android.widget.Button").exists()){
    //     var c = className("android.widget.Button").findOne().click();
    //     sleep(100)
    //     console.log("继续点击立即支付 "+c);  
    // }
    
    console.log("结束时间："+convertToTime(getDamaiTimestamp()))
 
 
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
 
 
 
 //点击控件所在坐标
function btn_position_click(x) {
    if (x) {
       var b = x.bounds();
       print(b.centerX())
       print(b.centerY())
       var c = click(b.centerX(), b.centerY()) 
 
       console.log("点击是否成功："+c);
    }
}