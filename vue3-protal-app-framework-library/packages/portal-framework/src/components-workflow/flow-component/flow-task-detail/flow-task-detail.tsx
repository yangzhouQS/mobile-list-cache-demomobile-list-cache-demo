import { defineComponent, onMounted, ref } from "vue";
import { setNavigationBarConfig } from "../../../utils/iwop-util";
import { FlowTaskDetailConfig } from "./flex-config-detail";
import type { IPublicFlowButtonDataType, IPublicTaskItemType, IPublicFlowNodeType, ResulType } from "../../workflow-types";
import { useDesignJson } from "./use-design-json";
import { useRoute, useRouter } from "vue-router";
import { get, isNil, isObject, pick, some } from "lodash";
import { GlobalToast, errorMessage, $http } from "../../../utils";
const { utils } = window.AssemboxMobile;
import { RenderCanvas } from "./render-canvas";
import { flowTaskApiHelper } from "../../api-config";
import { RenderTaskButton } from "../flow-render-button/render-task-button";
import { addScript, addStyle } from "../../../utils/dom";
import ISignConfigType from "../../workflow-utils/flow-event-utils";
import { queryConfigData } from "../../workflow-utils/flow-utils";
import { formatHandler } from "../../flow-signature/utils/flow-func";
import { ICurrentSignatureConfigType } from "../../flow-signature/types";

export const FlowTaskDetail = defineComponent({
  name: "FlowTaskDetail",
  setup() {
    const { designJson } = useDesignJson();
    const router = useRouter();
    const route = useRoute();
    const renderKey = ref(Date.now());
    const loading = ref(true);
    const isRender = ref(false);
    const item2IsHidden = ref(false);

    const signatureCanvas = ref(null);
    // 签字照片数据
    const signatureImgData = ref([]);

    // 按钮区域是否展示
    const isHiddenItem1 = ref(true);

    const flowConfig = ref<{
      flowStepButtons: IPublicFlowButtonDataType[];
      flowDesignJson: string;
      stepModel: IPublicFlowNodeType;
      task: IPublicTaskItemType;
      attachment: boolean; // 附件
      commentDisplay: boolean; // 意见栏是否显示
      commentRequired: number; // 处理结果是否必填
      flowOption: string; // 处理说明
      isCustomizeComment: boolean; // 是否允许自定义
      flowCustomizeComment: string; // 自定义选择的结果
      isTaskPreview: boolean; // 是否为预览，不显示顶部操作按钮行
      showFlowProcessButton: boolean; // 任务完成是否展示处理流程进度的按钮

      signatureOptions: ISignConfigType[]; // 签名配置
      showFlowSignature: boolean;
      currentSignatureConfig: ICurrentSignatureConfigType;
      signaturePreviewUrl: string; // 签字预览照片
      [key: string]: any;
    }>({
      flowStepButtons: [] as any,
      flowDesignJson: "" as any,
      stepModel: {} as any,
      task: {} as any,
      attachment: false,
      commentDisplay: false,
      commentRequired: 0,
      flowOption: "",
      isCustomizeComment: false,
      flowCustomizeComment: "",
      isTaskPreview: false,
      showFlowProcessButton: true,
      signatureOptions: [],
      showFlowSignature: false,
      currentSignatureConfig: {}, // 当前签字项配置
      signaturePreviewUrl: ""
    });

    const flowDesignJson = ref("");

    let _config: any = null;

    function parseConfig() {
      if (isNil(flowDesignJson.value)) {
        GlobalToast.warn("表单配置无效");
        loading.value = false;
        return false;
      }
      try {
        const schema = JSON.parse(flowDesignJson.value);
        if (isObject(schema)) {
          _config = utils.parseJson(flowDesignJson.value);

          run(_config);
          loading.value = false;
          renderKey.value = Date.now();
          isRender.value = true; // 开始渲染啦
        } else {
          GlobalToast.warn("表单配置格式不正确");
          loading.value = false;
        }
      } catch (error) {
        console.log(error);
        loading.value = false;
        GlobalToast.warn("表单配置序列化失败");
      }
    }

    function run(config) {
      if (config.routerConfig) {
        const keys = Object.keys(config.routerConfig);
        for (const key of keys) {
          if (!router.hasRoute(key)) {
            const routerConfig = config.routerConfig[key];
            if (routerConfig.path === "/") {
              routerConfig.path = `/${routerConfig.name}`;
            }
            const localConfig = {
              path: routerConfig.path,
              name: routerConfig.name ?? Math.random(),
              meta: routerConfig.meta,
              component: RenderCanvas
            };
            router.addRoute(localConfig);

            (router.options.routes as any[]).push(localConfig);
          }
        }
      }
    }

    const methods = {
      validSignatureStatus: () => {
        const result = {
          hasSigned: false,
          message: "当前审批步骤需要签字，请完善保存签字信息"
        };

        // 无需签字
        if (!flowConfig.value.showFlowSignature) {
          result.message = "当前审批步骤不需要签字";
          result.hasSigned = true;
          return result;
        }

        result.hasSigned = signatureCanvas.value?.signatureRefFunc().hasSigned;

        return result;
      },
      injectThirdPackage: (flowDesignJsonString: string) => {
        return new Promise((resolve, reject) => {
          try {
            const flowDesignJson = JSON.parse(flowDesignJsonString);
            const dependencies = get(flowDesignJson, "globalConfig.dependencies", []);

            if (dependencies && dependencies.length > 0) {
              const thirdStyles = [];
              const thirdScripts = [];
              dependencies.forEach((item: any) => {
                if (item.fileType === "style") {
                  thirdStyles.push(item.fileUrl);
                } else if (item.fileType === "script") {
                  thirdScripts.push(item.fileUrl);
                }
              });
              Promise.allSettled([...[...thirdStyles].map(src => addStyle(src)), ...[...thirdScripts].map(src => addScript(src))])
                .catch(err => {
                  console.error("自定义依赖加载错误:", err);
                  reject(err);
                })
                .finally(() => {
                  console.log("自定义组件依赖初始化完成");
                  resolve(true);
                });
            } else {
              resolve(true);
            }
          } catch (e) {
            console.log("表单依赖解析失败:", e);
            resolve(true);
          }
        });
      },
      getFlowPage: (taskData: IPublicTaskItemType) => {
        const params = Object.assign({}, pick(taskData, ["tenantId", "flowId", "orgId", "instanceId"]), {
          taskId: taskData.id,
          platform: "mobile"
        });

        loading.value = true;
        flowTaskApiHelper
          .queryFlowPage(params)
          .then(async (result: ResulType) => {
            if (result.status === "success") {
              flowConfig.value.flowStepButtons = get(result, "result.flowStepButtons", []);
              flowConfig.value.stepModel = get(result, "result.stepModel", {});

              flowConfig.value.flowDesignJson = get(result, "result.flowDesignJson", null);
              flowConfig.value.task = get(result, "result.task", {});
              flowDesignJson.value = flowConfig.value.flowDesignJson as string;
              designJson.value = flowDesignJson.value;

              const jsonObj = JSON.parse(flowDesignJson.value);

              // 是否任务预览
              const isTaskPreview = [2, "2"].includes(flowConfig.value.task.status);
              flowConfig.value.isTaskPreview = isTaskPreview;
              isHiddenItem1.value = isTaskPreview;

              // 附件和意见栏是否显示
              flowConfig.value.attachment = get(flowConfig.value.stepModel, "properties.attachment", false);
              flowConfig.value.commentDisplay = get(flowConfig.value.stepModel, "properties.commentDisplay", false);

              // 校验是否必填
              const commentRequired = get(flowConfig.value.stepModel, "properties.commentRequired", 0);
              flowConfig.value.commentRequired = commentRequired;

              // 自定义结果处理
              flowConfig.value.isCustomizeComment = get(flowConfig.value, "stepModel.properties.isCustomizeComment", false);
              const customizeComments = get(flowConfig.value, "stepModel.properties.customizeComments", []);
              if (flowConfig.value.isCustomizeComment && customizeComments.length > 0) {
                flowConfig.value.flowCustomizeComment = customizeComments[0];
              }

              // 动态加载当前表单依赖的组件
              await methods.injectThirdPackage(flowDesignJson.value);

              // 根据流程配置 signatureKey 查询数据
              const signatureKey = get(jsonObj, "globalConfig.signatureKey");

              await methods.queryConfigData(signatureKey);
              await methods.queryPreviewSignature(signatureKey);

              // 计算隐藏区域
              methods.item2IsHidden();
              parseConfig();
            } else {
              GlobalToast.warn(`${result.message}` || "流程配置查询失败");
              loading.value = false;
            }
          })
          .catch((error: Error) => {
            console.log(error);
            loading.value = false;
            GlobalToast.error(errorMessage(error, "流程配置获取失败"));
          });
      },

      queryConfigData: async (signatureKey: string) => {
        // 预览模式无需查询 签字配置
        if (flowConfig.value.isTaskPreview) {
          return;
        }

        if (!signatureKey) {
          return false;
        }
        const task = flowConfig.value.task;
        flowConfig.value.signatureOptions = await queryConfigData({
          orgId: task.orgId,
          tenantId: task.tenantId,
          // categoryCodes: ["temporary-signature"]
          categoryCodes: [signatureKey]
        });
        console.log("flowConfig.value.signatureOptions = ");
        console.log(flowConfig.value.signatureOptions);
      },
      queryPreviewSignature: async (signatureKey: string) => {
        // 预览模式进行查询，并且存在签字类别配置
        if (!flowConfig.value.isTaskPreview || !signatureKey) {
          return false;
        }
        const task = flowConfig.value.task;
        const params = {
          condtionItems: [
            {
              fieldName: "isRemoved",
              op: "eq",
              fieldValue: false
            },
            {
              fieldName: "orgId",
              op: "eq",
              fieldValue: task.orgId
            },
            {
              fieldName: "sourceId",
              op: "eq",
              fieldValue: task.instanceId
            },
            {
              fieldName: "oriId",
              op: "eq",
              fieldValue: `${task.id}`
            },
            {
              fieldName: "signatureSource",
              op: "eq",
              fieldValue: "flowSignature"
            }
          ]
        };
        const signatureData = await $http.post<any>("/shared-data/g-signature-params", params);
        if (signatureData.success && signatureData.data.length > 0) {
          signatureImgData.value = signatureData.data;
          flowConfig.value.showFlowSignature = true;

          if (signatureImgData.value.length > 0) {
            flowConfig.value.signaturePreviewUrl = signatureImgData.value[0].previewUrl;
          }
        }
      },
      item2IsHidden: () => {
        const stepModel = flowConfig.value.stepModel;
        const handlerRuleCfg = get(stepModel, "properties.handler", null);

        if (handlerRuleCfg?.includes("r_") && flowConfig.value.signatureOptions?.length > 0) {
          const handler = formatHandler(handlerRuleCfg);
          for (const roleId of handler) {
            const signatureConfig = flowConfig.value.signatureOptions.find(
              (item: ISignConfigType) => item.config.roleId === roleId
            );
            if (signatureConfig) {
              flowConfig.value.showFlowSignature = true;
              flowConfig.value.currentSignatureConfig = signatureConfig as any;
              break;
            } else {
              flowConfig.value.showFlowSignature = false;
            }
          }
          flowConfig.value.currentSignatureConfig.orgId = flowConfig.value.task.orgId;
          flowConfig.value.currentSignatureConfig.oriId = flowConfig.value.task.id;
          flowConfig.value.currentSignatureConfig.sourceId = flowConfig.value.task.instanceId;
        }

        const list = [
          flowConfig.value.attachment,
          flowConfig.value.commentDisplay,
          flowConfig.value.isCustomizeComment && flowConfig.value.task.taskType !== 2,
          flowConfig.value.showFlowSignature // 签字项是否显示
        ];
        item2IsHidden.value = !some(list, Boolean);

        console.log(JSON.stringify(list, null, 2));
        // 已经完成的任务隐藏当前处理的区域
        if (flowConfig.value.task.status === 2) {
          // item2IsHidden.value = true;
        }
      },
      queryParams() {
        const query = route.query as any;
        let id = "";
        // 站内信点击跳转
        if (query && query.businessDataId && query.sourceType === "webmsg") {
          id = query.businessDataId as string;
        } else if (query && query.taskId) {
          id = query.taskId as string;
        } else if (query && query.id && query.sourceType === "taskOrder") {
          id = query.id as string;
        }

        if (!id) {
          GlobalToast.error("在url未解析到正确的任务id参数，请检查链接是否正确");
          return;
        }
        // 根据id查询任务的其他信息，流程、表单、租户
        flowTaskApiHelper
          .queryTaskInfo({
            params: {
              taskId: id
            }
          })
          .then((result: any) => {
            if (result.status === "success") {
              const taskData = result.result.taskData;
              methods.getFlowPage(taskData);
            } else {
              GlobalToast.warn(result.message || "查询任务失败");
            }
          })
          .catch((error: Error) => {
            console.log(error);
            GlobalToast.error(errorMessage(error, "流程配置获取失败"));
          });
      }
    };

    onMounted(() => {
      setNavigationBarConfig({
        title: "任务详情"
      });
      methods.queryParams();
    });

    return () => {
      return (
        <div class={"main-page"}>
          <nut-flex-box itemNum={FlowTaskDetailConfig.length} item-config={FlowTaskDetailConfig}>
            {{
              "item-1": () => {
                /*动态审批流表单渲染区域*/
                if (isRender.value) {
                  return (
                    <RenderCanvas
                      key={renderKey.value}
                      flowDesignJson={flowConfig.value.flowDesignJson}
                      flowPageConfig={flowConfig.value}
                    />
                  );
                }
                return null;
              },
              "item-2": () => {
                /*审批操作按钮区域*/
                if (!isRender.value) {
                  return null;
                }
                return (
                  <RenderTaskButton
                    onReload={methods.queryParams}
                    flowPageConfig={flowConfig.value}
                    flowStepButtons={flowConfig.value.flowStepButtons}
                  />
                );
              }
            }}
          </nut-flex-box>
        </div>
      );
    };
  }
});
