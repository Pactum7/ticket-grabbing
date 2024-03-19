// var but1 = className("android.widget.TextView").text("立即预订").exists();
// var but2 = className("android.widget.TextView").text("立即购票").exists();
// var but3= className("android.widget.TextView").text("特惠购票").exists();
// console.log("but1:"+but1);
// console.log("but2:"+but2);
// console.log("but3:"+but3);

// if(className("android.widget.TextView").text("立即预订").exists()){
//     console.log("ok的");
// }else{
//     console.log("没找到");
// }
// bounds(0,218,1080,2356).clickable().click()
// className("android.widget.FrameLayout").depth(9).findOne().click()
// click("￥480")

// var playEtc = '周六';
// console.log(textContains(playEtc).exists());
// textContains(playEtc).findOne().click();

// app.sendBroadcast("inspect_layout_bounds");
// sleep(2000);
// back();
// sleep(2000);
// let windowRoot = auto.rootInActiveWindow;
// log(windowRoot);

// console.log(textContains("周六").exists());
// console.log(textContains("480").exists());
// console.log(textContains("数量").exists());
// console.log(textContains("确认").exists());
// console.log(textContains("确").exists());
// console.log(textContains("认").exists());
// console.log(descContains("确认").exists());
// console.log(descContains("确").exists());
// click(878,2263);

// if(className("android.widget.FrameLayout").textContains(" "+playEtc+" ").exists()){
//     console.log("ok的");
// }else{
//     console.log("没找到");
// }
// className("android.widget.FrameLayout").textContains(" "+playEtc+" ").findOne().parent().click();
// console.log('点击了');
id("trade_project_detail_purchase_status_bar_container_fl").waitFor();
console.log("点点点点");
// click(878,2263);
Tap(878,2263);
id("trade_project_detail_purchase_status_bar_container_fl").findOne().click()
console.log(textContains("立即预订").exists())
console.log(id("trade_project_detail_purchase_status_bar_container_fl").exists())
