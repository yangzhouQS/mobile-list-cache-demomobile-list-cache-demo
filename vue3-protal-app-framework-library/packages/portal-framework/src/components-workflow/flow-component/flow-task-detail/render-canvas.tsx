import { defineComponent, ref, watch, h, nextTick, PropType, onMounted } from "vue";
// import { utils, getAssemCore, views } from "@cs/assembox-mobile";
const { utils, getAssemCore, views } = window.AssemboxMobile;
import { useRouter } from "vue-router";
import { forEach, get } from "lodash";
import { useDesignJson } from "./use-design-json";
import { IPublicFlowPageConfigType } from "../../workflow-types";
import { useContext } from "../../../hooks/useContext";
import { $http } from "../../../utils";

export const RenderCanvas = defineComponent({
  name: "RenderCanvas",
  props: {
    flowDesignJson: {
      type: [String],
      default: () => {
        return "";
      }
    },
    flowPageConfig: {
      type: Object as PropType<IPublicFlowPageConfigType>,
      required: true,
      default: () => {
        return {
          flowStepButtons: [],
          flowDesignJson: "",
          stepModel: {},
          task: {}
        };
      }
    }
  },
  setup(props) {
    const { designJson } = useDesignJson();
    const router = useRouter();
    const assemCore = getAssemCore() as any;

    const renderKey = ref(Date.now());
    const routerNameList = ref<string[]>([]);
    const pageName = ref("master");
    const conf = ref<any>({
      uiSkeleton: {},
      routerConfig: {},
      dataSource: {},
      globalConfig: {}
    });
    const loading = ref(true);

    // methods
    const methods = {
      setRenderSchema: () => {
        loading.value = true;

        assemCore.$globalVars.$context = useContext().$context;
        assemCore.$globalVars.$http = $http;

        assemCore.$globalVars.$portal = useContext();

        assemCore.$globalVars.$router = router;

        // 流程上下文数据注入
        assemCore.$globalVars.$flowConfig = {
          instanceId: get(props.flowPageConfig, "task.instanceId", ""),
          orgId: get(props.flowPageConfig, "task.orgId", "")
        };

        if (designJson.value) {
          conf.value = utils.parseJson(designJson.value);
          assemCore.initCore(conf.value);
        }

        if (conf.value) {
          const routerConfig = get(conf.value, "routerConfig", {});
          forEach(routerConfig, (val, name) => {
            routerNameList.value.push(name);
          });
        }

        if (!conf.value.routerConfig || !conf.value.uiSkeleton) {
          console.error("配置结构渲染器无法识别，请在流程编辑器重新配置");
        }

        methods.setRouteName();

        setTimeout(() => {
          renderKey.value = Date.now();
          loading.value = false;
        }, 17);

        // renderKey.value = Date.now();
        // loading.value = false;

        nextTick(() => {
          assemCore.$globalVars.$router = router;
        });
      },
      setRouteName: () => {
        /*if (routerNameList.value.includes(route.name)) {
          pageName.value = route.name;
        }*/
      }
    };

    watch(
      () => {
        return designJson;
      },
      json => {
        if (json) {
          methods.setRenderSchema();
        } else {
          console.log("json配置数据不完整");
        }
      },
      { immediate: true }
    );

    onMounted(() => {});

    return () => {
      if (loading.value) {
        return <div style="width: 100%;height: 100%" />;
      }

      return h(views, {
        key: renderKey.value,
        class: ["assem-desktop-renderer-view main-page"],
        ...(conf.value.uiSkeleton ?? {})[pageName.value],
        pageName: pageName.value
      });
    };
  }
});
