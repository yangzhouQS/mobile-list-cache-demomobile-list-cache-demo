import { defineComponent, onMounted, reactive, watch } from "vue";
import { ButtonSubmitFormConfig } from "./flex-config-render-button";
import { cloneDeep, get } from "lodash";
import { GlobalToast } from "../../../utils/global-toast";

// 转交下一步操作
export const ButtonSubmitForm = defineComponent({
  name: "ButtonSubmitForm",
  props: {
    nextStep: {
      type: Object,
      default: () => {
        return {};
      }
    }
  },
  emits: ["cancel", "submit"],
  setup(props, { emit }) {
    const state = reactive({
      saveLoading: false,
      stepName: "",
      nextStep: {},
      members: []
    });
    const methods = {
      saveForm: () => {
        if (!state.members || state.members.length === 0) {
          GlobalToast.warning("下一步审批人员不存在, 任务无法流转");
          return false;
        }

        state.saveLoading = true;
        emit(
          "submit",
          cloneDeep({
            nextStep: state.nextStep,
            members: state.members
          })
        );
      },
      cancel() {
        emit("cancel");
      },
      // 删除审批人
      removeUser: (index: number) => {
        if (state.members.length === 1) {
          GlobalToast.warning("至少保留一个审批人");
          return;
        }
        state.members.splice(index, 1);
      }
    };

    watch(
      () => {
        return props.nextStep;
      },
      () => {
        state.nextStep = props.nextStep.nextStep;
        state.stepName = get(props.nextStep, "nextStep.properties.stepName", "");
        state.members = get(props.nextStep, "members", []);
      },
      { immediate: true, deep: true }
    );
    onMounted(() => {});

    return () => {
      return (
        <div class={"main-page"}>
          <nut-flex-box itemNum={ButtonSubmitFormConfig.length} item-config={ButtonSubmitFormConfig}>
            {{
              "item-1": () => {
                return (
                  <nut-panel title={""}>
                    {{
                      tool: () => {
                        return (
                          <>
                            <i class="icon approve approve-chuliren pa-1 text-primary"></i>
                            下一处理人
                            <span class="font-bold">({state.stepName})</span>
                          </>
                        );
                      },
                      default: () => {
                        return (
                          <nut-list-v2-only ref="listRef" is-virtual={true} isRefresh={false} items={state.members}>
                            {{
                              default: ({ item, index }) => {
                                return (
                                  <nut-box background>
                                    <div class={"mb-1 d-flex justify-space-between"}>
                                      <span>{item.name}</span>
                                      <nut-button
                                        type={"danger"}
                                        size={"mini"}
                                        plain
                                        onClick={methods.removeUser.bind(null, index)}
                                      >
                                        删除
                                      </nut-button>
                                    </div>
                                  </nut-box>
                                );
                              }
                            }}
                          </nut-list-v2-only>
                        );
                      }
                    }}
                  </nut-panel>
                );
              },
              "item-2": () => {
                return (
                  <nut-box background>
                    <nut-row gutter={10}>
                      <nut-col span={12}>
                        <nut-button disabled={state.saveLoading} type={"primary"} plain block onClick={methods.cancel}>
                          取消
                        </nut-button>
                      </nut-col>
                      <nut-col span={12}>
                        <nut-button
                          disabled={state.saveLoading}
                          loading={state.saveLoading}
                          type={"primary"}
                          block
                          onClick={methods.saveForm}
                        >
                          确定
                        </nut-button>
                      </nut-col>
                    </nut-row>
                  </nut-box>
                );
              }
            }}
          </nut-flex-box>
        </div>
      );
    };
  }
});
