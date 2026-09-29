import { defineComponent, onMounted, reactive, ref } from "vue";
import { appStore } from "../../store/frame-store";
import { $http } from "../../utils";
import "./style.less";
import { BluetoothPrint } from "./bluetooth-print";
import { CloudPrint } from "./cloud-print";

export const userPrint = defineComponent({
  name: "UserPrint",
  components: {
    BluetoothPrint,
    CloudPrint
  },
  setup: function () {
    // 布局配置
    const flexConfig = reactive([
      {
        tag: "item-1",
        isFixed: true,
        size: "",
        paddingSize: "large",
        clearPadding: []
      },
      {
        tag: "item-2",
        isFixed: true,
        size: "",
        paddingSize: "large",
        clearPadding: ["top"]
      },
      {
        tag: "item-3",
        isFixed: false,
        size: "1 1 0",
        paddingSize: "large",
        clearPadding: ["top"],
        style: {
          display: "flex",
          flexDirection: "column",
          minHeight: "0",
          overflow: "hidden"
        }
      }
    ]);

    const store = appStore();
    const showTop = ref(false);
    const printModel = ref(store.cache.getItem("printModel") ?? "0");
    const printValue = ref("");
    const isClPrint = ref(false);

    // 解析云打印配置（判断是否显示云打印选项）
    const parseCloudPrintConfig = (config: any): boolean => {
      if (config === null || config === undefined) return false;
      if (typeof config === "boolean") return config;
      if (typeof config === "number") return config === 1;
      if (typeof config === "string") return config === "true" || config === "1";
      if (Array.isArray(config)) return config.some(item => parseCloudPrintConfig(item));
      if (typeof config === "object") {
        if (typeof config.isClPrint !== "undefined") return parseCloudPrintConfig(config.isClPrint);
        if (typeof config.data !== "undefined") return parseCloudPrintConfig(config.data);
        return Object.values(config).some(value => parseCloudPrintConfig(value));
      }
      return false;
    };

    // 初始化云打印开关
    const initCloudPrinter = () => {
      const app = appStore();
      const keys = ["isClPrint"];
      $http
        .get(`/shared-data/configuration/get-config-data?namespaceCode=sysConfig&categoryCode=global&paramsKey=${keys}&orgId=${app.$context.fullId}`)
        .then((config: any) => {
          const enabled = parseCloudPrintConfig(config.data !== undefined ? config.data : config);
          isClPrint.value = enabled;
        })
        .catch(error => console.log(error));
    };

    // 切换打印模式
    const onPrintModelChange = (val: any) => {
      printModel.value = val;
      store.cache.setItem("printModel", val);
    };

    // 更新打印选中值（接收子组件事件）
    const updatePrintValue = (val: string) => {
      printValue.value = val;
    };

    // 初始化
    onMounted(() => {
      initCloudPrinter();
    });

    return {
      flexConfig,
      store,
      showTop,
      printModel,
      printValue,
      isClPrint,
      onPrintModelChange,
      updatePrintValue
    };
  },
  render() {
    return (
      <div class="my-style">
        <nut-flex-box item-num={this.flexConfig.length} item-config={this.flexConfig}>
          {{
            "item-1": () => {
              return (
                <nut-panel title={"用户信息"} background padding={"small"}>
                  <nut-form>
                    <nut-row>
                      <nut-form-item label="用户名称" label-width={70} body-align={"right"} style={"line-height: 2;"}>
                        {this.store.$context.userName}
                      </nut-form-item>
                    </nut-row>
                    <nut-row>
                      <nut-form-item label="组织机构" label-width={70} body-align={"right"} style={"line-height: 2;"}>
                        {this.store.$context.orgShortName || this.store.$context.orgName}
                      </nut-form-item>
                    </nut-row>
                  </nut-form>
                </nut-panel>
              );
            },
            "item-2": () => {
              return (
                <nut-panel title={"打印方式"} background padding={"small"}>
                  <nut-form>
                    <nut-radio-group
                      v-model={this.printModel}
                      direction="horizontal"
                      onChange={(val: any) => this.onPrintModelChange(val)}
                    >
                      <nut-radio label="0" shape="button">
                        手持打印机
                      </nut-radio>
                      {this.isClPrint && (
                        <nut-radio label="1" shape="button">
                          云打印机
                        </nut-radio>
                      )}
                    </nut-radio-group>
                  </nut-form>
                </nut-panel>
              );
            },
            "item-3": () => {
              return this.printModel === "1" ? (
                <CloudPrint {...{
                  onUpdatePrintValue: this.updatePrintValue
                }} />
              ) : (
                <BluetoothPrint {...{
                  onUpdatePrintValue: this.updatePrintValue
                }} />
              );
            },
          }}
        </nut-flex-box>
      </div>
    );
  }
});