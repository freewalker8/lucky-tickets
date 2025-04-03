/**
 * 获取开奖信息
 * @param {Page} page puppeteer 页面实例
 * @param {String | Number} phase ? 可选参数，开奖期号
 * @returns {Promise<{lotteryNumbers: Array<Number>, bonusOfLevel1: Number, bonusOfLevel2: Number, phase: String}>} 获取的开奖记录
 */
async function getLotteryInformation(page, phase) {
  // 查找指定期号的开奖记录，只查找最近的30期开奖信息，更多信息没用，已经过了兑奖期限
  const result = await page.$$eval(
    ".ssq_table tbody tr",
    (rows, externalPhase) => {
      /**
       *
       * @param {TrElement} tr tr Dom
       * @returns {lotteryNumbers: Array<Number>, bonusOfLevel1: Number, bonusOfLevel2: Number, phase: String} 开奖信息
       */
      function __searchLotteryInformation(tr) {
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
        const lotteryNumbers = Array.from(numbersDom).map((numberDom) =>
          Number(numberDom.innerText)
        );

        // 获取一等奖金额
        const bonusOfLevel1Dom = tdDoms[4];
        const bonusOfLevel1 = Number(bonusOfLevel1Dom.innerText);
        // 获取二等奖奖金额
        const bonusOfLevel2Dom = tdDoms[6];
        const bonusOfLevel2 = Number(bonusOfLevel2Dom.innerText);

        return {
          lotteryNumbers,
          bonusOfLevel1,
          bonusOfLevel2,
          phase: innerPhase,
          drawDate,
        };
      }

      // 未传递phase，则获取最新一期开奖记录
      if (!externalPhase) {
        return __searchLotteryInformation(rows[0]);
      }
      // 传递了phase，则获取指定期号的开奖记录
      const matched = rows
        .map((tr) => {
          return __searchLotteryInformation(tr);
        })
        .filter((item) => item !== null);

      if (matched.length !== 1) {
        throw new Error("No valid lottery information found");
      }

      return matched[0];
    },
    phase
  );

  // console.log('开奖信息：', result, phase);
  return result;
}

/**
 * 获取下一期期号
 * @param {Page} page puppeteer 页面实例
 * @returns {Promise<Number>} 下一期期号
 */
async function getLotteryBettingPhase(page) {
  const { phase } = await getLotteryInformation(page);
  const bettingPhase = Number(phase) + 1;
  return bettingPhase;
}

module.exports = {
  getLotteryInformation,
  getLotteryBettingPhase
};
