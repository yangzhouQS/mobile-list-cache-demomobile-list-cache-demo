import { defineComponent, ref } from "vue";
import { useRouter } from 'vue-router'
import { appStore } from "../../store/frame-store";
import printSrc from "./print.png";
import { $http } from "../../utils";
import { showToast } from "@nutui/nutui";

export const CloudPrint = defineComponent({
    name: "CloudPrint",
    setup: function (props: any, { emit }) {
        const store = appStore();
        const router = useRouter()
        const cloudBridges = ref<any[]>([]);
        const cloudPrinters = ref<any[]>([]);
        const selectedCloudBridge = ref({ "name": "", "code": "" });
        const selectedCloudPrinter = ref({ "name": "", "code": "" });
        let cloudPrinter: any | null = null;

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

        const loadCloudBridgeList = () => {
            const keys = ["cPrintConfig"];
            $http
                .get(
                    `/shared-data/configuration/get-config-data?namespaceCode=sysConfig&categoryCode=global&paramsKey=${keys}&orgId=${store.$context.fullId}`
                )
                .then((config: any) => {
                    cloudBridges.value = config.data.portList;
                    // 获取历史配置的打印设备，如果存在则刷新选中并加载打印机列表
                    const clPrintBridge = store.cache.getItem("clPrintBridge");
                    if (typeof clPrintBridge === 'string') {
                        selectedCloudBridge.value = JSON.parse(clPrintBridge);
                        loadCloudPrinterList();
                    }
                })
                .catch(error => {
                    console.error(error);
                    showToast.text("云打印终端获取失败");
                });
        };

        const loadCloudPrinterList = () => {
            if (!selectedCloudBridge.value) return;
            try {
                const bridgeKey = `${selectedCloudBridge.value.code};${selectedCloudBridge.value.name}`;
                cloudPrinters.value = cloudPrinter.getAOBridgeSubPrintersList(bridgeKey) || [];
                // 获取历史配置的打印机，如果存在则刷新选中
                const clPrinter = store.cache.getItem("clPrinter");
                if (typeof clPrinter === 'string') {
                    selectedCloudPrinter.value = JSON.parse(clPrinter);
                }
                if (cloudPrinter && selectedCloudBridge.value && selectedCloudPrinter.value) {
                    emit('updatePrintValue', `${selectedCloudBridge.value.name}/${selectedCloudPrinter.value.name}`);
                }
            } catch (err) {
                console.error(err);
            }
        };

        const onCloudBridgeChange = (val: any) => {
            const cBridge = cloudBridges.value.find((item: any) => item.code === val);
            selectedCloudBridge.value.name = cBridge?.name;
            selectedCloudPrinter.value = { "name": "", "code": "" };
            store.cache.setItem("clPrintBridge", JSON.stringify(selectedCloudBridge.value));
            loadCloudPrinterList();
        };

        const onCloudPrinterChange = (val: any) => {
            const cPrint = cloudPrinters.value.find((item: any) => item.code === val);
            selectedCloudPrinter.value.name = cPrint.name;
            if (cloudPrinter && selectedCloudBridge.value && selectedCloudPrinter.value) {
                emit('updatePrintValue', `${selectedCloudBridge.value.name}/${selectedCloudPrinter.value.name}`);
            }
            store.cache.setItem("clPrinter", JSON.stringify(selectedCloudPrinter.value));
            router.back();
        };

        const initCloudPrinter = () => {
            const app = appStore();
            const keys = ["isClPrint"];
            $http
                .get(`/shared-data/configuration/get-config-data?namespaceCode=sysConfig&categoryCode=global&paramsKey=${keys}&orgId=${app.$context.fullId}`)
                .then((config: any) => {
                    const enabled = parseCloudPrintConfig(config.data !== undefined ? config.data : config);
                    if (enabled) {
                        if (window.printCore && window.printCore.PrintCore) {
                            cloudPrinter = new window.printCore.PrintCore();
                            cloudPrinter.putCloudStatus(true);
                            loadCloudBridgeList();
                        } else {
                            showToast.text("当前浏览器不支持云打印");
                        }
                    }
                })
                .catch(error => console.log(error));
        };

        initCloudPrinter();

        return {
            cloudBridges,
            cloudPrinters,
            selectedCloudBridge,
            selectedCloudPrinter,
            loadCloudBridgeList,
            onCloudBridgeChange,
            onCloudPrinterChange,
        };
    },
    render() {
        return (
            <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", marginBottom: "8px" }}>
                    <nut-panel title={"选择打印终端"} background padding={"small"} style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                        <div style={{ flex: 1, overflow: "auto" }}> {/* 内容溢出滚动 */}
                            {this.cloudBridges && this.cloudBridges.length ? (
                                <nut-radio-group
                                    v-model={this.selectedCloudBridge.code}
                                    onChange={(val: any) => this.onCloudBridgeChange(val)}
                                >
                                    {this.cloudBridges.map((item: any) => (
                                        <nut-radio label={item.code} key={item.code}>
                                            {item.name ? `${item.name}(${item.code})` : item.code}
                                        </nut-radio>
                                    ))}
                                </nut-radio-group>
                            ) : (
                                <div style={"margin-top: 12px;"}>
                                    <nut-empty image={printSrc} description={"当前暂无打印终端"} image-size={80}></nut-empty>
                                </div>
                            )}
                        </div>
                    </nut-panel>
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", marginBottom: "8px" }}>
                    <nut-panel title={"选择打印机"} background padding={"small"} style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                        <div style={{ flex: 1, overflow: "auto" }}> {/* 内容溢出滚动 */}
                            {this.cloudPrinters && this.cloudPrinters.length ? (
                                <nut-radio-group
                                    v-model={this.selectedCloudPrinter.code}
                                    onChange={(val: any) => this.onCloudPrinterChange(val)}
                                >
                                    {this.cloudPrinters.map((item: any) => (
                                        <nut-radio label={item.code} key={item.code}>
                                            {item.name || item.code}
                                        </nut-radio>
                                    ))}
                                </nut-radio-group>
                            ) : (
                                <div style={"margin-top: 12px;"}>
                                    <nut-empty image={printSrc} description={"当前暂无云打印机"} image-size={80}></nut-empty>
                                </div>
                            )}
                        </div>
                    </nut-panel>
                </div>
                <div style={{ marginTop: "8px" }}>
                    <nut-box background padding={"small"}>
                        <nut-button
                            type="primary"
                            size={"large"}
                            onClick={() => this.loadCloudBridgeList()}
                        >
                            刷新云终端
                        </nut-button>
                    </nut-box>
                </div>
            </div>
        );
    }
});