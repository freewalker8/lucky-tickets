const args = process.argv.slice(2); // 跳过前两个默认参数（Node路径和脚本路径）
// console.log("所有参数：", args);

// 解析键值对参数（如 --env=pages）
const parsedArgs = { pages:5, tickets: 5 };
args.forEach(arg => {
  if (arg.startsWith('--')) {
    const [key, value] = arg.replace('--', '').split('=');
    parsedArgs[key] = value || 5; // 无值时默认为 5
  }
});

if (parsedArgs.pages > 100) {
  console.log("爬取页数不能超过100页");
  process.exit(1);
}

// console.log("解析后的参数：", parsedArgs);
console.log("爬取的页数：", parsedArgs.pages);
console.log("生成的投注数：", parsedArgs.tickets);

module.exports = parsedArgs;