// 检查无障碍服务是否已经启用，如果没有启用则跳转到无障碍服务启用界面，并等待无障碍服务启动；当无障碍服务启动后脚本会继续运行。
auto.waitFor();
//打开猫眼app
app.launchApp("猫眼");
openConsole();
console.setTitle("猫眼 go!", "#ff11ee00", 30);

//确认选票坐标，建议配置（不配置时仍会寻找“确认”按钮进行点击，但可能会出现点击失败的情况）
const ConfirmX = 878;
const ConfirmY = 2263;

//是否在测试调试
var isDebug = false;
//调试模式下的模拟票档自动选择的点击坐标
const debugTicketClickX = 207;
const debugTicketClickY = 1170;

main();

function main() {
    console.log("开始猫眼抢票!");
    var preBook = text("已 预 约").findOne(2000)
    var preBook2 = className("android.widget.TextView").text("已填写").findOne(2000)
    var isPreBook = preBook2 != null || preBook != null;
    console.log("界面是否已预约：" + isPreBook);
    if (!isPreBook && !isDebug) {
        console.log("无预约信息，请提前填写抢票信息!（若已经开票，请到票档界面使用MoYanMonitor.js）");
        return;
    }

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

    console.log("等待开抢...");
    while (true) {
        var but1 = classNameStartsWith('android.widget.').text("立即预订").exists();
        var but2 = classNameStartsWith('android.widget.').text("立即购票").exists();
        var but3 = classNameStartsWith('android.widget.').text("特惠购票").exists();
        //var but4= classNameStartsWith('android.widget.').text("缺货登记").exists();
        var result = but1 || but2 || but3;
        if (result) {
            var s;
            if (but1) {
                var s = classNameStartsWith('android.widget.').text("立即预订").findOne().click();
            } else if (but2) {
                var s = classNameStartsWith('android.widget.').text("立即购票").findOne().click();
            } else if (but3) {
                var s = classNameStartsWith('android.widget.').text("特惠购票").findOne().click();
            }
            break;
        }
    }
    console.log("①准备确认购票");

    //猛点，一直点到出现支付按钮为止
    for (let cnt = 0; cnt >= 0; cnt++) {
        if (isDebug) {
            //调试模式，模拟选择票档，模拟已预约后自动选择票档
            click(debugTicketClickX, debugTicketClickY);
        }

        //绝对坐标点击
        click(ConfirmX, ConfirmY);
        //文字查找按钮点击，避免未正确配置坐标导致的点击失败
        if(text("确认").exists()){
            text("确认").click();
        }
        sleep(50);
        if (className("android.widget.Button").exists()) {
            break;
        }
        if (cnt % 20 == 0) {
            log("已点击确认次数：" + cnt);
        }
    }
    console.log("②准备确认支付");

    if (!isDebug) {
        //调试模式时不点击支付按钮
        for (let cnt = 0; className("android.widget.Button").exists(); cnt++) {
            //直接猛点就完事了
            var c = className("android.widget.Button").findOne().click();
            sleep(50);
            if (cnt % 20 == 0) {
                log("已点击支付次数：" + cnt);
            }
        }
    }else{
        console.log("调试模式，不点击支付按钮");
    }

    console.log("结束")

}
