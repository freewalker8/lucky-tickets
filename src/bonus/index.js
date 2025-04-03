const puppeteer = require("puppeteer-core");
const config = require('../config');
const parsedArgs = require('./parseArgs');
const { checkTickets } = require('./checkTickets');

 /**
  * 获取开奖信息
  * @param {Page} page puppeteer 页面实例
  * @param {String | Number} phase 开奖期号
  * @returns {Promise<{lotteryNumbers: Array<Number>, bonusOfLevel1: Number, bonusOfLevel2: Number, phase: String}>} 获取的开奖记录
  */
 async function getLotteryInformation (page, phase) {
  let matched = null;  
  
  // 查找指定期号的开奖记录，只查找最近的30期开奖信息，更多信息没用，已经过了兑奖期限
  const result = await page.$$eval('.ssq_table tbody tr', (rows, externalPhase) => {
    /**
     * 
     * @param {TrElement} tr tr Dom
     * @returns {lotteryNumbers: Array<Number>, bonusOfLevel1: Number, bonusOfLevel2: Number, phase: String} 开奖信息
     */
    function __searchLotteryInformation (tr) {
      const tdDoms = tr.querySelectorAll("td");
      // 获取开奖期号
      const phaseDom = tdDoms[0];
      const innerPhase = phaseDom.innerText;

      // 指定了开奖期号，如果期号不匹配，则返回 null
      if (externalPhase && innerPhase !== externalPhase.toString()) {
        return null;
      }

      const drawDate = tdDoms[1].innerText; // 开奖日期

      // 获取开奖号码
      const numbersDom = tr.querySelectorAll(".qiu .qiu-item");
      const lotteryNumbers = Array.from(numbersDom)
        .map((numberDom) => Number(numberDom.innerText));

      // 获取一等奖金额
      const bonusOfLevel1Dom = tdDoms[4];
      const bonusOfLevel1 = Number(bonusOfLevel1Dom.innerText);
      // 获取二等奖奖金额
      const bonusOfLevel2Dom = tdDoms[6];
      const bonusOfLevel2 = Number(bonusOfLevel2Dom.innerText);

      return { lotteryNumbers, bonusOfLevel1, bonusOfLevel2, phase: innerPhase, drawDate };
    }

    // 未传递phase，则获取最新一期开奖记录
    if (!externalPhase) {
      return __searchLotteryInformation(rows[0]);
    }
    // 传递了phase，则获取指定期号的开奖记录
    const matched = rows
      .map(tr => {
        return __searchLotteryInformation(tr);
      })
      .filter(item => item !== null);

    if (matched.length !== 1) {
      throw new Error('No valid lottery information found');
    }

    return matched[0]
  }, phase);

  
  // console.log('result', result);  
  return result;
};


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
    console.log("开奖期号：", parsedArgs.phase || `${lotteryInfo.phase}(最新一期)`);
    console.log("开奖日期：", lotteryInfo.drawDate);
    console.log("开奖号码：", lotteryInfo.lotteryNumbers.join(","));
    checkTickets(lotteryInfo);
  }
 
  browser.close();
})();