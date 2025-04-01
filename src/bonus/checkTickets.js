/**
 * 检查投注号码是否中奖
 * @module checkTickets
 */

const fs = require('fs');
const path = require('path');

function resolvePath(filePath) {
  return path.resolve(__dirname, filePath);
}

function printFirework() {
  console.log(`
    \\ ***** /
     \\ *** /
      \\ * /
       \\*/
  `);
}

/**
 * 检查投注号码是否中奖
 * @param {Array} ticket 投注号码
 * @param {Object<{lotteryNumbers: Array<Number>, bonusOfLevel1: Number, bonusOfLevel2: Number, phase: String}>} lotteryInfo 开奖信息
 * @returns {Object<{ level: 0 | 1 | 2 |3 | 4 | 5 | 6, bonus: Number, message: String, ticket: Array<Number> }>} 中奖信息
 */
function checkTicket(ticket, lotteryInfo, isPrintMessage = true) {
  const { lotteryNumbers, bonusOfLevel1, bonusOfLevel2 } = lotteryInfo;
  const redBalls = ticket.slice(0, 6);
  const blueBall = ticket[6];
  const winningRedBalls = lotteryNumbers.slice(0, 6);
  const winningBlueBall = lotteryNumbers[6];

  // 中得红球数
  const matchedRedBalls = redBalls.filter(ball => winningRedBalls.includes(ball)).length;
  // 是否中得蓝球
  const isMatchedBlueBall = blueBall === winningBlueBall;

  let message = '';
  let bonus = 0;
  let level = 0; // 中得的几等奖，0表示未中奖
  const bonusInfo = `中奖投注信息： ${ticket}。`;

  // 6 + 1 中得一等奖
  if (matchedRedBalls === 6 && isMatchedBlueBall) {
    level = 1;
    bonus = bonusOfLevel1;
    message = `恭喜您中了一等奖！奖金为 ${bonusOfLevel1} 元。`.concat(bonusInfo);
    isPrintMessage && printFirework();
  } 
  // 6 + 0 中得二等奖
  else if (matchedRedBalls === 6) {
    level = 2;
    bonus = bonusOfLevel2;
    message = `恭喜您中了二等奖！奖金为 ${bonusOfLevel2} 元。`.concat(bonusInfo);
    isPrintMessage && printFirework();
  } 
  // 5 + 1 中得三等奖
  else if (matchedRedBalls === 5 && isMatchedBlueBall) {
    level = 3;
    bonus = 3000; // 假设三等奖奖金为3000元
    message = `恭喜您中了三等奖！奖金为 ${bonus} 元。`.concat(bonusInfo);
  } 
  // 5 + 0 || 4 + 1 中得四等奖
  else if (matchedRedBalls === 5 || (matchedRedBalls === 4 && isMatchedBlueBall)) {
    level = 4;
    bonus = 200; // 四等奖奖金为200元
    message = `恭喜您中了四等奖！奖金为 ${bonus} 元。`.concat(bonusInfo);
  } 
  // 4 + 0 || 3 + 1 中得五等将
  else if (matchedRedBalls === 4 || (matchedRedBalls === 3 && isMatchedBlueBall)) {
    level = 5;
    bonus = 10; // 五等奖奖金为10元
    message = `恭喜您中了五等奖！奖金为 ${bonus} 元。`.concat(bonusInfo);
  } 
  // 蓝球匹配，中得六等奖 
  else if (isMatchedBlueBall) {
    level = 6;
    bonus = 5; // 六等奖奖金为5元
    message = `恭喜您中了六等奖！奖金为 ${bonus} 元。`.concat(bonusInfo);
  } else {
    message = '很遗憾，您没有中奖。';
  }

  isPrintMessage && console.log(`${message}`);

  return { level, message, bonus, ticket };
}

/**
 * 检查投注号码是否中奖
 * @param {Object<{lotteryNumbers: Array<Number>, bonusOfLevel1: Number, bonusOfLevel2: Number, phase: String}>} lotteryInfo 开奖信息
 * @param {Array} tickets 投注号码
 */
function checkTickets(lotteryInfo, tickets) {
  let realTickets = tickets;
  if (!tickets) {
    const filePath = resolvePath('../../dist-tickets/latest_tickets.json');
    // console.log('filePath', filePath);
    // 读取文件内容
    try {
      realTickets = JSON.parse(fs.readFileSync(filePath, 'utf8')).ticketNumbers;
      // console.log('realTickets', realTickets);
    } catch (error) {
      console.error('读取文件失败：', error);
    }
  }
  const bonusTickets = []; // 保存中奖投注信息
  for (let i = 0; i < realTickets.length; i++) {
    const ticket = realTickets[i];
    const checkResult = checkTicket(ticket, lotteryInfo, false);
    // level > 0 表示中奖
    if (checkResult.level) {
      bonusTickets.push(checkResult);
    }    
  }

  if (bonusTickets.length > 0) {
    console.log('恭喜，您中奖了！');
    console.log('中奖详情：');
    let totalBonus = 0;
    bonusTickets.forEach(item => {
      const { bonus, level, message } = item;
      totalBonus += bonus; // 统计总奖金
      console.log(`${message}`);
      // 中了一等奖和二等奖，打印烟花
      if ([1, 2].includes(level)) {
        printFirework();
      }
    })
    console.log('------------------------------');
    console.log(`- 总奖金为 ${totalBonus} 元。 -`);
    console.log('------------------------------');
    console.log('***自开奖之日起60个自然日内，持中奖彩票到指定的地点兑奖，逾期未兑奖视为弃奖。***');
  } else {
    console.log('很遗憾，您没有中奖。');
  }
}

module.exports = {
  checkTicket,
  checkTickets,
};