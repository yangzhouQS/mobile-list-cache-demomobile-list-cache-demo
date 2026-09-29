import { computed, defineComponent, h, onMounted, reactive, ref } from "vue";
import { getCurrentInstance, getSearchUrlParams } from "../../utils/helpers";
import { onBeforeRouteLeave } from "vue-router";
import "./style.less";
import { appInitContext } from "../../store/ctx-request";
import { appStore } from "../../store/frame-store";
import { AppLoading } from "./app-loading";
import { AppHeader } from "./app-header";
import { AppFooter } from "./app-footer";
import { appEventBus } from "../app-event-bus";
import { AppMy } from "./app-my";

import { GlobalToast } from "../../utils";

export const FrameApp = defineComponent({
  name: "FrameApp",
  setup() {
    const store = appStore();
    const currentTab = ref("home");
    const tabState = reactive({
      home: true,
      my: false
    });

    // 当前组织机构是否有权限
    const state = reactive({
      isAuth: true,
      permissionMessage: "当前用户无访问权限，请联系管理员授权！"
    });

    /*路由头部显示支持动态修改header显示隐藏*/
    const showHeader = ref(true);
    const notPermission = ref(false);
    const vm = getCurrentInstance("FrameApp");
    const queryParams = ref({});
    const { rootComponent, globalProperties, __queryParams } = vm.appContext!.config as any;

    if (!rootComponent) {
      throw new Error("rootComponent is not defined");
    }

    if (__queryParams) {
      queryParams.value = __queryParams;
    }

    const handleTabSwitch = ({ item, index }: { item: Record<string, unknown> & { name: "home" | "my" }; index: number }) => {
      tabState[item.name] = true;
      currentTab.value = item.name;

      showHeader.value = item.name === "home";

      // 触发切换
      appEventBus.emit("app.tabSwitch.item", { item, index });
    };

    const routeMeta = computed(() => {
      return globalProperties!.$route;
    });

    const renderHeader = () => {
      if (!routeMeta.value?.meta?.orgPanel || !showHeader.value) return null;
      return <AppHeader />;
    };

    const renderFooter = () => {
      if (!routeMeta.value?.meta?.showTab) return null;
      return <AppFooter onTabSwitch={handleTabSwitch} />;
    };

    const renderMy = () => {
      if (!tabState.my) return null;
      return (
        <div class="app-main__content my-page" v-show={currentTab.value === "my"}>
          <AppMy />
        </div>
      );
    };

    onBeforeRouteLeave((to, from, next) => {
      console.log(111, to, from, next);
    });

    onMounted(() => {
      const params = getSearchUrlParams();
      if (!params || !params.apploicationId) {
        notPermission.value = true;
      }
      store.setLoading(true);
      appInitContext(queryParams.value)
        .then(() => {
          store.setLoading(false);
        })
        .catch(error => {
          store.setLoading(false);

          if (error.code === "module_access_denied") {
            GlobalToast.warn(error.desc);
            state.isAuth = false;
            state.permissionMessage = error.desc;
            // 跳转至无权限页面
            // window.open(location.origin)
          } else {
            GlobalToast.warn("上下文加载出错，请稍后再试！");
          }
        });

      /*监听设置showHeader的显示状态*/
      appEventBus.on("app.setShowHeader", (show: boolean) => {
        // 路由配置显示为前提
        showHeader.value = routeMeta.value?.meta?.orgPanel && show;
      });
    });
    return () => {
      if (state.isAuth === false) {
        return <div class={["app-module_access_denied"]}>{state.permissionMessage} - 请联系管理员授权！</div>;
      }

      if (store.loadingState) {
        return (
          <div class={"app-main-page loading"}>
            <AppLoading />
          </div>
        );
      }

      return (
        <div
          class={[
            "app-main-page",
            {
              ["is-show-header"]: routeMeta.value?.meta?.orgPanel && showHeader.value
            }
          ]}
        >
          {/*header 区域*/}
          {renderHeader()}

          {/*内容区域*/}
          <div
            data-title={`${store.currentOrg.id}--${store.currentOrg.shortName}--${store.menus?.length}`}
            key={location.href}
            class="app-main__content"
            v-show={tabState.home && currentTab.value === "home"}
          >
            {h(rootComponent)}
          </div>

          {/*我的*/}
          {renderMy()}

          {/*tab切换*/}
          {renderFooter()}
        </div>
      );
    };
  }
});
