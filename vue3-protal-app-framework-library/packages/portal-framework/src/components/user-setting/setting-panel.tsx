import { reactive, ref, onMounted, defineComponent, PropType } from "vue";
import { Category } from "./container/types";
import { Setting } from "./container";
import "./style.less";

export const SettingPanel = defineComponent({
  name: "SettingPanel",
  props: {
    category: {
      type: Object as PropType<Category>
    }
  },
  emits: ["reload"],
  setup(props, { emit }) {
    const paramsValue = reactive(props.category.paramsValue);
    const paramsConfig = ref([]);
    // 配置属性
    const getPropConfig = async () => {
      const currConfigs = [];
      for (const key in paramsValue) {
        if (Object.prototype.hasOwnProperty.call(paramsValue, key)) {
          const con = paramsValue[key];
          con.configUi = con.configUi ? JSON.parse(con.configUi) : {};
          currConfigs.push(con);
        }
      }
      currConfigs.forEach((item: any) => {
        item.isShow = false;
        item.isLeft = false;
      });
      paramsConfig.value = currConfigs;
    };
    onMounted(async () => {
      await getPropConfig();
    });
    const methods = {
      _reloadConfig: () => {
        console.log("setting-panel emit _reloadConfig");
        emit("reload");
      }
    };
    return () => {
      return (
        <nut-panel title={""} border padding-size={"small"}>
          {{
            tool: () => {
              return (
                <nut-flex-line leftWidth={"80%"}>
                  {{
                    default: () => {
                      return (
                        <div class="card-header">
                          <span class="card-header-icon">
                            <span class="approve approve-shenpiliuzhuantu"></span>
                          </span>
                          <span class="card-header-title"> {props.category.category.name} </span>
                        </div>
                      );
                    },
                    right: () => {}
                  }}
                </nut-flex-line>
              );
            },
            default: () => {
              if (paramsConfig.value.length > 0) {
                return <Setting config={paramsConfig.value} onReload={methods._reloadConfig} />;
              } else {
                return <div class="empty-config">暂无配置项</div>;
              }
            }
          }}
        </nut-panel>
      );
    };
  }
});
