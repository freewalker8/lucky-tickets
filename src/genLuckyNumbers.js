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

    // 蓝球
    const blueNumber = _pickNumber(flattenedBlueNumbers);
    ticket.push(blueNumber);
  }

  return ticket;
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
    luckyNumbers.push(...trackingTickets);
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