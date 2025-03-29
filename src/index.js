const puppeteer = require("puppeteer-core");
const config = require('./config');
const { getNumbersByPage } = require('./getPageNumbers');
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

  // 爬取开奖号码，这里爬取1-5页的开奖记录
  const ticketNumbers = await getNumbersByPage(page, parsedArgs.pages);

  // 根据历史开奖号码生成自己的幸运号码
  const luckyNumbers = genLuckyNumbers(ticketNumbers, parsedArgs.tickets);

  // 打印自己的幸运号码，保存为图片
  await printLuckyNumbers(browser, luckyNumbers);

  browser.close();

})();