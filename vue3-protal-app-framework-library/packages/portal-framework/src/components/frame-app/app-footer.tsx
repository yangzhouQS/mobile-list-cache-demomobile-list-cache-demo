import { defineComponent, ref, watch, nextTick } from "vue";
import { Home, My } from "@nutui/icons-vue";
import { useRouter, useRoute } from "vue-router";
import { appEventBus } from "../app-event-bus";

/**
 * portal 底部tab切换组件
 */
export const AppFooter = defineComponent({
  name: "AppFooter",
  emits: ["tabSwitch"],
  setup() {
    const router = useRouter();
    const route = useRoute();
    const tabActive = ref("home");
    // 初始化 tab 状态
    const initTabActive = () => {
      tabActive.value = route.path === "/InnerAppMy" ? "my" : "home";
    };
    initTabActive();

    // 监听路由变化更新 tab 状态
    watch(
      () => route.path,
      () => {
        initTabActive();
      }
    );

    // 强制更新组件的辅助函数
    const forceUpdate = () => {
      nextTick(() => {
        // 触发响应式更新
        tabActive.value = tabActive.value === "home" ? "my" : "home";
        nextTick(() => {
          tabActive.value = route.path === "/InnerAppMy" ? "my" : "home";
        });
      });
    };

    const handleTabSwitch = (item: Record<string, unknown>) => {
      if (item.name === "my") {
        router.replace({ path: "/InnerAppMy" });
      } else {
        router.replace({ path: "/" });
        // emit("tabSwitch", { item, index });
      }
      // emit("tabSwitch", { item, index });
    };

    appEventBus.on("setTabActive", (val: string) => {
      if (val === "home" || val === "my") {
        tabActive.value = val;
        forceUpdate();
      }
    });

    return () => {
      return (
        <div class={["app-main__footer"]}>
          <nut-tabbar onTabSwitch={handleTabSwitch} v-model={tabActive.value}>
            <nut-tabbar-item tab-title="主页" name="home">
              {{
                icon: () => {
                  return <Home></Home>;
                }
              }}
            </nut-tabbar-item>
            <nut-tabbar-item tab-title="我的" name="my">
              {{
                icon: () => {
                  return <My></My>;
                }
              }}
            </nut-tabbar-item>
          </nut-tabbar>
        </div>
      );
    };
  }
});
