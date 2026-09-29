import { defineComponent, ref, onMounted } from "vue";
import { appStore } from "../../store/frame-store";
import { useRouter } from 'vue-router'
import printSrc from "./print.png";
import { $http } from "../../utils";
import { showDialog, showToast } from "@nutui/nutui";

export const BluetoothPrint = defineComponent({
    name: "BluetoothPrint",
    setup: function (props: any, { emit }) {
        const store = appStore();
        const router = useRouter()
        const loading = ref(false);
        const devices = ref([]);
        const selectedBlePrinter = ref({ "name": "", "deviceId": "" });
        const backLog = (log: any, logMsg: any) => {
            console.log(checkLog(log, logMsg));
            return;
            const logmsg = checkLog(log, logMsg);
            $http
                .get("backLog?log=" + encodeURIComponent(logmsg))
                .then((res: any) => {
                    console.log("============================");
                    console.log(res);
                })
                .catch((err) => {
                    console.log("============================");
                    console.log(err);
                });
        };

        const checkLog = (log: any, logMsg: any) => {
            let logStr;
            logStr = log instanceof Object ? JSON.stringify(log) : log;
            if (!logMsg) return logStr;
            if (logMsg instanceof Object) {
                if (logMsg instanceof Error) {
                    logStr += `:${logMsg.name}:${logMsg.message}`;
                    return logStr;
                }
                logStr += ":" + JSON.stringify(logMsg);
                return logStr;
            }
            logStr += ":" + logMsg;
            return logStr;
        };

        const s2i = (s: any) => {
            if (typeof s !== 'string') return 0;
            return s
                .split("")
                .reduce(function (a, c) {
                    const code = c.charCodeAt(0);
                    if (code >= 48 && code < 58) a.push(code - 48);
                    return a;
                }, [])
                .reduce(function (a, c) {
                    return 10 * a + c;
                }, 0);
        };

        const compareVersion = (s1: any, s2: any) => {
            const str1 = typeof s1 === 'string' ? s1 : String(s1 ?? '0');
            const str2 = typeof s2 === 'string' ? s2 : String(s2 ?? '0');

            let a = str1.split(".").map(function (s: any) { return s2i(s); });
            let b = str2.split(".").map(function (s: any) { return s2i(s); });
            let n = a.length < b.length ? a.length : b.length;
            for (let i = 0; i < n; i++) {
                if (a[i] < b[i]) return -1;
                else if (a[i] > b[i]) return 1;
            }
            if (a.length < b.length) return -1;
            if (a.length > b.length) return 1;
            let last1 = str1.charCodeAt(str1.length - 1) | 0x20;
            let last2 = str2.charCodeAt(str2.length - 1) | 0x20;
            return last1 > last2 ? 1 : last1 < last2 ? -1 : 0;
        };

        const getBluetoothState = () => {
            return new Promise((resolve, reject) => {
                window.iwop &&
                    window.iwop.getBluetoothAdapterState({
                        success: (res: any) => resolve(res.available),
                        fail: (err: any) => reject(err)
                    });
            });
        };

        const startBluetoothDevicesDiscovery = () => {
            window.iwop &&
                window.iwop.openBluetoothAdapter({
                    success: (res: any) => {
                        console.log("startBluetoothDevicesDiscovery", res);
                        window.iwop &&
                            window.iwop.startBluetoothDevicesDiscovery({
                                success: (res: any) => {
                                    backLog("startBluetoothDevicesDiscovery-success", res);
                                    setTimeout(() => loadData(), 5000);
                                },
                                fail: (err: any) => {
                                    showToast.text("请打开手机蓝牙功能");
                                    backLog("startBluetoothDevicesDiscovery-err", err);
                                    loading.value = false;
                                }
                            });
                    },
                    fail: (err: any) => {
                        showToast.text("请打开手机蓝牙功能");
                        backLog("openBluetoothAdapter-err", err);
                        loading.value = false;
                    }
                });
        };

        const loadData = () => {
            window.iwop &&
                window.iwop.getBluetoothDevices({
                    success: function (res: any) {
                        devices.value = res.devices;
                        console.log("devices", res.devices);
                        backLog("getBluetoothDevices-success", res.devices);
                        loading.value = false;
                    },
                    fail: function (res: any) {
                        console.log(res);
                        backLog("getBluetoothDevices-fail", res);
                        loading.value = false;
                    }
                });
        };

        const notifyBLECharacteristicValueChange = (options: any) => {
            backLog("进入notifyBLECharacteristicValueChange-options", options);
            window.iwop &&
                window.iwop.notifyBLECharacteristicValueChange({
                    state: true,
                    deviceId: options.deviceId,
                    serviceId: options.serviceId,
                    characteristicId: options.characteristicId,
                    success(res: any) { backLog("notifyBLECharacteristicValueChange-success", res); },
                    fail: (err: any) => { backLog("notifyBLECharacteristicValueChange-fail", err); }
                });
        };

        const connect = (data: any) => {
            console.log("connect", data);
            showToast.text("正在连接设备...");
            window.iwop &&
                window.iwop.createBLEConnection({
                    deviceId: data.deviceId,
                    success: (res: any) => {
                        console.log("createBLEConnection", res);
                        const options = {
                            deviceId: data.deviceId,
                            serviceId: "",
                            characteristicId: "",
                            deviceName: data.name
                        };
                        window.iwop.getBLEDeviceServices({
                            deviceId: data.deviceId,
                            success: (res: any) => {
                                res.services.some((element: any) => {
                                    window.iwop.getBLEDeviceCharacteristics({
                                        deviceId: options.deviceId,
                                        serviceId: element.uuid,
                                        success: (res: any) => {
                                            backLog("getBLEDeviceCharacteristics-success", res);
                                            res.characteristics.forEach((char: any) => {
                                                if (char.properties.notify) {
                                                    const vals = {
                                                        deviceId: options.deviceId,
                                                        serviceId: element.uuid,
                                                        characteristicId: char.uuid
                                                    };
                                                    notifyBLECharacteristicValueChange(vals);
                                                    return true;
                                                }
                                            });
                                            res.characteristics.some((char: any) => {
                                                if (char.properties.writeNoResponse) {
                                                    options.serviceId = element.uuid;
                                                    options.characteristicId = char.uuid;
                                                    window.iwop.setStorage({ key: "INTERNAL_OPTION", data: options });
                                                    localStorage.setItem("INTERNAL_OPTION", JSON.stringify(options));
                                                    localStorage.setItem("DEVICE_NAME", data.name);
                                                    window.iwop && window.iwop.stopBluetoothDevicesDiscovery({
                                                        success: (res: any) => console.log("===end===", res)
                                                    });
                                                    return true;
                                                }
                                            });
                                            if (options.characteristicId === "") {
                                                showToast.text("获取蓝牙打印机写特征不可用");
                                            }
                                        },
                                        fail: (err: any) => {
                                            console.log(err);
                                            showToast.text("蓝牙打印机服务中特征值失败");
                                        }
                                    });
                                });
                            },
                            fail: (err: any) => {
                                backLog("getBLEDeviceServices-fail", err);
                                showToast.text("蓝牙打印机服务失败");
                            }
                        });
                    },
                    fail: (err: any) => {
                        backLog("createBLEConnection-fail", err);
                        showToast.text("连接蓝牙打印机失败");
                    }
                });
        };

        const connectDevice = (data: any) => {
            getBluetoothState()
                .then((state: any) => {
                    if (state) connect(data);
                    else showToast.text("手机蓝牙或GPS或者蓝牙设备没有打开");
                })
                .catch((err: any) => {
                    console.log(err);
                    showToast.text("手机蓝牙或GPS或者蓝牙设备没有打开");
                });
        };

        // 直接定义为普通函数，不再包在 methods 对象里
        const getRadio = (val: any) => {
            const blePrinter = devices.value.find((k: any) => k.deviceId == val);
            selectedBlePrinter.value.name = blePrinter.name;
            emit('updatePrintValue', blePrinter.name);
            connectDevice(blePrinter);
            router.back();
        };

        const searchDevices = () => {
            devices.value = [];
            loading.value = true;
            const options = {} as any;
            try {
                Object.assign(options, JSON.parse(localStorage.getItem("INTERNAL_OPTION") || '{}'));
            } catch (e) { console.log(e); loading.value = false; }

            if (options && options.deviceId) {
                const deviceId = options.deviceId;
                window.iwop &&
                    window.iwop.closeBLEConnection({
                        deviceId,
                        success: (res: any) => {
                            backLog("closeBLEConnection-success", res);
                            startBluetoothDevicesDiscovery();
                        },
                        fail: (err: any) => {
                            backLog("closeBLEConnection-fail", err);
                            startBluetoothDevicesDiscovery();
                            loading.value = false;
                        }
                    });
            } else {
                startBluetoothDevicesDiscovery();
            }
        };

        const stopScan = () => {
            window.iwop &&
                window.iwop.stopBluetoothDevicesDiscovery({
                    success: (res: any) => console.log(res)
                });
        };

        onMounted(async () => {
            if (window.iwop && typeof window.iwop.getPlatformBuild === 'function') {
                console.log("getPlatformBuild返回值:", window.iwop?.getPlatformBuild(), typeof window.iwop?.getPlatformBuild());
                const buildVersion = window.iwop.getPlatformBuild();
                if (compareVersion(buildVersion, "1.0.5") < 0) {
                    showToast.text("当前版本号不支持蓝牙功能,请下载最新版本!");
                    setTimeout(() => { }, 5000);
                }
            };
        });
        return () => {
            return (
                <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", marginBottom: "8px" }}>
                        <nut-panel title={"选择打印机"} background padding={"small"} style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                            <div style={{ flex: 1, overflow: "auto" }}> {/* 内容溢出滚动 */}
                                {devices && devices.value.length ? (
                                    <nut-radio-group
                                        v-model={selectedBlePrinter.value.deviceId}
                                        onChange={(val: any) => getRadio(val)}
                                    >
                                        {devices.value.map((item: any) => (
                                            <nut-radio label={item.deviceId} key={item.deviceId}>
                                                {item.name ? `${item.name}(${item.deviceId})` : item.deviceId}
                                            </nut-radio>
                                        ))}
                                    </nut-radio-group>
                                ) : (
                                    <div>
                                        {loading.value ? (
                                            <nut-loading-v2 text="扫描中......." layout="vertical" />
                                        ) : (
                                            <div style={"margin-top: 12px;"}>
                                                <nut-empty image={printSrc} description={"当前暂无打印机"} image-size={80}></nut-empty>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </nut-panel>
                    </div>
                    <div style={{ marginTop: "8px" }}>
                        <nut-box background padding={"small"}>
                            <nut-flex-line
                                left-padding={true}
                                right-padding={true}
                                rightClearPadding={["top", "bottom", "left", "right"]}
                                leftClearPadding={["top", "bottom", "left"]}
                                leftWidth={"50%"}
                            >
                                {{
                                    default: () => {
                                        return (
                                            <nut-button
                                                shape="square"
                                                type="primary"
                                                plain={true}
                                                size={"large"}
                                                onClick={() => {
                                                    window.iwop &&
                                                        window.iwop.stopBluetoothDevicesDiscovery({
                                                            success: (res: any) => {
                                                                console.log(res);
                                                            }
                                                        });
                                                }}
                                            >
                                                停止扫描
                                            </nut-button>
                                        );
                                    },
                                    right: () => {
                                        return (
                                            <nut-button
                                                shape="square"
                                                type="primary"
                                                size={"large"}
                                                onClick={() => {
                                                    showDialog({
                                                        title: "",
                                                        cancelText: "拒绝",
                                                        okText: "允许",
                                                        content:
                                                            "<p style='color:#87909c;font-size:14px;height: 90px;line-height:90px' >移动收发想要开启蓝牙</p>",
                                                        onOk: () => {
                                                            searchDevices();
                                                        }
                                                    });
                                                }}
                                            >
                                                开始扫描
                                            </nut-button>
                                        );
                                    }
                                }}
                            </nut-flex-line>
                        </nut-box>
                    </div>
                </div>
            );
        };
    },
});