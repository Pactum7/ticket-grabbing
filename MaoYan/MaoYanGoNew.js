//  // 检查无障碍服务是否已经启用，如果没有启用则跳转到无障碍服务启用界面，并等待无障碍服务启动；当无障碍服务启动后脚本会继续运行。
//  auto.waitFor();
//  //打开猫眼app
//  app.launchApp("猫眼");
openConsole();
console.setTitle("猫眼 go!","#ff11ee00",30);

//统计绝对坐标
//关闭Alert弹窗坐标
const closeAlertX = 875;
const closeAlertY = 1420;
//确认选票坐标
const ConfirmX = 878;
const ConfirmY = 2263;
//选票档界面+1份坐标
const pulsOneX = 976;
const pulsOneY = 2144;
//缺票登记坐标
const closeTicketRegisterX = 942;
const closeTicketRegisterY = 997;
//四排票档坐标
const ticketBtnArr = [
    [215,1030],[505,1080],[830,1080],
    [215,1250],[505,1250],[830,1250],
    [215,1400],[505,1400],[830,1400],
    [215,1620],[505,1620],[830,1620]
];

main();

//获取输入的场次信息
function getPlayEtc(){
   var playEtc = rawInput("请输入场次关键字(按照默认格式)", "周六");
   if (playEtc == null || playEtc.trim()=='') {
       alert("请输入场次信息!");
       return getPlayEtc();
   }
   console.log("手动输入的场次信息："+playEtc);
   return playEtc;
}

//获取输入票价信息
function getTicketPrice(){
   var ticketPrice = rawInput("请输入票价关键字(按照默认格式)", "380");
   if (ticketPrice == null || ticketPrice.trim()=='') {
       alert("请输入票价信息!");
       return getTicketPrice();
    }

   console.log("手动输入的票价信息："+ticketPrice);
   return ticketPrice;
}

//获取输入的抢票时间
function getSellTime(){
   var sellTime = rawInput("请输入抢票时间(按照默认格式)", "03-19 15:00");
   if (sellTime == null || sellTime.trim()=='') {
       alert("请输入抢票时间!");
       return getSellTime();
    }
   return sellTime;
}


function main() {
   console.log("开始猫眼抢票!");
   var preBook= text("已 预 约").findOne(2000)
   var preBook2 = className("android.widget.TextView").text("已填写").findOne(2000)
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
   while(true){
       var but1 = classNameStartsWith('android.widget.').text("立即预订").exists();
       var but2 = classNameStartsWith('android.widget.').text("立即购票").exists();
       var but3= classNameStartsWith('android.widget.').text("特惠购票").exists();
       //var but4= classNameStartsWith('android.widget.').text("缺货登记").exists();
       var result = but1||but2||but3;
       if(result){
           var s;
           if(but1){
               var s =classNameStartsWith('android.widget.').text("立即预订").findOne().click();
           }else if(but2){
               var s =classNameStartsWith('android.widget.').text("立即购票").findOne().click();
           }else if(but3){
               var s =classNameStartsWith('android.widget.').text("特惠购票").findOne().click();
           }
           console.log("点击了立即购票相关按钮："+s)
           break;
       }
   }
   if(!isPreBook){
        //等待主区域加载出来
        textContains("请选择票档").waitFor();
       
       // 选择场次
       //textContains(playEtc).findOne().parent().click();
       // textContains(" "+playEtc+" ").waitFor();
       // textContains(" "+playEtc+" ").findOne().click();
       // console.log("选择场次");
       // ticketPrice = "¥"+ticketPrice
       

       //如果票档区域没加载出来就执行刷新 TODO 调试的时候开启
       if(!textContains("看台").exists()){
            refresh_ticket_dom();
       }
       textContains("看台").waitFor();
       textContains(ticketPrice).findOne().click();
       console.log("选择票档");
       textContains("数量").waitFor();
   }
   //className("android.widget.TextView").text("确认").waitFor();
   // classNameStartsWith('android.widget.').text("确认").findOne().click();
    for(let cnt = 0; cnt >= 0; cnt++){
        //猛点，一直点到出现支付按钮为止
        click(ConfirmX,ConfirmY);
        sleep(50);
        if(className("android.widget.Button").exists()){
            break;
        }
        if(cnt % 20 == 0){
            log("已点击确认次数："+cnt);
        }
    }
    
    for(let cnt = 0; className("android.widget.Button").exists(); cnt++){
        //直接猛点就完事了
        var c = className("android.widget.Button").findOne().click();
        sleep(50);
        if(cnt % 20 == 0){
            log("已点击支付次数："+cnt);
        }
    }
   
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
        click(closeAlertX,closeAlertY);
    });
    // rawInput("请输入场次关键字(按照默认格式)", "周六");
    alert("刷新dom!");
    log("alert刷新dom")
}

function refresh_ticket_dom(){
    for(let i=0;i<ticketBtnArr.length;i++){
        click(ticketBtnArr[i][0], ticketBtnArr[i][1]);
        if(textContains('登记号码').exists()){
            click(closeTicketRegisterX, closeTicketRegisterY);
            console.log("成功刷新dom");
            return;
        }
    }
    //三排票档都点完了还没搞出来弹窗那就直接弹个窗刷新dom
    refresh_dom();
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

