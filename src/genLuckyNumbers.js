const { trackingTickets } = require('./config');

/**
 * 将开奖记录展开，分别放置到红球组和蓝球组
 * @param {Array<Array<Number>>} pageNumbers 开奖记录
 * @returns {[flattenedRedNumbers: Number[], flattenedBlueNumbers: Number[]]} flattenedNumbers
 */
function _flattenNumbers(pageNumbers) {
  const flattenedRedNumbers = [];
  const flattenedBlueNumbers = [];

  pageNumbers.forEach(pageNumber => {
    flattenedRedNumbers.push(...pageNumber.slice(0, 6));
    flattenedBlueNumbers.push(...pageNumber.slice(6));
  });

  return [flattenedRedNumbers, flattenedBlueNumbers];
}

/**
 * 从数组中随机选择一个元素
 * @param {Array<Number>} flattenedNumbers 待选数组
 * @returns {Number} 随机选择的元素
 */
function _pickNumber(flattenedNumbers = []) {
  const index = Math.floor(Math.random() * flattenedNumbers.length);
  return flattenedNumbers[index];
}

/**
 * 生成一个投注号码
 * @param {Array<Number>} flattenedRedNumbers 红球资源池
 * @param {Array<Number>} flattenedBlueNumbers 蓝球资源池
 * @returns {Array<Number>} 投注号码
 */
function _genOneTicket(flattenedRedNumbers, flattenedBlueNumbers) {
  const ticket = [];
  const cacheNumbers = [];

  while (ticket.length < 7) {
    // 红球
    if (ticket.length < 6) {
      const redNumber = _pickNumber(flattenedRedNumbers);
      // 确保没有重复号码
      if (cacheNumbers.indexOf(redNumber) === -1) {
        ticket.push(redNumber);
        cacheNumbers.push(redNumber);
      }
      continue;
    }

    // 红球生成完毕，对红球排序
    ticket.sort((a, b) => a - b);

    // 蓝球
    const blueNumber = _pickNumber(flattenedBlueNumbers);
    ticket.push(blueNumber);
  }

  return ticket;
}

/**
 * 检查每期追投的投注号码红球和蓝球号码格式是否正确并对红球排序
 * @param {Array<Number>} trackingTicket 每期追投的投注号码
 * @returns {Array<Number>} 排好序的红球和蓝球号码
 */
function _checkTrckingTicketAndSort(trackingTicket) {
  const ticket = [...trackingTicket];
  // 取出篮球号码
  const blueNumber = ticket.pop();
  // 红球号码
  const redNumbers = ticket;
  // 检查每期追投的投注号码红球格式是否正确
  if (!redNumbers.every(num => typeof num === 'number' && num >= 1 && num <= 33)) {
    console.log('红球号码为1-33的数字');
    const errMsg = `每期追投的投注号码红球号码格式不正确，请检查config.js中的trackingTickets配置，非法红球号码：${redNumbers}，非法投注号码信息：${ticket}`;
    throw new Error(errMsg);
  }
  
  // 检查篮球号码格式是否正确
  if (typeof blueNumber !== 'number' || blueNumber < 1 || blueNumber > 16) {
    console.log('蓝球号码为1-16的数字');
    const errMsg = `每期追投的投注号码蓝球号码格式不正确，请检查config.js中的trackingTickets配置，非法蓝球号码：${blueNumber}，非法投注号码信息：${ticket}`;
    throw new Error(errMsg);
  }
  
  // 对红球排序
  redNumbers.sort((a, b) => a - b);

  // 返回排序后的红球和蓝球号码
  return [...redNumbers, blueNumber];
}

/**
 * 根据历史开奖记录生成随机的幸运投注号码
 * @param {Array<Array<Number>>} pageNumbers 历史开奖记录
 * @param {Number} count 投注数
 * @returns {Array<Array<Number>>} 幸运投注号码
 */
function genLuckyNumbers(pageNumbers, count) {
  const luckyNumbers = [];
  const [flattenedRedNumbers, flattenedBlueNumbers] = _flattenNumbers(pageNumbers);
  // 随机生成的投注数
  let autoGenCount = count;

  // 设置了每期追投的投注号码
  if (Array.isArray(trackingTickets) && trackingTickets.length) {
    trackingTickets.forEach(ticket => {
      // 检查每期追投的投注号码红球和蓝球号码格式是否正确并对红球排序
      const validTicket = _checkTrckingTicketAndSort(ticket);
      // 将追投的投注号码压入结果数组中
      luckyNumbers.push(validTicket);
    });
    autoGenCount = count - trackingTickets.length;

    if (trackingTickets.length >= count) {
      console.warn('warning:每期追投的投注号码数量大于总投注数，不会生成随机投注号码');
      return luckyNumbers;
    }
  }

  // console.log('flattenedRedNumbers, flattenedBlueNumbers', flattenedRedNumbers, flattenedBlueNumbers);
  for (let i = 0; i < autoGenCount; i++) {
    luckyNumbers.push(_genOneTicket(flattenedRedNumbers, flattenedBlueNumbers));
  }
  return luckyNumbers;
}

module.exports = genLuckyNumbers;