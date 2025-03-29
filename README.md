# lucky-numbers

根据过往记录随机生成双色球号码

# 快速开始

安装 && 运行

```bash
npm install; # 安装依赖
npm run lucky; # 运行
```

# 配置浏览器路径

配置文件为config.js，默认配置为：

```js
module.exports = {
    executablePath: "C:\\Users\\stone\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe", // 本地浏览器路径
    headless: true, // 可视化模式（调试时建议开启，设置为false）
    // devtools: true, // 是否开启调试模式
}
```

国内下载`puppeteer`内置的 Chrome 存在网络问题，故没依赖`puppeteer`而是依赖`puppeteer-core`，所以本地启动时需要先配置`executablePath`属性为你本地的Chrome路径。

# 命令行参数

lucky命令支持配置的参数：

```bash
  --pages <pages>   爬取页数，默认为5
  --tickets <tickets>   生成的投注数量，默认为5
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
