const args = process.argv.slice(2); // 跳过前两个默认参数（Node路径和脚本路径）
// console.log("所有参数：", args);

// 解析键值对参数（如 -- --phase=2025001）
const parsedArgs = { phase: '' };
args.forEach(arg => {
  if (arg.startsWith('--')) {
    const [key, value] = arg.replace('--', '').split('=');
    value !== undefined && (parsedArgs[key] = value);
  }
});

// console.log("解析后的参数：", parsedArgs);

module.exports = parsedArgs;