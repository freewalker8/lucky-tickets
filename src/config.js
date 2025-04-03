/**
 * puppeteer 启动配置
 */

module.exports = {
    // 本地浏览器路径
    executablePath: "C:\\Users\\stone\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe",
    // 可视化模式（调试时建议开启，设置为false）
    headless: true,
    // 是否开启调试模式
    // devtools: true,
    // 追踪的彩票号，有值时生成的投注号码需包含追投号码
    trackingTickets: [
        [5, 6, 8, 12, 25, 29, 7],
        [6, 8, 12, 19, 25, 29, 6],
    ],
    // 存储投注记录的文件名
    ticketsFileName: 'luckyNumbers'
}