# TicketGrabbing
- 猫眼
- 纷玩岛（可购演唱会和猫眼有一定互补性，很多猫眼没有大麦有的在纷玩岛也能买，**已支持**）
  - 纷玩岛抢票周期长，不会秒空，比拼的是耐性，**更能发挥脚本自动化的优势**，今日实测五月天晚了十分钟去依然**成功抢到**655*2
- 大麦（可实现有票时主动发送邮件等消息通知，计划实现中，欢迎交流）

## 声明
本项目脚本仅模拟人工操作，解放双手，最大化减少购票繁杂流程所耗时间，提升购票几率，请支持官方，抵制黄牛囤票！

## 环境
基于AutoX.js(安卓平台上的JavaScript自动化工具)

源码地址：https://github.com/kkevsekk1/AutoX

官方文档：http://doc.autoxjs.com/

开发调试版本包：https://github.com/kkevsekk1/AutoX/releases/tag/6.5.8


## 更新进度
当前可用脚本：
- MaoYanGoNew.js 卡点抢票 设定抢票时间卡点进入抢票
- MaoYanMonitor.js 余票监控 设定目标最高票价，发现更低的票直接进入抢票（已支持观演人自动选择、**刷新自动点击**、成功**webhook通知**和**响铃通知**；无需配置绝对坐标，更加通用化）
- FenWanDaoGo.js 卡点抢票，余票不断重试

## 常见问题
建议在正式使用之前调试走完全流程

### 余票监控程序启动了之后没反应？
#### 情况一：autoxjs票档区域未解析
由于 AutoX.js 的原因，少数情况下中间票档区域刷新出来后没有触发界面元素分析，程序找不到中间的票档
**异常情况**：这种时候启动之后左上方控制台会有一行日志“请主动点击中间票档区域缺票登记刷新dom！！！”，点一个缺货登记，再关闭那个弹窗就 OK了，程序会自动继续跑

![image](https://github.com/Pactum7/ticket-grabbing/assets/45119228/3a7e536b-6f82-41e2-bf47-b2c599599978)

这才是**正常情况：**

![image](https://github.com/Pactum7/ticket-grabbing/assets/45119228/16ce51c3-27b1-4d21-a79e-f240d79ca7f8)


#### 情况二：autoxjs不同品牌系统页面解析结果有细微差异
分析日志和代码执行流程，根据实际情况微调即可



## 打赏
熬夜不易，如果对你有帮助，欢迎打赏，你的认可是更新的动力，感谢！

![image](https://github.com/Pactum7/ticket-grabbing/assets/45119228/ac984eb7-b000-4da3-9ebf-d74891b8aaa5)
