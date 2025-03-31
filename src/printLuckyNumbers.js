const dayjs = require("dayjs");
const path = require("path");
const fs = require("fs");

const BASE_PATH = "./dist-tickets";

/**
 * 获取图片的保存路径，路径不存在时就创建对应的文件夹
 * @param {String} filePath 图片的保存路径，相对于项目根目录
 * @returns {String} 图片保存路径
 */
function reslovePath(filePath) {
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

  console.log("结果保存路径：", realPath);
  return realPath;
}

/**
 * 获取图片的保存路径和图片名称
 * @param {String} baseName 图片的基础名称
 * @param {String} basePath 图片的保持路径，相对于根目录
 * @returns {String} 文件保存路径，最后一个路径是文件名称
 */
function getDistPathAndName(
  baseName = "luckyNumbers",
  basePath = BASE_PATH
) {
  const dateTime = dayjs(new Date()).format("YYYY-MM-DD-HH-mm-ss");
  return `${reslovePath(basePath)}/${baseName}_${dateTime}`;
}

/**
 * 打印出选中的号码，将其保存为图片
 * @param {Array} ticketNumbers 开奖号码
 */
async function printLuckyNumbers(browser, ticketNumbers = []) {
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

  await newPage.setViewport({ width: 600, height: ticketNumbers.length * 50 + 200 });

  await newPage.setContent(`
    <html>
        <body>
            <h1 class="title">Lucky Numbers</h1>
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
                width: 600px;
                height: 100%;
                margin: 0;
                overflow: hidden;
                background-color: #f5f5f5;
                .title {
                    text-align: center;
                    margin-top: 30px;
                }
                .table {
                    width: 600px; margin: 10px auto; text-align: center;
                    thead {
                        tr {
                            width: 600px; margin: 10px 0; display: inline-block;
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
                            width: 600px; margin: 10px 0; display: inline-block;
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

  const distPathAndName = getDistPathAndName();
  // 截图自定义内容
  await newPage.screenshot({
    path: `${distPathAndName}.png`,
  });

  const recordPathAndName = `${distPathAndName}.json`;

  // 将投注记录保存为json文件
  fs.writeFileSync(recordPathAndName, JSON.stringify({ ticketNumbers }));

  fs.writeFileSync(`${reslovePath(BASE_PATH)}/latest_tickets.json`, JSON.stringify({ ticketNumbers }))


  console.log("Lucky numbers:", ticketNumbers.map(ticket => ticket.join(' ')));

  newPage.close();
}

module.exports = { printLuckyNumbers };
