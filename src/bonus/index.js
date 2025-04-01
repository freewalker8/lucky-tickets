const puppeteer = require("puppeteer-core");
const config = require('../config');
const parsedArgs = require('./parseArgs');
const { checkTickets } = require('./checkTickets');

/**
 * 
 * @param {TrElement} tr tr Dom
 * @param {String|Number} phase
 * @returns {lotteryNumbers: Array<Number>, bonusOfLevel1: Number, bonusOfLevel2: Number, phase: String} 开奖信息
 */
// function _searchLotteryInformation (tr, phase) {
//   console.log('tr', tr);
//   const tdDoms = tr.querySelectorAll("td");
//   // 获取开奖期号
//   const phaseDom = tdDoms[0];
//   const innerPhase = phaseDom.innerText;

//   // 指定了开奖期号，如果期号不匹配，则返回 null
//   if (phase && innerPhase !== phase.toString()) {
//     return null;
//   }

//   // 获取开奖号码
//   const numbersDom = tr.querySelectorAll(".qiu .qiu-item");
//   const lotteryNumbers = Array.from(numbersDom)
//     .map((numberDom) => Number(numberDom.innerText));

//   // 获取一等奖金额
//   const bonusOfLevel1Dom = tdDoms[4];
//   const bonusOfLevel1 = Number(bonusOfLevel1Dom.innerText);
//   // 获取二等奖奖金额
//   const bonusOfLevel2Dom = tdDoms[6];
//   const bonusOfLevel2 = Number(bonusOfLevel2Dom.innerText);

//   return { lotteryNumbers, bonusOfLevel1, bonusOfLevel2, phase };
// }

 /**
  * 获取开奖信息
  * @param {Page} page puppeteer 页面实例
  * @param {String | Number} phase 开奖期号
  * @returns {Promise<{lotteryNumbers: Array<Number>, bonusOfLevel1: Number, bonusOfLevel2: Number, phase: String}>} 获取的开奖记录
  */
 async function getLotteryInformation (page, phase) {
  let matched = null;
  // 未传递phase，则获取最新一期开奖记录
  if (!phase) {
    // 获取最新一期开奖记录
    matched = await page.$eval(".ssq_table tbody tr", (tr) => {
      // 在这里直接实现 _searchLotteryInformation 的逻辑
      const tdDoms = tr.querySelectorAll("td");
      const phaseDom = tdDoms[0];
      const innerPhase = phaseDom.innerText; // 开奖期号

      const drawDate = tdDoms[1].innerText; // 开奖日期
      
      const numbersDom = tr.querySelectorAll(".qiu .qiu-item");
      // 开奖号码
      const lotteryNumbers = Array.from(numbersDom).map((numberDom) =>
        Number(numberDom.innerText)
      );
      
      const bonusOfLevel1Dom = tdDoms[4];
      const bonusOfLevel1 = Number(bonusOfLevel1Dom.innerText); // 一等奖奖金
      const bonusOfLevel2Dom = tdDoms[6];
      const bonusOfLevel2 = Number(bonusOfLevel2Dom.innerText); // 二等奖奖金
      
      return { lotteryNumbers, bonusOfLevel1, bonusOfLevel2, phase: innerPhase, drawDate };
    });
    return matched;
  } else {
    // 查找指定期号的开奖记录，只查找最近的30期开奖信息，更多信息没用，已经过了兑奖期限
    const allRows = await page.$$eval('.ssq_table tbody tr', (rows, externalPhase) => {
      return rows.map(tr => {
        const tdDoms = tr.querySelectorAll("td");
        const phaseDom = tdDoms[0];
        const innerPhase = phaseDom.innerText;
        
        // 如果期号不匹配，返回 null
        if (externalPhase && innerPhase !== externalPhase.toString()) {
          return null;
        }

        const drawDate = tdDoms[1].innerText; // 开奖日期
        
        const numbersDom = tr.querySelectorAll(".qiu .qiu-item");
        const lotteryNumbers = Array.from(numbersDom).map((numberDom) =>
          Number(numberDom.innerText)
        );
        
        const bonusOfLevel1Dom = tdDoms[4];
        const bonusOfLevel1 = Number(bonusOfLevel1Dom.innerText);
        const bonusOfLevel2Dom = tdDoms[6];
        const bonusOfLevel2 = Number(bonusOfLevel2Dom.innerText);
        
        return { lotteryNumbers, bonusOfLevel1, bonusOfLevel2, phase: innerPhase, drawDate };
      });
    }, phase);
    // 过滤掉 null 并找到匹配项
    matched = allRows.filter(item => item !== null);
    // console.log('matched', matched);
    // 确保返回的是单个结果
    if (matched.length !== 1) {
      throw new Error('No valid lottery information found');
    }
    return matched[0];
  }
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
    console.log("开奖期号：", parsedArgs.phase || "最新一期");
    console.log("开奖日期：", lotteryInfo.drawDate);
    console.log("开奖号码：", lotteryInfo.lotteryNumbers.join(","));
    checkTickets(lotteryInfo);
  }
 
  browser.close();
})();