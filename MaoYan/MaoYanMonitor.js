

main();


//获取输入票价信息
function getMaxTicketPrice(){
    var ticketPrice = rawInput("请输入监控最高票价", "1000");
    if (ticketPrice == null || ticketPrice.trim()=='') {
        alert("请输入监控最高票价!");
        return getMaxTicketPrice();
    }

   
   return ticketPrice;
}


function main() {
    var maxTicketPrice = getMaxTicketPrice();
    console.log("监控最高票价："+maxTicketPrice);

    if(!textContains("看台").exists()){
        refresh_ticket_dom();
    }
    
    setInterval(()=>{
        cycleMonitor(maxTicketPrice);
    }, 5000);
   
   

}

function cycleMonitor(maxTicketPrice){
    //刷新余票信息
    textMatches(/202\d\-\d+\-\d+ 周.*/).findOne().click();
    //等待余票信息加载出来
    textContains("请选择票档").waitFor();
    log(maxTicketPrice)
    //获取符合条件的票档数组
    let targetTickets = get_less_than_tickets(maxTicketPrice)
    for(let amount of targetTickets){
        //抢一个
        doSubmit(amount);
        //TODO
        break;
    }
}

function doSubmit(amount){
    log("开冲一个："+amount);
    textContains("¥"+amount).findOne().click();
    textContains("数量").waitFor();
    //点击确认
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
    //等待调优（看支付调起失败时会有什么弹窗）立即支付按钮一直在一直支付
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

function refresh_dom(){
    threads.start(function(){
        sleep(20)
        //点确定关闭alert弹窗
        click(875,1420);
    });
    // rawInput("请输入场次关键字(按照默认格式)", "周六");
    alert("刷新dom!");
}

function refresh_ticket_dom(){
    let ticketBtnArr = [
        [215,1030],[505,1030],[830,1030],
        [215,1180],[505,1180],[830,1180],
        [215,1340],[505,1340],[830,1340]
    ];
    
    for(let i=0;i<ticketBtnArr.length;i++){
        click(ticketBtnArr[i][0], ticketBtnArr[i][1]);
        if(textContains('登记号码').exists()){
            click(942, 997);
            console.log("成功刷新dom");
            return;
        }
    }
    //三排票档都点完了还没搞出来弹窗那就直接弹个窗刷新dom
    refresh_dom();
}

function get_less_than_tickets(maxTicketPrice){
    var targetTickets = [];
    textContains("¥").find().forEach(function(btn){
        // log(btn.text());
        if(!btn.text().includes("缺货登记")){
            let match = btn.text().match(/\¥(\d+)/);
            let amount;
            if (match && (amount = parseInt(match[1])) < maxTicketPrice) {
                targetTickets.push(amount);
            }

        }
    });
    targetTickets.sort(function(a, b) {
        return a - b;
    });
    log(targetTickets);
    return targetTickets;
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

