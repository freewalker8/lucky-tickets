const puppeteer = require("puppeteer-core");
const config = require('./config');
const { getNumbersByPage } = require('./getPageNumbers');
const { getLotteryBettingPhase } = require('./getLotteryInformation');
const genLuckyNumbers = require('./genLuckyNumbers');
const { printLuckyNumbers } = require('./printLuckyNumbers');
const parsedArgs = require('./parseArgs');

(async () => {
  // 启动浏览器
  const browser = await puppeteer.launch(config);

  const page = await browser.newPage();

  // 访问历史开奖记录页面
  await page.goto('https://www.cwl.gov.cn/ygkj/wqkjgg/ssq/');

  await page.setViewport({width: 1080, height: 1024});

  // 获取当前期(投注)期号，warning：代码顺序不能变，因为下面分页爬取记录时修改了页码，这里需要从第一页获取当前投注期号
  const bettingPhase = await getLotteryBettingPhase(page);
  console.log('投注期数：', bettingPhase);

  // 爬取开奖号码，这里爬取1-5页的开奖记录
  const ticketNumbers = await getNumbersByPage(page, parsedArgs.pages);

  // 根据历史开奖号码生成自己的幸运号码
  const luckyNumbers = genLuckyNumbers(ticketNumbers, parsedArgs.tickets);

  // 打印自己的幸运号码，保存为图片
  await printLuckyNumbers(browser, luckyNumbers, bettingPhase);

  browser.close();

})();