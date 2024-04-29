// 检查无障碍服务是否已经启用，如果没有启用则跳转到无障碍服务启用界面，并等待无障碍服务启动；当无障碍服务启动后脚本会继续运行。
auto.waitFor();
//打开猫眼app
app.launchApp("票星球");
openConsole();
console.setTitle("票星球 go!", "#ff11ee00", 30);

//确认选票坐标，建议配置（不配置时仍会寻找“确认”按钮进行点击，但可能会出现点击失败的情况）
const ConfirmX = 878;
const ConfirmY = 2263;

//是否在测试调试
var isDebug = true;
//调试模式下的模拟票档自动选择的点击坐标
const debugTicketClickX = 310;
const debugTicketClickY = 880;

main();

function main() {
    console.log("开始票星球抢票!");

    console.log("等待开抢，请务必完成抢票准备...");
    while (true) {
        var but1 = desc("立即预订").exists();
        var but2 = desc("立即购票").exists();
        var but3 = desc("特惠购票").exists();
        var but4 = desc("立即购买").exists();
        var result = but1 || but2 || but3 || but4;
        if (result) {
            if (but1) {
                desc("立即预订").findOne().click();
            } else if (but2) {
                desc("立即购票").findOne().click();
            } else if (but3) {
                desc("特惠购票").findOne().click();
            } else if (but4) {
                desc("立即购买").findOne().click();
            }
            break;
        }
    }
    console.log("①准备确认购票");

    //猛点，一直点到出现支付按钮为止
    for (let cnt = 1; cnt >= 0; cnt++) {
        if (isDebug) {
            //调试模式，模拟选择票档，模拟已预约后自动选择票档
            click(debugTicketClickX, debugTicketClickY);
        }

        //绝对坐标点击
        click(ConfirmX, ConfirmY);
        //文字查找按钮点击，避免未正确配置坐标导致的点击失败
        if(desc("下一步").exists()){
            desc("下一步").click();
        }
        sleep(20);
        if (className("android.widget.Button").desc("去支付").exists()) {
            break;
        }
        if (cnt % 20 == 0) {
            log("已点击确认次数：" + cnt);
        }
    }
    console.log("②准备确认支付");

    if (!isDebug) {
        //调试模式时不点击支付按钮
        for (let cnt = 0; className("android.widget.Button").desc("去支付").exists(); cnt++) {
            //直接猛点就完事了
            var c = className("android.widget.Button").desc("去支付").findOne().click();
            sleep(20);
            if (cnt % 20 == 0) {
                log("已点击支付次数：" + cnt);
            }
        }
    }else{
        console.log("调试模式，不点击支付按钮");
    }

    console.log("结束")

}
