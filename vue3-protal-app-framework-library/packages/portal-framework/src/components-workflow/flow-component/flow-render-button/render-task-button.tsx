import { defineComponent, onMounted, PropType, reactive, ref, watch } from "vue";
import { InnerLine } from "../../inner-line/inner-line";
import { IPublicFlowPageConfigType, IPublicFlowButtonDataType, EButtonClick } from "../../workflow-types";
import { IconOther } from "../../icons";
import { buttonConfig } from "./button-config";
import { useContext } from "../../../hooks/useContext";
import { useRouter, useRoute } from "vue-router";
import { errorMessage, GlobalToast, $http, formatDate } from "../../../utils";
import { ButtonCopyForForm } from "./button-copy-for-form";
import { ButtonTaskBackForm } from "./button-task-back-form";
import { UserDataType } from "../../workflow-types";
import { ButtonSubmitForm } from "./button-submit-form";
import { get, trim } from "lodash";
import { flowTaskProcessRoute } from "../../workflow-utils/helper-router";
import { flowTaskApiHelper, getUserInfo } from "../../api-config/api-flow-task-helper";
import { formatUser } from "./render-button-utils";
import "./render-task-button-style.less";
import FlowSignatureCanvas from "../../flow-signature/flow-signature-canvas";
import { ICurrentSignatureConfigType } from "../../flow-signature/types";
import { saveSignatureData } from "../../flow-signature/utils/flow-func";

export const RenderTaskButton = defineComponent({
  name: "RenderTaskButton",
  props: {
    showPreviewDetail: {
      type: Boolean,
      default: false
    },
    flowStepButtons: {
      type: Array as PropType<IPublicFlowButtonDataType[]>,
      default: () => {
        return [];
      }
    },
    flowPageConfig: {
      type: Object as PropType<IPublicFlowPageConfigType>,
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
  emits: ["reload"],
  setup(props, { emit }) {
    const router = useRouter()!;
    const showPreviewDetail = ref(false);
    const route = useRoute();
    if (route.query?.showPreviewDetail === "true") {
      showPreviewDetail.value = true;
    }
    const dialogTitle = ref("");
    const disabled = ref(false);
    const ctx = useContext();
    const buttonConfigMap = ref<any>(buttonConfig);
    const currentClickButton = ref("");

    const signatureConfig = ref({
      productCode: "cbaseinfo",
      oriId: props.flowPageConfig.task.id,
      orgId: props.flowPageConfig.task.orgId,
      sourceId: props.flowPageConfig.task.instanceId,
      signatureLabel: "",
      signatureCode: "",
      signatureSource: "flowSignature",
      extField: "",
      url: "",
      userId: ctx.user.id,
      signer: ctx.user.name,
      remark: "审批流程保存签字照片"
    });
    const state = reactive<{
      fixedBtn: IPublicFlowButtonDataType[];
      otherBtn: IPublicFlowButtonDataType[];
      popoverSelectVisible: boolean;
      flowOption: string;
      currentSignatureConfig: ICurrentSignatureConfigType;
      [key: string]: any;
    }>({
      flowOptionVisible: false, // 审批意见
      popoverVisible: false,
      popoverSelectVisible: false,
      fixedBtn: [],
      otherBtn: [],
      otherSpan: 10,
      flowOption: "", // 处理意见

      // 当前签字项配置
      currentSignatureConfig: {}
    });

    const signatureCanvas = ref(null);

    // 正常流转的下一步
    const nextStep = ref({});

    // 退回操作的下一步
    const backNextStep = ref({});

    async function generateExecuteModel() {
      const task = props.flowPageConfig.task;
      const stepModel = props.flowPageConfig.stepModel;
      let attachKeys = "";
      if (props.flowPageConfig.showFlowSignature && signatureConfig.value.url) {
        signatureConfig.value.extField = JSON.stringify(props.flowPageConfig.currentSignatureConfig);

        await saveSignatureData({
          categoryCode: "",
          signature: signatureConfig.value
        });
      }

      // orgId对应的详情
      const data = (await $http.get("/flow/flow-common/get-org-info", {
        params: {
          orgId: task.orgId
        }
      })) as any;
      return {
        executeType: "",
        tenantId: ctx.tenantId,
        flowId: task.flowId,

        // 不能使用当前的fullId,不靠谱
        fullId: data.fullId,
        // 不能获取当前的组织机构，需要使用task任务上的orgId 和 orgName
        orgId: task.orgId,
        orgName: task.orgName,
        stepId: stepModel.id,
        taskId: task.id,
        taskTitle: task.taskTitle,
        instanceId: task.instanceId,
        instanceCode: task.instanceCode,
        flowGroupId: task.flowGroupId,
        sender: getUserInfo(),
        steps: [],
        flowComment: "同意", // 审批意见
        flowOption: trim(state.flowOption), // 处理说明
        attachKeys: attachKeys, // 附件管理keys 拼接的字符串

        // 处理结果
        flowCustomizeComment: props.flowPageConfig.isCustomizeComment ? props.flowPageConfig.flowCustomizeComment : "",
        isSign: 0, // 是否签批
        otherType: 0,
        attachment: false, // get(stepModel, "properties.attachment", false),
        paramsJSON: "",
        remark: "",
        buttonTitle: "",
        taskType: 0
      };
    }

    // 审批意见和签字信息区域
    const flowOptionPopupConfig = [
      {
        // 审批意见
        tag: "item-1",
        isFixed: false,
        size: "",
        paddingSize: "large",
        clearPadding: ["bottom"],
        isHidden: !props.flowPageConfig.commentDisplay
      },
      {
        // 签字信息
        tag: "item-2",
        isFixed: true,
        size: "",
        paddingSize: "large",
        clearPadding: [],
        isHidden: !props.flowPageConfig.showFlowSignature
      },
      {
        // 保存按钮
        tag: "item-3",
        isFixed: true,
        size: "",
        paddingSize: "large",
        clearPadding: [],
        isHidden: false
      }
    ];

    const methods = {
      extraHandleSubmit: async () => {
        let prevFlag = true;
        if (props.flowPageConfig.commentDisplay && props.flowPageConfig.commentRequired && !trim(state.flowOption)) {
          GlobalToast.warn("请填写审批处理意见~");
          return false;
        } else {
          prevFlag = true;
        }

        if (props.flowPageConfig.showFlowSignature) {
          if (!signatureCanvas.value?.isEmpty()) {
            prevFlag = true;
          } else {
            GlobalToast.warn("请完善审批签字信息~");
            prevFlag = false;
            return false;
          }
        }

        // 有签字控件
        /*if (prevFlag && signatureCanvas) {
          const data = await signatureCanvas.value.uploadSignatureFile();
          state.currentSignatureConfig.url = data.savedKey;
          debugger;
        }*/
        const signature = methods.getSignatureData();
        if (!signature.isEmpty) {
          const data = await signatureCanvas.value.uploadSignatureFile();
          if (data) {
            signatureConfig.value.url = data.savedKey;
          }
        }

        if (prevFlag) {
          state.flowOptionVisible = false;
        }
        // 开始签字文件上传
      },
      getSignatureData: () => {
        const result = {
          isEmpty: true,
          data: ""
        };
        if (signatureCanvas?.value?.getSignatureData) {
          Object.assign(result, signatureCanvas.value.getSignatureData());
        }

        return result;
      },
      toggleExtra: () => {
        state.flowOptionVisible = !state.flowOptionVisible;
      },
      reload: () => {
        emit("reload");
      },
      getBtnList: () => {
        state.fixedBtn = [];
        state.otherBtn = [];
        for (const btn of props.flowPageConfig.flowStepButtons) {
          if (state.fixedBtn.length < 2) {
            state.fixedBtn.push(btn);
          } else {
            state.otherBtn.push(btn);
          }
        }

        // 审批意见
        try {
          const commentBtn = {
            id: "commentBtn",
            buttonClick: EButtonClick.commentButton,
            buttonDescription: "审批意见点击处理按钮",
            buttonTitle: "审批意见"
          } as IPublicFlowButtonDataType;
          // 完成的任务不展示审批意见按钮
          if (props.flowPageConfig.commentDisplay && props.flowPageConfig.task.status != 2) {
            if (state.fixedBtn.length < 2) {
              state.fixedBtn.push(commentBtn);
            } else {
              state.otherBtn.push(commentBtn);
            }
          }
        } catch (e) {}
        state.otherSpan = state.fixedBtn.length === 2 ? 10 : 24;

        if (state.otherBtn.length === 0) {
          if (state.fixedBtn.length === 2) {
            state.otherSpan = 12;
          } else {
            state.otherSpan = 24;
          }
        }
      },
      onHandleClick: (button: IPublicFlowButtonDataType) => {
        if (!buttonConfigMap.value[button.buttonClick]) {
          GlobalToast.warn(`当前操作类型 [${button.buttonClick}] 未配置操作类型`);
        }
        currentClickButton.value = button.buttonClick;
        methods[button.buttonClick]();
        state.popoverVisible = false;
      },
      /*
       * 转交下一步
       * */
      submit: async () => {
        // 校验审批意见是否填写, 开启审批意见填写，强制
        if (props.flowPageConfig.commentDisplay && props.flowPageConfig.commentRequired === 1 && !trim(state.flowOption)) {
          GlobalToast.warn("请填写审批处理意见~");
          state.flowOptionVisible = true;
          return;
        }

        // 签字信息必须填写
        if (props.flowPageConfig.showFlowSignature && !signatureConfig.value.url) {
          GlobalToast.warn("请完善审批签字信息~");
          state.flowOptionVisible = true;
          return;
        }

        buttonConfigMap.value.submit.loading = true;
        disabled.value = true;

        const executeModel = (await generateExecuteModel()) as any;

        flowTaskApiHelper
          .getConfigNextStep(executeModel)
          .then((result: any) => {
            buttonConfigMap.value.submit.loading = false;
            disabled.value = false;
            if (result.status === "success") {
              if (result.result?.length > 0) {
                nextStep.value = result.result[0];
              }
              state.popoverSelectVisible = true;
            } else {
              GlobalToast.warning(result.message || "查询下一步骤失败");
            }
          })
          .catch((error: Error) => {
            console.log(error);
            buttonConfigMap.value.submit.disabled = false;
            GlobalToast.error(errorMessage(error, "查询下一步骤失败"));
          });
      },
      onSubmit: async (step: any) => {
        // 校验审批意见是否填写, 开启审批意见填写，强制
        if (props.flowPageConfig.commentDisplay && props.flowPageConfig.commentRequired === 1 && !trim(state.flowOption)) {
          GlobalToast.warn("请填写审批处理意见~");
          return;
        }

        const executeModel = await generateExecuteModel();
        executeModel.executeType = "submit";
        executeModel.flowComment = "同意";
        executeModel.buttonTitle = buttonConfigMap.value.submit.value || "转交下一步";

        Object.assign(executeModel, {
          steps: [
            {
              stepId: step.nextStep.id,
              stepName: step.nextStep.properties.stepName,

              // 下一步处理人员
              receives: formatUser(step.members)
            }
          ]
        });

        executeModel.flowOption = trim(state.flowOption); // props.flowPageConfig.flowOption;
        disabled.value = true;
        buttonConfigMap.value.stop.loading = true;
        flowTaskApiHelper
          .executeTask({
            executeModel,
            userInfo: getUserInfo()
          })
          .then((result: any) => {
            buttonConfigMap.value.stop.loading = false;
            if (result.status === "success") {
              GlobalToast.success("审批操作成功");
              methods.handleClose();
              methods.reload();
              // methods.routerGo();
            } else {
              GlobalToast.warning(result.message || "审批操作失败");
            }
          })
          .catch((error: Error) => {
            console.log(error);
            GlobalToast.error(errorMessage(error, "审批操作失败"));
          });
      },
      /**
       * 驳回操作
       * 1,是否允许驳回,获取驳回的下一步步骤配置
       * 2,驳回操作,创建待办任务
       */
      goBack: async () => {
        const executeModel = await generateExecuteModel();
        disabled.value = true;
        buttonConfigMap.value.goBack.loading = true;
        flowTaskApiHelper
          .getBackStep({
            executeModel,
            userInfo: getUserInfo()
          })
          .then((result: any) => {
            disabled.value = false;
            buttonConfigMap.value.goBack.loading = false;
            if (result.status === "success") {
              // GlobalToast.success(result.message || "任务驳回操作成功");

              backNextStep.value = get(result, "result.backSteps", []);

              disabled.value = true;
              state.popoverSelectVisible = true;
            } else {
              GlobalToast.error(result.message || "获取驳回步骤失败");
            }
          })
          .catch((error: Error) => {
            console.log(error);
            disabled.value = false;
            buttonConfigMap.value.goBack.loading = false;
            GlobalToast.error(errorMessage(error, "驳回操作失败"));
          });
      },
      /* 执行驳回任务,创建待办 */
      sendTaskBack: async ({ nextStep, members }) => {
        const executeModel = await generateExecuteModel();
        executeModel.executeType = "taskBack";
        executeModel.flowComment = "同意";
        Object.assign(executeModel, {
          steps: [
            {
              stepId: nextStep.id,
              stepName: nextStep.properties.stepName,

              // 下一步处理人员
              receives: formatUser(members)
            }
          ]
        });
        executeModel.buttonTitle = buttonConfigMap.value.goBack.value || "驳回";

        executeModel.flowOption = props.flowPageConfig.flowOption;
        disabled.value = true;
        buttonConfigMap.value.goBack.loading = true;
        flowTaskApiHelper
          .executeTask({
            executeModel,
            userInfo: getUserInfo()
          })
          .then((result: any) => {
            buttonConfigMap.value.goBack.loading = false;
            if (result.status === "success") {
              GlobalToast.success("操作成功");
              methods.reload();
              methods.handleClose();
            } else {
              GlobalToast.warning(result.message || "操作失败");
            }
          })
          .catch((error: Error) => {
            console.log(error);
            buttonConfigMap.value.goBack.loading = false;
            GlobalToast.error(errorMessage(error, "审批操作失败"));
          });
      },
      /*任务终止*/
      stop: async () => {
        console.log("stop");
        const executeModel = await generateExecuteModel();
        executeModel.executeType = "taskEnd";
        executeModel.flowOption = props.flowPageConfig.flowOption;
        executeModel.buttonTitle = buttonConfigMap.value.stop.value || "终止";

        buttonConfigMap.value.stop.loading = true;

        flowTaskApiHelper
          .executeTask({
            executeModel,
            userInfo: getUserInfo()
          })
          .then((result: any) => {
            buttonConfigMap.value.stop.loading = false;
            if (result.status === "success") {
              GlobalToast.success(result.message || "任务终止操作成功");
            } else {
              GlobalToast.warn(result.message || "终止操作失败");
            }
            methods.reload();
          })
          .catch((error: Error) => {
            console.log(error);
            GlobalToast.error(errorMessage(error, "终止操作失败"));
          });
      },
      /*抄送*/
      copyFor: async () => {
        console.log("copyFor");
        dialogTitle.value = "选择抄送接收人员";
        state.popoverSelectVisible = true;
      },
      /**
       * 抄送完成 发送任务
       * @param userList
       */
      sendCopyFor: async (userList: UserDataType[]) => {
        const executeModel = (await generateExecuteModel()) as any;
        executeModel.receives = userList;
        flowTaskApiHelper
          .buttonTaskCopyFor({
            executeModel,
            userInfo: getUserInfo()
          })
          .then((result: any) => {
            buttonConfigMap.value.stop.loading = false;
            if (result.status === "success") {
              GlobalToast.success(result.message || "任务抄送操作成功");
              methods.handleClose();
              methods.reload();
              methods.handleClose();
              // methods.routerGo();
            } else {
              GlobalToast.warning(result.message || "抄送操作失败");
            }
          })
          .catch((error: Error) => {
            console.log(error);
            GlobalToast.error(errorMessage(error, "抄送操作失败"));
          });
      },
      /*完成*/
      complete: async () => {
        if (props.flowPageConfig.commentDisplay && props.flowPageConfig.commentRequired === 1 && !trim(state.flowOption)) {
          GlobalToast.warn("请填写审批处理意见~");
          state.flowOptionVisible = true;
          return;
        }
        const executeModel = await generateExecuteModel();
        Object.assign(executeModel, {
          executeType: "completed",
          flowComment: "同意",
          buttonTitle: "完成",
          flowOption: trim(state.flowOption)
        });
        disabled.value = true;
        buttonConfigMap.value.complete.loading = true;
        flowTaskApiHelper
          .executeTask({
            executeModel,
            userInfo: getUserInfo()
          })
          .then((result: any) => {
            buttonConfigMap.value.complete.loading = false;
            if (result.status === "success") {
              GlobalToast.success(result.message || "任务完成操作成功");
            } else {
              disabled.value = false;
              buttonConfigMap.value.copyForComplete.loading = false;
              GlobalToast.warning(result.message || "完成操作失败");
            }
            methods.reload();
          })
          .catch((error: Error) => {
            console.log(error);
            GlobalToast.error(errorMessage(error, "完成操作失败"));
          });
      },
      /*抄送任务进行阅知*/
      copyForComplete: async () => {
        console.log("copyForComplete");
        const executeModel = await generateExecuteModel();
        executeModel.executeType = "copyForComplete";
        disabled.value = true;
        buttonConfigMap.value.copyForComplete.loading = true;

        flowTaskApiHelper
          .executeTask({
            executeModel,
            userInfo: getUserInfo()
          })
          .then((result: any) => {
            buttonConfigMap.value.copyForComplete.loading = false;
            if (result.status === "success") {
              GlobalToast.success(result.message || "任务阅知操作成功");
              // methods.routerGo();
            } else {
              disabled.value = false;
              buttonConfigMap.value.copyForComplete.loading = false;
              GlobalToast.warning(result.message || "阅知操作失败");
            }
            methods.reload();
          })
          .catch((error: Error) => {
            console.log(error);
            GlobalToast.error(errorMessage(error, "阅知操作失败"));
          });
      },
      flowProcess: () => {
        const task = props.flowPageConfig.task;
        if (!task || !task.id) {
          GlobalToast.warn("查看流程任务的参数不完整");
          return;
        }
        flowTaskProcessRoute(router, task);
      },

      // 审批意见
      commentButton: () => {
        state.flowOptionVisible = true;
      },
      handleClose: () => {
        disabled.value = false;
        dialogTitle.value = "";
        currentClickButton.value = "";
        state.popoverSelectVisible = false;

        buttonConfigMap.value.submit.loading = false;
        buttonConfigMap.value.goBack.loading = false;
        buttonConfigMap.value.stop.loading = false;
        buttonConfigMap.value.copyFor.loading = false;
        buttonConfigMap.value.complete.loading = false;
        buttonConfigMap.value.copyForComplete.loading = false;
        buttonConfigMap.value.flowProcess.loading = false;
      },
      renderDialog: () => {
        return (
          <nut-popup duration={0} v-model:visible={state.popoverSelectVisible} position="bottom" style={{ height: "100%" }}>
            {{
              default: () => {
                /* 转交下一步 */
                if (currentClickButton.value === "submit") {
                  dialogTitle.value = "提交下一环节";
                  return (
                    <ButtonSubmitForm onCancel={methods.handleClose} onSubmit={methods.onSubmit} nextStep={nextStep.value} />
                  );
                }

                /* 任务抄送功能按钮 */
                if (currentClickButton.value === "copyFor") {
                  return <ButtonCopyForForm onCancel={methods.handleClose} onSendCopyForm={methods.sendCopyFor} />;
                }

                /* 驳回操作,选择驳回到指定步骤 */
                if (currentClickButton.value === "goBack") {
                  return (
                    <ButtonTaskBackForm
                      onCancel={methods.handleClose}
                      onSubmit={methods.sendTaskBack}
                      nextStep={backNextStep.value}
                    />
                  );
                }
                return null;
              }
            }}
          </nut-popup>
        );
      }
    };

    watch(
      () => {
        return props.flowPageConfig.flowStepButtons;
      },
      () => {
        methods.getBtnList();
      },
      { immediate: true, deep: true }
    );

    watch(
      () => props.flowPageConfig.currentSignatureConfig,
      () => {
        if (props.flowPageConfig.currentSignatureConfig?.config) {
          state.currentSignatureConfig = props.flowPageConfig.currentSignatureConfig;
          Object.assign(signatureConfig.value, {
            signatureCode: state.currentSignatureConfig.config.code,
            signatureLabel: state.currentSignatureConfig.config.label,
            // signatureSource: state.currentSignatureConfig.config.source,
            extField: JSON.stringify(state.currentSignatureConfig)
          });
        }
      },
      {
        immediate: true,
        deep: true
      }
    );

    onMounted(() => {
      methods.getBtnList();
    });
    return () => {
      if (showPreviewDetail.value) {
        return (
          <nut-box clear-padding={[]} background>
            <nut-button block type={"primary"} plain onClick={methods.flowProcess}>
              流程处理过程
            </nut-button>
          </nut-box>
        );
      }
      return (
        <nut-flex-box
          itemNum={2}
          isRow={false}
          item-config={[
            {
              tag: "item-1",
              isFixed: true,
              size: "",
              paddingSize: "small",
              isHidden: false,
              clearPadding: ["left", "top", "right", "bottom"]
            },
            {
              tag: "item-2",
              isFixed: false,
              size: "",
              paddingSize: "small",
              clearPadding: ["left", "top", "right", "bottom"]
            }
          ]}
        >
          {{
            "item-1": () => {
              console.log("---签字区域--初始化---", formatDate());
              return (
                <div class={"button-extra-container"}>
                  <div class={"button-extra__title"} onClick={methods.toggleExtra}>
                    其他信息
                  </div>

                  <nut-popup
                    pop-class={"extra-popup-container"}
                    position="bottom"
                    close-on-click-overlay={false}
                    v-model:visible={state.flowOptionVisible}
                    style={{ background: "#ffffff" }}
                  >
                    <nut-flex-box itemNum={flowOptionPopupConfig.length} item-config={flowOptionPopupConfig}>
                      {{
                        "item-1": () => {
                          return (
                            <div class={"extra-popup-content"}>
                              <InnerLine class={"mb-2"}>
                                <span>
                                  <i class="icon approve approve-chuliyijian text-primary pa-1" />
                                  审批处理意见
                                  {props.flowPageConfig.commentRequired === 1 && <span class={"text-red"}>*</span>}
                                </span>
                              </InnerLine>
                              {props.flowPageConfig.isTaskPreview && (
                                <nut-textarea modelValue={props.flowPageConfig.task.flowOption} readonly={true} />
                              )}
                              {!props.flowPageConfig.isTaskPreview && (
                                <>
                                  <nut-textarea
                                    class={"extra-textarea"}
                                    rows={5}
                                    limit-show
                                    max-length={60}
                                    placeholder={"请输入处理说明..."}
                                    v-model={state.flowOption}
                                  />
                                </>
                              )}
                            </div>
                          );
                        },
                        "item-2": () => {
                          return (
                            <div>
                              <InnerLine class={"mb-2"}>
                                <span>
                                  <i class="icon approve approve-chuliyijian text-primary pa-1" />
                                  审批签字
                                  {props.flowPageConfig.commentRequired === 1 && <span class={"text-red"}>*</span>}
                                </span>
                              </InnerLine>
                              {props.flowPageConfig.isTaskPreview && props.flowPageConfig.signaturePreviewUrl && (
                                <div class={"signature-preview-wrap"}>
                                  <img
                                    class={"signature-preview-img"}
                                    src={props.flowPageConfig.signaturePreviewUrl}
                                    alt="审批签字"
                                  />
                                </div>
                              )}
                              {!props.flowPageConfig.isTaskPreview && props.flowPageConfig.showFlowSignature && (
                                <FlowSignatureCanvas ref={signatureCanvas} />
                              )}
                            </div>
                          );
                        },
                        "item-3": () => {
                          return (
                            <nut-flex-line>
                              {{
                                right: () => {
                                  if (props.flowPageConfig.isTaskPreview) {
                                    return (
                                      <nut-button
                                        type={"danger"}
                                        plain={true}
                                        onClick={() => {
                                          state.flowOptionVisible = false;
                                        }}
                                      >
                                        关闭
                                      </nut-button>
                                    );
                                  }
                                  return (
                                    <nut-button type={"primary"} plain={true} onClick={methods.extraHandleSubmit}>
                                      填写完毕
                                    </nut-button>
                                  );
                                }
                              }}
                            </nut-flex-line>
                          );
                        }
                      }}
                    </nut-flex-box>
                  </nut-popup>
                </div>
              );
            },
            "item-2": () => {
              return (
                <>
                  {methods.renderDialog()}
                  <nut-box clear-padding={[]} background id="rowTargetId">
                    <nut-row gutter={10}>
                      {state.otherBtn.length > 0 && (
                        <nut-col span={4}>
                          <nut-popover v-model:visible={state.popoverVisible} location="top-start">
                            {{
                              reference: () => {
                                return (
                                  <nut-button block type={"primary"} plain>
                                    <div class={"d-flex align-center justify-center"}>
                                      <IconOther />
                                    </div>
                                  </nut-button>
                                );
                              },
                              content: () => {
                                return (
                                  <div style={{ width: "160px" }} class={"pa-2"}>
                                    {/*下拉其他按钮*/}
                                    {state.otherBtn.map((btn: IPublicFlowButtonDataType) => {
                                      const cfg = buttonConfigMap.value[btn.buttonClick];
                                      return (
                                        <nut-button
                                          onClick={methods.onHandleClick.bind(null, btn)}
                                          class={"mb-1"}
                                          type={cfg.type}
                                          block
                                          plain={cfg.plain}
                                          loading={cfg.loading}
                                        >
                                          {btn.buttonTitle}
                                        </nut-button>
                                      );
                                    })}
                                  </div>
                                );
                              }
                            }}
                          </nut-popover>
                        </nut-col>
                      )}

                      {/*两个固定按钮*/}
                      {state.fixedBtn.map((button: IPublicFlowButtonDataType) => {
                        const cfg = buttonConfigMap.value[button.buttonClick];
                        return (
                          <nut-col span={state.otherSpan}>
                            <nut-button
                              type={cfg.type}
                              loading={cfg.loading}
                              plain={cfg.plain}
                              block
                              onClick={methods.onHandleClick.bind(null, button)}
                            >
                              {button.buttonTitle}
                            </nut-button>
                          </nut-col>
                        );
                      })}
                    </nut-row>
                  </nut-box>
                </>
              );
            }
          }}
        </nut-flex-box>
      );
    };
  }
});
