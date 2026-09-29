import { CreateAppFramework } from "./yearrow-framework";
import { appStore } from "./store/frame-store";
import { $http } from "./utils";
import { appEventBus } from "./components/app-event-bus";

const version = "0.0.5";
export { CreateAppFramework, appEventBus, appStore, $http, version };
export default {
  CreateAppFramework,
  appEventBus,
  appStore,
  $http,
  version
};
