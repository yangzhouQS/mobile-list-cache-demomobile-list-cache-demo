import { defineComponent, reactive, PropType, h, onMounted, watch } from "vue";
import { $http } from "../../../utils";
import { appStore } from "../../../store/frame-store";
import { Config } from "./types";
import { showToast } from "@cs/nutui-pro";
import { showDialog } from "@nutui/nutui";
import { ComInput } from "./com-input";
import { ComCheckbox } from "./com-checkbox";
import { ComSelect } from "./com-select";
import { ComDatePicker } from "./com-date-picker";
import { ComInputNumber } from "./com-input-number";
import { ComJsonEdit } from "./com-json-edit";
import { Edit, Refresh, Tips } from "@nutui/icons-vue";
import { ResulType } from "../../../components-workflow";
import "../style.less";

interface ValueParams {
  paramsKey: string;
  paramsValue: string | boolean | number | object;
  paramsEditable: boolean | number;
}

interface UpdateParams {
  namespaceCode?: string;
  configVals?: ValueParams[];
  tenantId?: number | string;
  orgId?: string;
  userId?: number;
  paramsId?: string;
  attributePath?: string;
  global: string;
  level?: number;
}

export const Setting = defineComponent({
  name: "Setting",
  props: {
    config: Array as PropType<any>
  },
  emits: ["reload"],
  setup: function (props, { emit }) {
    const store = appStore();
    const formModel = reactive(props.config);
    const cellComp = {
      ComInput,
      ComInputNumber,
      ComCheckbox,
      ComDatePicker,
      ComSelect,
      ComJsonEdit
    };
    const updateMethod = async (key: string, value: object | string | number | boolean, con: Config) => {
      const params: UpdateParams = {
        namespaceCode: store.configSetting.namespaceCode,
        configVals: [{ paramsKey: key, paramsValue: value, paramsEditable: con.editable.value === 1 }],
        global: "global",
        tenantId: String(store.$context.tenantId),
        orgId: store.orgRoot.fullId,
        userId: store.$context.userId,
        level: 3
      };
      const result = (await $http.post("/mp-configuration/config-panel-write", params)) as ResulType;
      if (result.status === "success") {
        showToast.success("修改成功！");
        emit("reload");
      } else {
        showToast.fail("修改配置异常" + result.message);
      }
    };
    const methods = {
      clearParamsValue: (con: Config) => {
        const pathArr: string[] = [];
        pathArr.push("全局");
        pathArr.push(store.$context.tenantName);
        pathArr.push(store.$context.orgFullName);
        pathArr.push(store.$context.userName);
        showDialog({
          title: "提示",
          content:
            "<p style='display: block;margin: 8px'>只该操作会清除【" + pathArr.join("-") + "】路径下的配置值，是否继续?</p>",
          onOk: async () => {
            // 过滤路径
            const params: UpdateParams = {
              namespaceCode: store.configSetting.namespaceCode,
              paramsId: con.id,
              level: 3,
              tenantId: String(store.$context.tenantId),
              orgId: store.orgRoot.fullId,
              global: "global",
              userId: store.$context.userId
            };
            const result = (await $http.post("/mp-configuration/config-panel-delete", params)) as ResulType;
            if (result.status === "success") {
              showToast.success("修改成功！");
              emit("reload");
            } else {
              showToast.fail("操作异常" + result.message);
            }
          }
        });
      },
      handleFormChange: async (item: any, val: any) => {
        // console.log("handleFormChange", item);
        if (item.isRead) {
          return;
        } else {
          await updateMethod(item.paramsKey, val, item);
        }
        // if (item.isRead) {
        //   showDialog({
        //     title: "提示",
        //     content: "只读状态设置值以后不能修改，是否继续?",
        //     onOk: async () => {
        //       await updateMethod(item.paramsKey, val, item);
        //     }
        //   });
        // } else {
        // }
      }
    };
    const getIsEnable = (con: Config) => {
      if (!con.editable.isEnable) return false;
      if (con.isRead) {
        return con.isNest ? !con.isHasConfig : con.isCurrentConfig === 0;
      }
      return true;
    };

    onMounted(() => {
      console.log("222", props.config);
    });

    watch(
      () => props.config,
      (newConfig, oldConfig) => {
        console.log("newConfig", newConfig, "oldConfig", oldConfig);
      },
      { immediate: true, deep: true }
    );
    return () => {
      return (
        <nut-form model-value={formModel} labelPosition={"right"}>
          {props.config.map((item: any) => {
            return (
              <nut-row style={"display: flex;align-items: baseline;justify-content: space-around;"} key={item.id}>
                <nut-collapse style={"width: 100%;"}>
                  <nut-collapse-item name={"name1"} rotate={0}>
                    {{
                      title: () => {
                        return (
                          <nut-form-item>
                            {{
                              label: () => {
                                return (
                                  <div>
                                    <nut-ellipsis direction={"end"} content={item.configUi.label}></nut-ellipsis>
                                  </div>
                                );
                              },
                              default: () => {
                                return h(cellComp[item.configUi.comp], {
                                  options: item.configUi,
                                  value: item.value,
                                  disabled: !getIsEnable(item),
                                  onChange: (val: any) => {
                                    methods.handleFormChange(item, val);
                                  }
                                });
                              }
                            }}
                          </nut-form-item>
                        );
                      },
                      value: () => {
                        return (
                          <div>
                            {(getIsEnable(item) && item.isRead) || (getIsEnable(item) && item.isCurrentConfig) ? (
                              <div style={"display:flex;align-items: center;height:100%;justify-content: space-around;"}>
                                {getIsEnable(item) && item.isCurrentConfig ? (
                                  <div
                                    onClick={() => {
                                      methods.clearParamsValue(item);
                                    }}
                                  >
                                    <Refresh style={"color:red"}></Refresh>
                                  </div>
                                ) : getIsEnable(item) && item.isRead ? (
                                  <div
                                    onClick={async () => {
                                      if (item.isRead) {
                                        showDialog({
                                          title: "提示",
                                          content: "只读状态设置值以后不能修改，是否继续?",
                                          onOk: async () => {
                                            await updateMethod(item.paramsKey, item.value, item);
                                          }
                                        });
                                      } else {
                                        await updateMethod(item.paramsKey, item.value, item);
                                      }
                                    }}
                                  >
                                    <Edit style={"color:#496dfd"}></Edit>
                                  </div>
                                ) : (
                                  <div></div>
                                )}
                              </div>
                            ) : (
                              <div style={"text-align:center"}></div>
                            )}
                          </div>
                        );
                      },
                      icon: () => {
                        return item.content && item.content.length > 0 ? (
                          <div class="config-label-icon">
                            <Tips></Tips>
                          </div>
                        ) : (
                          <div></div>
                        );
                      },
                      default: () => {
                        return <div>{item.content}</div>;
                      }
                    }}
                  </nut-collapse-item>
                </nut-collapse>
                {/*<nut-col span={20}>*/}
                {/*  <nut-form-item style="width:100%">*/}
                {/*    {{*/}
                {/*      label: () => {*/}
                {/*        return (*/}
                {/*          <div class="config-label">*/}
                {/*            {item.content && item.content.length > 0 ? (*/}
                {/*              <div class="config-label-icon">*/}
                {/*                <nut-popover v-model:visible={item.isShow} location="right">*/}
                {/*                  {{*/}
                {/*                    reference: () => {*/}
                {/*                      return <Tips></Tips>;*/}
                {/*                    },*/}
                {/*                    content: () => {*/}
                {/*                      return <div style={"width: 200px;padding: 8px;"}>{item.content}</div>;*/}
                {/*                    }*/}
                {/*                  }}*/}
                {/*                </nut-popover>*/}
                {/*              </div>*/}
                {/*            ) : (*/}
                {/*              <div></div>*/}
                {/*            )}*/}
                {/*            <div>*/}
                {/*              <nut-ellipsis direction={"end"} content={item.configUi.label}></nut-ellipsis>*/}
                {/*            </div>*/}
                {/*          </div>*/}
                {/*        );*/}
                {/*      },*/}
                {/*      default: () => {*/}
                {/*        return h(cellComp[item.configUi.comp], {*/}
                {/*          options: item.configUi,*/}
                {/*          value: item.value,*/}
                {/*          disabled: !getIsEnable(item),*/}
                {/*          onChange: (val: any) => {*/}
                {/*            methods.handleFormChange(item, val);*/}
                {/*          }*/}
                {/*        });*/}
                {/*      }*/}
                {/*    }}*/}
                {/*  </nut-form-item>*/}
                {/*</nut-col>*/}
                {/*<nut-col span={4}>*/}
                {/*  {(getIsEnable(item) && item.isRead) || (getIsEnable(item) && item.isCurrentConfig) ? (*/}
                {/*    <div style={"display:flex;align-items: center;height:100%;justify-content: space-around;"}>*/}
                {/*      {getIsEnable(item) && item.isCurrentConfig ? (*/}
                {/*        <div*/}
                {/*          onClick={() => {*/}
                {/*            methods.clearParamsValue(item);*/}
                {/*          }}*/}
                {/*        >*/}
                {/*          <Refresh style={"color:red"}></Refresh>*/}
                {/*        </div>*/}
                {/*      ) : getIsEnable(item) && item.isRead ? (*/}
                {/*        <div*/}
                {/*          onClick={async () => {*/}
                {/*            if (item.isRead) {*/}
                {/*              showDialog({*/}
                {/*                title: "提示",*/}
                {/*                content: "只读状态设置值以后不能修改，是否继续?",*/}
                {/*                onOk: async () => {*/}
                {/*                  await updateMethod(item.paramsKey, item.value, item);*/}
                {/*                }*/}
                {/*              });*/}
                {/*            } else {*/}
                {/*              await updateMethod(item.paramsKey, item.value, item);*/}
                {/*            }*/}
                {/*          }}*/}
                {/*        >*/}
                {/*          <Edit style={"color:#496dfd"}></Edit>*/}
                {/*        </div>*/}
                {/*      ) : (*/}
                {/*        <div></div>*/}
                {/*      )}*/}
                {/*    </div>*/}
                {/*  ) : (*/}
                {/*    <div style={"text-align:center"}></div>*/}
                {/*  )}*/}
                {/*</nut-col>*/}
              </nut-row>
            );
          })}
        </nut-form>
      );
    };
  }
});
