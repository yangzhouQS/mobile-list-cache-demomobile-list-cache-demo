import { defineComponent, onBeforeMount, reactive, ref } from "vue";
import { FlowTaskToMeConfig } from "./flex-config";
import { CopyMe } from "./copy-me";
import { CopyMeStart } from "./copy-me-start";
import { CopyMeApprove } from "./copy-me-approve";
import { debounce } from "lodash";
import { useContext } from "../../../hooks/useContext";
import { flowTaskApiHelper } from "../../api-config";
import { ResulType } from "../../workflow-types";
import { GlobalToast } from "../../../utils";

/**
 * 与我相关
 */
export const FlowTaskToMe = defineComponent({
  name: "FlowTaskToMe",
  setup() {
    const flexConfig = reactive(FlowTaskToMeConfig);
    const ctx = useContext();
    const state = reactive({
      activeTab: "copyMe",
      filterText: ""
    });
    const tabsMap = reactive({
      copyMe: true,
      copyMeStart: false,
      copyMeApprove: false
    });
    const flexPopperConfig = reactive([
      {
        tag: "item-1",
        isFixed: false,
        size: "",
        paddingSize: "large",
        clearPadding: []
      },
      {
        tag: "item-2",
        isFixed: true,
        size: "80px",
        paddingSize: "large",
        clearPadding: ["top"]
      }
    ]);
    const showTop = ref(false);
    const flowData = ref([]);
    const checkVal = ref([]);
    const pendingRef = ref();
    const doneRef = ref();
    const flowRef = ref();
    const methods = {
      change: debounce(() => {
        // console.log("回车搜索");
      }, 300),
      getSearch: () => {
        pendingRef.value?.listRef?.reload();
        doneRef.value?.listRef?.reload();
        flowRef.value?.listRef?.reload();
        showTop.value = false;
      },
      getFlowName: () => {
        flowTaskApiHelper
          .queryDesignParams(ctx.tenantId, ctx.currentOrg.id)
          .then((result: ResulType) => {
            if (result.status === "success") {
              flowData.value = result.result;
            } else {
              GlobalToast.warn(result.message || "服务调用失败");
            }
          })
          .catch((error: Error) => {
            GlobalToast.error(error.message || "服务调用失败");
          });
      }
    };
    onBeforeMount(() => {
      methods.getFlowName();
    });

    return () => {
      return (
        <div class={"main-page"}>
          <nut-flex-box itemNum={flexConfig.length} item-config={flexConfig}>
            {{
              "item-1": () => {
                return (
                  <nut-searchbar
                    // background={"var(--nut-primary-color)"}
                    placeholder="请输入单据编号或名称检索"
                    v-model={state.filterText}
                    onChange={methods.change}
                  >
                    {{
                      rightout: () => {
                        return (
                          <svg
                            class="icon"
                            viewBox="0 0 1092 1024"
                            version="1.1"
                            xmlns="http://www.w3.org/2000/svg"
                            p-id="31774"
                            width="25"
                            height="25"
                            onClick={() => {
                              showTop.value = true;
                            }}
                          >
                            <path
                              d="M888.135123 156.685877a96.25446 96.25446 0 0 0 2.730623-103.900204A108.337467 108.337467 0 0 0 795.976598 0.016384H108.815326C68.743433 0.016384 33.245335 19.745135 13.926177 52.785673a96.25446 96.25446 0 0 0 2.730623 103.900204 27.579292 27.579292 0 0 0 2.867154 3.618075L245.209943 412.340453c14.130974 15.769348 21.844984 35.839427 21.844984 56.45563v342.624918c0 17.407721 15.018426 31.538695 33.518397 31.538696 18.431705 0 33.450131-14.130974 33.450132-31.538696v-342.693183c0-35.498099-13.311787-69.972214-37.614332-97.141913l-223.911084-249.920268a36.86341 36.86341 0 0 1 0-38.228721 41.573735 41.573735 0 0 1 36.317286-20.138345H795.976598c15.359754 0 28.944604 7.509213 36.385551 20.138345a36.86341 36.86341 0 0 1 0 38.228721l-223.911084 249.920268c-24.166013 26.623574-37.546066 61.23422-37.750863 97.210178v523.733487c0 17.407721 15.018426 31.538695 33.450132 31.538696s33.518397-14.130974 33.518397-31.606961V468.727818c0-20.684469 7.71401-40.686282 21.844983-56.45563l225.754255-251.89997a31.743492 31.743492 0 0 0 2.798889-3.754607v0.068266zM750.921319 441.216791c0 17.407721 15.018426 31.538695 33.518397 31.538696h237.359402c18.431705 0 33.450131-14.130974 33.450131-31.538696 0-17.475987-15.018426-31.606961-33.450131-31.606961H784.37145a32.562679 32.562679 0 0 0-33.450131 31.606961H750.921319z m239.612166 342.010528h-237.359402a32.562679 32.562679 0 0 0-33.450132 31.606961c0 17.407721 14.950161 31.606961 33.450132 31.606961h237.291136c18.499971 0 33.518397-14.130974 33.518397-31.606961 0-17.407721-15.018426-31.538695-33.450131-31.538695z m0-173.735887h-237.359402c-18.499971 0-33.450131 14.130974-33.450132 31.538696 0 17.475987 14.950161 31.606961 33.450132 31.60696h237.291136c18.499971 0 33.518397-14.130974 33.518397-31.60696 0-17.407721-15.018426-31.538695-33.450131-31.538696z"
                              fill="#345dfc"
                              p-id="31775"
                            ></path>
                          </svg>
                        );
                      }
                    }}
                  </nut-searchbar>
                );
              },
              "item-2": () => {
                return (
                  <nut-tabs
                    v-model={state.activeTab}
                    onClick={({ paneKey }) => {
                      tabsMap[paneKey] = true;
                    }}
                  >
                    <nut-tab-pane title="抄送我的" pane-key="copyMe">
                      <CopyMe ref={pendingRef} checkVal={checkVal.value} filerValue={state.filterText} />
                    </nut-tab-pane>
                    <nut-tab-pane title="我发起的" pane-key="copyMeStart">
                      {tabsMap.copyMeStart && (
                        <CopyMeStart ref={doneRef} checkVal={checkVal.value} filerValue={state.filterText} />
                      )}
                    </nut-tab-pane>
                    <nut-tab-pane title="我审批的" pane-key="copyMeApprove">
                      {tabsMap.copyMeApprove && (
                        <CopyMeApprove ref={flowRef} checkVal={checkVal.value} filerValue={state.filterText} />
                      )}
                    </nut-tab-pane>
                  </nut-tabs>
                );
              }
            }}
          </nut-flex-box>
          <nut-popup v-model:visible={showTop.value} position={"top"} round={true}>
            {{
              default: () => {
                return (
                  <div style={"height:500px;background:#fff"}>
                    <nut-flex-box item-num={flexPopperConfig.length} item-config={flexPopperConfig}>
                      {{
                        "item-1": () => {
                          return (
                            <nut-panel border title={"消息类型"} background paddingSize={"smalll"}>
                              <nut-checkbox-group ref="group" v-model={checkVal.value}>
                                {flowData.value.map((item: any) => {
                                  return (
                                    <nut-checkbox label={item.id} shape="button">
                                      {item.flowName}
                                    </nut-checkbox>
                                  );
                                })}
                              </nut-checkbox-group>
                            </nut-panel>
                          );
                        },
                        "item-2": () => {
                          return (
                            <nut-box border background paddingSize={"smalll"}>
                              <nut-flex-line
                                leftPadding={true}
                                rightPadding={true}
                                rightClearPadding={["left", "right", "bottom", "top"]}
                                leftClearPadding={["left", "bottom", "top"]}
                                leftWidth={"50%"}
                              >
                                {{
                                  default: () => {
                                    return (
                                      <nut-button
                                        size={"large"}
                                        plain={true}
                                        shape="square"
                                        type="primary"
                                        onClick={() => {
                                          checkVal.value = [];
                                          pendingRef.value?.listRef?.reload();
                                          doneRef.value?.listRef?.reload();
                                          flowRef.value?.listRef?.reload();
                                          showTop.value = false;
                                        }}
                                      >
                                        清空
                                      </nut-button>
                                    );
                                  },
                                  right: () => {
                                    return (
                                      <nut-button
                                        size={"large"}
                                        shape="square"
                                        type="primary"
                                        onClick={() => {
                                          showTop.value = false;
                                          methods.getSearch();
                                        }}
                                      >
                                        确定
                                      </nut-button>
                                    );
                                  }
                                }}
                              </nut-flex-line>
                            </nut-box>
                          );
                        }
                      }}
                    </nut-flex-box>
                  </div>
                );
              }
            }}
          </nut-popup>
        </div>
      );
    };
  }
});
