# lucky-tickets

根据过往记录随机生成双色球号码。支持追投功能，追投功能需要配置`trackingTickets`属性，值为追投的彩票号。

运行`npm run lucky`生成投注号码。
运行`npm run bonus`核验投注号码是否中奖，中奖后给出中奖明细。

# 快速开始

安装 && 运行

```bash
npm install; # 安装依赖
npm run lucky; # 生成投注号码
npm run bonus; # 核验投注号码是否中奖
```

# 配置文件

配置文件为config.js，默认配置为：

```js
module.exports = {
    executablePath: "C:\\Users\\stone\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe", // 本地浏览器路径
    headless: true, // 可视化模式（调试时建议开启，设置为false）
    // devtools: true, // 是否开启调试模式
    trackingTickets: [], // 追投的彩票号，有值时生成的投注号码需包含追投号码
    ticketsFileName: 'luckyNumbers', // 存储投注记录的文件名
}
```

国内下载`puppeteer`内置的 Chrome 存在网络问题，故没依赖`puppeteer`而是依赖`puppeteer-core`，所以本地启动时需要先配置`executablePath`属性为你本地的Chrome路径。

# 命令行参数

## lucky命令支持的参数

`lucky`命令用于生成投注号码，支持配置的参数：

```bash
  --pages <number>   爬取页数，默认为5
  --tickets <number>   生成的投注数量，默认为5
```

eg:

设置爬取页数为2，生成投注数量为2的命令为：

```bash
npm run lucky -- --pages=2 --tickets=2
```

## 运行结果

```bash
> lucky-numbers@1.0.0 lucky
> node src/index.js --pages=2 --tickets=2

爬取的页数： 2
生成的投注数： 2
结果保存路径： E:\workspace\lucky-tickets\dist-tickets
Lucky numbers: [
  [
    20, 10, 13, 33,
    15, 32, 10
  ],
  [
     4, 33, 2, 24,
    15, 21, 2
  ]
]
```

## bonus命令支持的参数

`bonus`命令用于验证投注号码是否中奖，支持配置的参数：

```bash
  --phase <String>   投注期号
```

eg:

```bash
# 使用最新的开奖期号来查询自己的对应投注号是否中奖
npm run bonus
# or
# 使用指定的开奖期号来查询自己的对应投注号是否中奖
npm run bonus -- --phase=2025006
```

## 运行结果

运行`npm run bonus -- --phase=2025006`的结果为：

```bash
> lucky-numbers@1.0.0 bouns
> node src/bonus/index.js --phase=2025036

开奖期号： 2025036(最新一期)
开奖日期： 2025-04-03(四)
开奖号码： 5,11,13,16,19,32,7
投注号码： [
  '5 6 8 12 25 29 7',
  '6 8 12 19 25 29 6',
  '4 10 16 17 22 27 2',
  '1 3 4 5 22 31 12',
  '5 10 11 15 29 32 1'
]
------------------------------
恭喜，您中奖了！
中奖详情：
恭喜您中了六等奖！奖金为 5 元。中奖投注信息： 5,6,8,12,25,29,7。
------------------------------
- 总奖金为 5 元。 -
------------------------------
***自开奖之日起60个自然日内，持中奖彩票到指定的地点兑奖，逾期未兑奖视为弃奖。***
```
