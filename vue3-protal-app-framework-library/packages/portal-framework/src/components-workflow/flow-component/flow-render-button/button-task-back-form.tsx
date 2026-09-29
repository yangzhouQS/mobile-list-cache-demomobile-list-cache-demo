import { defineComponent, reactive, watch } from "vue";
import { ButtonTaskBackFormConfig } from "./flex-config-render-button";
import { cloneDeep, find, isEmpty } from "lodash";
import { GlobalToast } from "../../../utils/global-toast";

export const ButtonTaskBackForm = defineComponent({
  name: "ButtonTaskBackForm",
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
    const state = reactive<{
      nextStepList: any[];
      saveLoading: boolean;
      [key: string]: any;
    }>({
      saveLoading: false,
      stepName: "",
      nextStepId: "",
      nextStepList: [],
      nextStep: {},
      members: []
    });
    const methods = {
      saveForm: () => {
        if (!state.nextStep || isEmpty(state.nextStep)) {
          GlobalToast.warning("请选择退回到的步骤");
          return;
        }

        if (!state.members || isEmpty(state.members)) {
          GlobalToast.warning("请选择处理人员");
          return;
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
      changeStep: (stepId: string) => {
        if (stepId) {
          const step = find(state.nextStepList, (item: any) => {
            return item.nextStep.id === stepId;
          });
          state.nextStep = step.nextStep;
          state.members = step.members;
        } else {
          // 清空操作
          state.nextStep = {};
          state.members = [];
        }
      },
      cancel() {
        emit("cancel");
      }
    };

    watch(
      () => {
        return props.nextStep;
      },
      () => {
        if (props.nextStep) {
          state.nextStepList = props.nextStep as any[];
          if (Array.isArray(props.nextStep) && props.nextStep.length > 0) {
            const stepData = props.nextStep[0] as any;

            state.nextStep = stepData.nextStep;
            state.nextStepId = stepData.nextStep.id;
            state.members = stepData.members;
          }
        } else {
          GlobalToast.warning("未查询到需要退回的步骤");
        }
      },
      { immediate: true, deep: true }
    );

    return () => {
      return (
        <div class={"main-page"}>
          <nut-flex-box itemNum={ButtonTaskBackFormConfig.length} item-config={ButtonTaskBackFormConfig}>
            {{
              "item-1": () => {
                return (
                  <nut-panel title={"请选择驳回到的步骤"} border>
                    {{
                      default: () => {
                        return (
                          <>
                            <nut-filter-item labelWidth={"80px"} label={"退回到"}>
                              {state.nextStep.properties && state.nextStep.properties.stepName}
                            </nut-filter-item>
                            <nut-filter-item labelWidth={"80px"} label={"处理人员"}>
                              {state.members.map((user, index) => {
                                return (
                                  <nut-tag
                                    class={"mr-2 mb-2"}
                                    closeable={true}
                                    key={user.id}
                                    type={"primary"}
                                    plain
                                    onClose={() => {
                                      if (state.members.length === 1) {
                                        GlobalToast.warning("不能继续删除，至少保留一位处理人员");
                                      } else {
                                        state.members.splice(index, 1);
                                      }
                                    }}
                                  >
                                    {user.name}
                                  </nut-tag>
                                );
                              })}
                            </nut-filter-item>
                          </>
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
                          type={"primary"}
                          loading={state.saveLoading}
                          disabled={state.saveLoading}
                          block
                          onClick={methods.saveForm}
                        >
                          确定驳回
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
