import { defineComponent, onMounted } from "vue";
import { MyApp } from "../my-app/app-index";
import { appEventBus } from "../app-event-bus";

/*我的个人中心*/
export const AppMy = defineComponent({
  name: "AppMy",
  setup: function () {
    onMounted(() => {
      appEventBus.emit("setTabActive", "my");
    });

    // onBeforeRouteLeave((to, from, next) => {
    //   if(to.path === "/"){
    //     // ctx.isRedirecting = ctx.isRedirecting + 1;
    //     appEventBus.emit("setTabActive", "home");
    //     // 重定向到根路径，但添加一个查询参数来避免循环
    //     next();
    //   } else {
    //     next();
    //   }
    // })

    return () => {
      return (
        <div class="my-style">
          <MyApp></MyApp>
        </div>
      );
    };
  }
});
