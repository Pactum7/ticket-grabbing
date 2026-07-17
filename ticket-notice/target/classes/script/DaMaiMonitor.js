//邮件通知，不配置则不发送邮件提醒
const myEmailAddr = "878284196@qq.com"
//是否响铃提醒
const isRingingBell = true
//云端邮件通知接口密钥
const emailSecret = "RVKqlRa2zM6qbL9u"

let sendCount = 0; // 已发送邮件的计数器
const maxSendBeforePause = 2; // 在暂停前最多发送的邮件数
const pauseDuration = 600000; // 暂停时间，10分钟，用毫秒表示

main()

function main() {

    
    //请求横屏截图
    requestScreenCapture(true);
    while(true){
        //下拉刷新
        swipe(500, 500, 500, 1300, 600)
        //稍作等待
        sleep(500)
        //截图
        var img = captureScreen();
        //文字识别
        // let res = paddle.ocrText(img);
        // let height = img.getHeight()
        // let width = img.getWidth()
        // let newImg = images.clip(img, 0, 0.75 * height, width, 0.25*height);
        let res = gmlkit.ocr(img, "zh").text
        log(res)
        const haveTicket = res.includes('立即购买') || res.includes('立即购票') || res.includes('立即抢购') || res.includes('立即预订');
        log("是否有票：" + haveTicket);
        if(haveTicket){
            if(isRingingBell){
                //播放提示音
                ringingBell(0);
            }
            if(myEmailAddr && myEmailAddr.length > 5){
                //发送邮件
                postEmail(myEmailAddr, "大麦余票监控通知！", "当前监控到有票，快冲！")
            }
        }
        //等待下一个轮询周期
        sleep(randomInterval(5000, 10000))
    }
}

function postEmail(toAddr, subject, content){
    if(sendCount >= maxSendBeforePause){
        log("已达到发送邮件上限，暂停发送邮件")
        return
    }
    try{
        let res = http.postJson("http://192.168.1.7:8080/notice/email", {
            "addr": toAddr,
            "title": subject,
            "content": content
        }, {
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authentication": emailSecret
            }
        });
        if(res.statusCode == 200){
            sendCount++
            log("邮件发送成功")
        }else{
            log("邮件发送失败：" + res.body.string())
        }
    
        // 如果达到了限定的发送次数，设置暂停
        if (sendCount >= maxSendBeforePause) {
            console.log(`已发送${maxSendBeforePause}封邮件，现在开始暂停10分钟。`);
            setTimeout(() => {
                console.log("暂停结束，可以继续发送邮件。");
                sendCount = 0; // 重置邮件发送计数器
            }, pauseDuration);
        }
    }catch(e){
        console.error("邮件发送失败:", error.message);
    }
}

function randomInterval(min, max) {
    return Math.random() * (max - min) + min;
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
