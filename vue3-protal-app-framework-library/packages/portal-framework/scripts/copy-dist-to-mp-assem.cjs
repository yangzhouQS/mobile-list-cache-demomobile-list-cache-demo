const path = require("path");
const fse = require("fs-extra");
const dayjs = require("dayjs");
let target = process.argv[2];
let targetPath = "D:\\2025\\lowcode\\node-mp-assem-editor-website\\src\\web-content";
if (target){
  targetPath = target
}
console.log(targetPath);

;(function runCopy() {
  const target = path.join(targetPath, "dist");
  const stat = fse.pathExistsSync(target);

  // 修改文件夹名称
  if (stat) {
    const newLibDiaName = `lib_${dayjs().format("YYYY-MM-DDHHmmss")}`;
    // 目录重新命名
    // fse.renameSync(target, path.join(targetPath,newLibDiaName))
    const copyNewPath = path.join(targetPath, `old/${dayjs().format("YYYY-MM")}`, newLibDiaName);
    fse.moveSync(target, copyNewPath);
    console.log(`lib重新命名: ${copyNewPath}`);
  }

  // 创建文件夹
  fse.ensureDirSync(target);
  console.log("创建文件夹完成:", target);
  fse.copySync(path.resolve(__dirname, "../dist"), target);

  console.log("文件夹拷贝完成:", target);
})();

// 开始清空文件
/*files.forEach((filename) => {
  if (fse.pathExistsSync(path.resolve(__dirname, `../lib/${filename}`))) {

    [`${filename}`, `${filename}.map`].forEach(copyFileName => {

      if (fse.pathExistsSync(path.resolve(__dirname, `../lib/${copyFileName}`))) {
        fse.ensureFileSync(path.resolve(targetPath, copyFileName));
        fse.copySync(path.resolve(__dirname, `../lib/${copyFileName}`), path.resolve(targetPath, copyFileName));
        console.log(`拷贝文件: ${copyFileName} 至 ${targetPath}/`);
      }

    });
  }
});*/

