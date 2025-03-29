 /**
  * 获取当前页数的开奖号码
  * @param {Page} page puppeteer 页面实例
  * @returns {Promise<Array<Array<number>>>} 获取的开奖记录
  */
 async function getPageNumbers (page) {
  const pageNumbers = await page.$eval(".ssq_table tbody", (el) => {
    const row = el.querySelectorAll("tr .qiu");
    return Array.from(row)
      .map((td) => {
        const numbersDom = td.querySelectorAll(".qiu-item");
        return Array.from(numbersDom)
          .map((numberDom) => Number(numberDom.innerText));
      });
  });
  return pageNumbers;
};

const _delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 分页获取开奖记录
 * @param {Page} page puppeteer 页面实例
 * @param {number} pages 获取的页数
 * @param {string} nextPageSelector 下一页按钮选择器
 * @returns {Promise<Array<Array<number>>>} 获取的开奖记录
 */
async function getNumbersByPage (page, pages = 1, nextPageSelector = ".pagebar .layui-laypage-next") {
    const totalTicketsNumbers = [];
    for (let i = 1; i <= pages; i++) {
        await page.waitForSelector(nextPageSelector);
        // 获取开奖记录
        const pageNumbers = await getPageNumbers(page);
        totalTicketsNumbers.push(...pageNumbers);
        // 停500ms再访问下一页数据，避免高频访问IP被封
        await _delay(500); // 等待 500ms
        // 访问下一页数据
        await page.click(nextPageSelector);
    }

    return totalTicketsNumbers;
}

module.exports = {
    getPageNumbers,
    getNumbersByPage
}