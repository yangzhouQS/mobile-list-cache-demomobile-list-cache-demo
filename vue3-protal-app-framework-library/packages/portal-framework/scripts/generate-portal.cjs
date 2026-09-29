const packageConfig = require('../package.json')
const path = require('path')
const fse = require('fs-extra')

let fileStrDev = `import { appEventBus } from "./components/app-event-bus";
import { CreateAppFramework } from "./yearrow-framework";
import { appStore } from "./store/frame-store";
import { $http } from "./utils";

export { openMenu } from "./utils/helpers";
export * from "./utils";
export * from "./store/frame-store";
export * from "./components-workflow";
export * from "./yearrow-framework";
export * from "./components/app-event-bus";
export const version = "${packageConfig.version}";
export default {
  appStore,
  version: "${packageConfig.version}",
  $http,
  appEventBus,
  CreateAppFramework
};
`
fse.outputFile(path.resolve(__dirname, '../src/index.ts'), fileStrDev, 'utf8')
// fse.outputFile(path.resolve(__dirname, '../src/index.build.ts'), fileStrDev, 'utf8')
