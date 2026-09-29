#!/usr/bin/env node
let target = process.argv[2] || "app-portal";
const packageConfig = require("../package.json");
if (!target) {
  console.error("缺少 app-portal 参数！");
  return;
}
let copyfile = ["dist", "README.md", "CHANGELOG.MD"];
const path = require("path");
const fse = require("fs-extra");
// 清空 dist
console.log("-------------清空 dist----------------", path.resolve(__dirname, `../publish/${target}/dist`));
fse.emptyDirSync(path.resolve(__dirname, `../publish/${target}/dist`));

copyfile.forEach(filename => {
  fse.copy(path.resolve(__dirname, `../${filename}`), path.resolve(__dirname, `../publish/${target}/${filename}`)).then(() => {
    console.log(`write success=> publish/${target}/${filename}`);
  });
});

const targetPkgPath = path.resolve(__dirname, `../publish/${target}/package.json`);
const targetPkgStr = fse.readFileSync(targetPkgPath);
const targetPkgObj = JSON.parse(targetPkgStr);
targetPkgObj.version = packageConfig.version;
fse.outputFile(targetPkgPath, JSON.stringify(targetPkgObj, null, 2), "utf8", () => {
  console.log(`${targetPkgPath} 写入成功`);
});
