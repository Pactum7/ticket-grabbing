// threads.start(function () {
//     id("md_buttonDefaultPositive").findOne().click()
// });
// alert("刷新dom!");
// get_less_than_tickets(800)
// function get_less_than_tickets(maxTicketPrice) {
//     var targetTickets = [];
//     textContains("¥").find().forEach(function (btn) {
//         // log(btn.text());
//         //正则判断如果btn.text()内容包含中文
//         if (btn.text().match(/[\u4e00-\u9fa5]/) != null) {
//             let match = btn.text().match(/\¥(\d+)/);
//             let amount;
//             if (match && (amount = parseInt(match[1])) < maxTicketPrice) {
//                 targetTickets.push(amount);
//             }

//         }
//     });
//     targetTickets.sort(function (a, b) {
//         return a - b;
//     });
//     log("符合条件:" + targetTickets);
//     return targetTickets;
// }

