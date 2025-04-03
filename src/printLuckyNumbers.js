const dayjs = require("dayjs");
const path = require("path");
const fs = require("fs");
const { ticketsFileName } = require("./config");

const BASE_PATH = "./dist-tickets";

/**
 * 获取图片的保存路径，路径不存在时就创建对应的文件夹
 * @param {String} filePath 图片的保存路径，相对于项目根目录
 * @returns {String} 图片保存路径
 */
function _reslovePath(filePath) {
  let realPath = "";
  if (path.isAbsolute(filePath)) {
    realPath = filePath;
  } else if (filePath.startsWith("./")) {
    realPath = path.resolve(__dirname, `../${filePath.slice(2)}`);
  } else {
    realPath = path.resolve(__dirname, `../${filePath}`);
  }

  // 判断是否存在指定的保存路径文件夹，不存在就创建
  if (!fs.existsSync(realPath)) {
    fs.mkdirSync(realPath);
  }

  return realPath;
}

/**
 * 获取图片的保存路径和图片名称
 * @param {String} bettingPhase 投注期号
 * @param {String} baseName ? 图片的基础名称
 * @param {String} basePath ? 图片的保持路径，相对于根目录
 * @returns {String} 文件保存路径，最后一个路径是文件名称
 */
function _getScreenshotPathAndName(
  bettingPhase,
  baseName = "luckyNumbers",
  basePath = BASE_PATH
) {
  return `${_reslovePath(basePath)}/${baseName}_${bettingPhase}.png`;
}

async function _saveScreenShot(browser, ticketNumbers, bettingPhase) {
  const newPage = await browser.newPage();

  const template = ticketNumbers
    .map((groupNumbers) => {
      const innerHtml = groupNumbers
        .map((number, index) => {
          return `<td class="${index < 6 ? "blue" : "red"}">
            ${number}
            </span>`;
        })
        .join("");
      return `<tr>
            ${innerHtml}
        </div>`;
    })
    .join("");

  await newPage.setViewport({ width: 450, height: ticketNumbers.length * 50 + 200 });

  await newPage.setContent(`
    <html>
        <body>
            <h1 class="title">Lucky Numbers</h1>
            <p class="phase">投注期号：${bettingPhase}</p>
            <table class="table">
                <thead>
                    <tr>
                        <th class="blue">篮球</th>
                        <th>红球</th>
                    </tr>
                </thead>
                <tbody>
                    ${template}
                </tbody>
            </table>
        </body>
        <style>
            body {
                width: 450px;
                height: 100%;
                margin: 0;
                overflow: hidden;
                background-color: #f5f5f5;
                .title {
                    text-align: center;
                    margin-top: 20px;
                }
                .phase {
                  text-align: center;
                }
                .table {
                    width: 450px; margin: 10px auto; text-align: center;
                    thead {
                        tr {
                            width: 450px; margin: 10px 0; display: inline-block;
                            th {
                                display: inline-block; width: 50px; height: 22px; line-height: 22px; text-align: left;
                            }
                            th.blue {
                                width: 260px; padding-left: 10px;
                            }
                        }
                    }
                    tbody {
                        tr {
                            width: 450px; margin: 10px 0; display: inline-block;
                            td {
                                display: inline-block;
                                width: 30px;
                                height: 30px;
                                line-height: 30px;
                                border-radius: 30px; 
                                text-align: center;
                                margin-right: 10px;
                                color: #fff;
                                box-shadow: 5px 5px 4px #CCC;
                            }
                            td.blue {
                                background-color: #2777eb;
                            }
                            td.red {
                                background-color: #d2222f;
                                margin-left: 15px;
                            }
                        }
                    }
                }
            }
        </style>
    </html>
    `);

  const screenshotFilePathAndName = _getScreenshotPathAndName(bettingPhase);
  // 截图自定义内容
  await newPage.screenshot({
    path: screenshotFilePathAndName,
  });

  console.log(`截图保存路径：${screenshotFilePathAndName}`);

  newPage.close();
}

/**
 * 将对象转为自定义格式的字符串
 * @param {Object} obj 对象
 * @returns {String} 自定义格式的字符串
 */
function _customStringify(obj) {
  return `{\n${
    Object.entries(obj)
      .map(([key, value]) => `  "${key}": ${JSON.stringify(value)}`)
      .join(',\n')
  }\n}`;
}

async function saveBettingPhase(ticketNumbers, bettingPhase) {
  const filePath = `${_reslovePath(BASE_PATH)}/${ticketsFileName}.json`;

  // 判断文件是否存在，存在就读取文件内容，将新的投注记录添加到文件中
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath));
    data[bettingPhase] = ticketNumbers;
    fs.writeFileSync(filePath, _customStringify(data));
  } else {
    // 文件不存在，创建文件并写入数据
    fs.writeFileSync(filePath, _customStringify({ [bettingPhase]: [ticketNumbers] }));
  }

  console.log("Lucky numbers:", ticketNumbers.map(ticket => ticket.join(' ')));
}

/**
 * 打印出选中的号码，将其保存为图片并保存投注信息
 * @param {Browser} browser 浏览器实例
 * @param {Array} ticketNumbers 开奖号码
 * @param {Number} bettingPhase 投注期号
 */
async function printLuckyNumbers(browser, ticketNumbers, bettingPhase) {
  
  // 保存投注截图
  await _saveScreenShot(browser, ticketNumbers, bettingPhase);

  // 保存投注记录
  await saveBettingPhase(ticketNumbers, bettingPhase);
}

module.exports = { printLuckyNumbers };
