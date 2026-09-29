import { createApp, markRaw } from "vue";
import type { ComponentPublicInstance, ElementNamespace, Plugin, App } from "vue";
import "@nutui/touch-emulator";
import { createPinia } from "pinia";
import { CreateFrameworkOptions } from "./types";
import { createRouter, createWebHashHistory, type Router } from "vue-router";
import { FrameApp } from "./components/frame-app/frame-app";
import { appEventBus } from "./components/app-event-bus";
import { routes as innerRouters } from "./router";

type HostElement = any;
const pinia = createPinia();

import "./styles/index";

export class CreateAppFramework {
  public readonly app: App;
  public router: Router;

  constructor({ rootComponent, rootProps, queryParams, routes }: CreateFrameworkOptions) {
    let _routes = routes;
    if (!rootComponent) {
      throw new Error("rootComponent is required, 缺少挂载根组件");
    }

    if (!rootProps) {
      rootProps = {};
    }

    appEventBus.emit("beforeCreateApp");
    const app = createApp(FrameApp, rootProps);

    Object.assign(app.config, {
      rootComponent: markRaw(rootComponent), // 外部挂载点
      __queryParams: queryParams
    });

    if (Array.isArray(_routes)) {
      _routes = [...routes, ...innerRouters];
    } else {
      throw new Error("routes is required, 缺少路由配置");
    }

    const router = createRouter({
      history: createWebHashHistory(),
      routes: _routes
    });
    app.use(router);
    this.router = router;

    if (window.AssemboxMobile) {
      app.use(window.AssemboxMobile.AssemPlugin, {});
    } else {
      throw new Error("AssemboxMobile is required, AssemboxMobile 无法进行初始化");
    }

    appEventBus.emit("afterCreateApp", { app });
    this.registerPlugin(app);

    this.app = app;
  }

  private registerPlugin(app: App) {
    app.use(pinia);
    app.use((window as any).nutui);
    app.use((window as any).NutuiPro);
  }

  private checkApp() {
    if (!this.app) {
      throw new Error("app is required, framework app 未进行初始化");
    }
  }

  use<Options extends unknown[]>(plugin: Plugin<Options>, ...options: Options): App;
  use<Options>(plugin: Plugin<Options>, options: Options): App;
  /**
   * 注册插件
   * @param {Plugin} plugin
   * @param options
   * @return {App}
   */
  public use(plugin: Plugin, ...options: any[]): App {
    this.checkApp();

    if (!plugin) {
      throw new Error("plugin is required, 插件不能为空");
    }

    this.app.use(plugin, ...options);

    return this.app;
  }

  mount(
    rootContainer: HostElement | string,
    isHydrate?: boolean,
    namespace?: boolean | ElementNamespace
  ): ComponentPublicInstance;
  /**
   * 挂载
   * @param rootContainer
   */
  public mount(rootContainer: HostElement | string): ComponentPublicInstance {
    this.checkApp();

    if (!rootContainer) {
      throw new Error("el is required, 挂载元素不能为空");
    }

    return this.app.mount(rootContainer);
  }

  /**
   * 卸载
   */
  public unmount(): void {
    this.checkApp();
    this.app.unmount();
  }
}
