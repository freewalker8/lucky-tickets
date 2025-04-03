const puppeteer = require("puppeteer-core");
const config = require('../config');
const parsedArgs = require('./parseArgs');
const { checkTickets } = require('./checkTickets');
const { getLotteryInformation } = require('../getLotteryInformation');

(async () => {
  // 启动浏览器
  const browser = await puppeteer.launch(config);

  const page = await browser.newPage();

  // 访问历史开奖记录页面
  await page.goto('https://www.cwl.gov.cn/ygkj/wqkjgg/ssq/');

  await page.setViewport({width: 1080, height: 1024});

  // 爬取开奖号码
  const lotteryInfo = await getLotteryInformation(page, parsedArgs.phase);

  if (!lotteryInfo) {
    console.log(`未找到期号为 ${parsedArgs.phase} 的开奖记录，只查找最近30期的开奖信息`);
    return;``
  } else {
    const phase = parsedArgs.phase || lotteryInfo.phase;
    console.log("开奖期号：", parsedArgs.phase || `${lotteryInfo.phase}(最新一期)`);
    console.log("开奖日期：", lotteryInfo.drawDate);
    console.log("开奖号码：", lotteryInfo.lotteryNumbers.join(","));
    checkTickets(lotteryInfo, phase.toString());
  }
 
  browser.close();
})();