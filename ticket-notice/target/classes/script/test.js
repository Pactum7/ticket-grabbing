// //截图
// var img = captureScreen()
// let height = img.getHeight()
// let width = img.getWidth()
// log("0 "+0.75 * height + " " + width + " " + 0.25*height)
// let newImg = images.clip(img, 0, 0.75 * height, width, 0.25*height);
// // newImg = images.resize(newImg, [device.width, 0.25*device.height])
// // newImg = images.scale(newImg, 20, 20)
// //文字识别
// let res = paddle.ocrText(newImg, 4, false);
// const haveTicket = res.includes('立即购买') || res.includes('立即购票') || res.includes('立即抢购') || res.includes('立即预订');
// log(res)
// images.save(img, "/storage/emulated/0/Download/new_image.png");

// log("是否有票：" + haveTicket)
// newImg.recycle();


var img = captureScreen()
// log(paddle.ocrText(img))
let height = img.getHeight()
let width = img.getWidth()
let newImg = images.clip(img, 0, 0.75 * height, width, 0.25*height);
//识别中文
let result = gmlkit.ocr(newImg, "zh");
log(result.text)