import { defineComponent, onMounted, reactive, ref } from "vue";
import { FlowTaskProcessConfig, FlowTaskProcessPopupConfig } from "./flex-config";
import { setNavigationBarConfig } from "../../../utils/iwop-util";
import { useContext } from "../../../hooks/useContext";
import { useRoute } from "vue-router";
import { errorMessage, formatDate, GlobalToast } from "../../../utils";
import { RenderTaskStatus, RenderTaskType } from "../../render-task-component";
import { IPublicListItemType, ResulType, FileAttachmentType, IPublicTaskItemType } from "../../workflow-types";
import { get } from "lodash";
import { flowTaskApiHelper } from "../../api-config";

// 流程处理过程
export const FlowTaskProcess = defineComponent({
  name: "FlowTaskProcess",
  setup() {
    const ctx = useContext();
    const route = useRoute();
    const loading = ref(false);
    const flowList = ref<IPublicTaskItemType[]>([]);
    const listRef = ref<any>(null);
    const refreshLoading = ref(false);
    const lbWidth = "80px";

    const state = reactive({
      visible: false,
      fileList: [],
      downloadLoading: false
    });

    const methods = {
      loadData: () => {
        flowTaskApiHelper
          .taskPreview({
            tenantId: ctx.tenantId,
            instanceId: route.query.instanceId,
            orgId: route.query.orgId,
            userInfo: {
              id: ctx.user.id,
              userName: ctx.user.name
            }
          })
          .then((res: ResulType) => {
            if (res.status === "success") {
              flowList.value = res.result.taskList || [];
            } else {
              GlobalToast.warn(res.message || "流程日志查询失败");
            }
            refreshLoading.value = false;
            loading.value = false;
          })
          .catch((error: Error) => {
            console.log(error);
            GlobalToast.error(errorMessage(error, "流程日志查询失败"));
            loading.value = false;
            refreshLoading.value = false;
          });
      },
      taskUploadPreview: (item: IPublicTaskItemType) => {
        flowTaskApiHelper
          .queryTaskAttachment({
            orgId: item.orgId,
            orderId: item.id,
            isRemoved: false,
            tenant: item.tenantCode
          })
          .then((result: ResulType) => {
            if (result.status === "success") {
              state.fileList = get(result, "result", []);
              state.visible = true;
            } else {
              GlobalToast.error("附件查询失败");
            }
          })
          .catch((error: Error) => {
            GlobalToast.error(errorMessage(error, "附件查询失败"));
          });
      },
      download: (item: FileAttachmentType) => {
        console.log(item);
        const param = {
          // keys: [item.url],
          items: [
            {
              key: item.url || "",
              response: {
                "content-disposition": `attachment;filename=${encodeURI(item.name)}`
              }
            }
          ],
          expires: 15,
          product: item.product
        };
        state.downloadLoading = true;
        flowTaskApiHelper
          .fileDownload(param)
          .then((data: any) => {
            if (data) {
              window.location.href = data[item.url];
            } else {
              GlobalToast.warn("没有对应的资源内容");
            }
            state.downloadLoading = false;
          })
          .catch((err: Error) => {
            console.log(err);
            GlobalToast.error("下载失败");
            state.downloadLoading = false;
          });
      }
    };
    onMounted(() => {
      methods.loadData();
      setNavigationBarConfig({ title: "流程日志" });
    });
    return () => {
      return (
        <div class={"main-page"}>
          <nut-popup position="bottom" v-model:visible={state.visible} style={{ height: "100%" }}>
            <nut-flex-box itemNum={FlowTaskProcessPopupConfig.length} item-config={FlowTaskProcessPopupConfig}>
              {{
                "item-1": () => {
                  return (
                    <nut-panel title={"附件查看列表"}>
                      <nut-list-v2-only items={state.fileList} isVirtual={true} isRefresh={false} border={false}>
                        {{
                          default: ({ item }: IPublicListItemType<FileAttachmentType>) => {
                            return (
                              <nut-box border>
                                <div class={"d-flex w-full justify-space-between"}>
                                  <nut-ellipsis rows={3} content={item.name}></nut-ellipsis>
                                  <div
                                    style={{ width: "65px" }}
                                    class={"d-flex justify-center align-center"}
                                    onClick={methods.download.bind(null, item)}
                                  >
                                    <nut-button type={"primary"} size={"mini"} plain disabled={state.downloadLoading}>
                                      下载
                                    </nut-button>
                                  </div>
                                </div>
                              </nut-box>
                            );
                          }
                        }}
                      </nut-list-v2-only>
                    </nut-panel>
                  );
                },
                "item-2": () => {
                  return (
                    <nut-box background>
                      <nut-row gutter={10}>
                        <nut-col span={24}>
                          <nut-button
                            type={"primary"}
                            plain
                            block
                            onClick={() => {
                              state.visible = false;
                            }}
                          >
                            返回
                          </nut-button>
                        </nut-col>
                      </nut-row>
                    </nut-box>
                  );
                }
              }}
            </nut-flex-box>
          </nut-popup>
          <nut-flex-box itemNum={FlowTaskProcessConfig.length} item-config={FlowTaskProcessConfig}>
            {{
              "item-1": () => {
                return (
                  <nut-box background border={false}>
                    <i class="icon approve approve-danjuxinxi text-primary mr-2"></i>
                    流程日志
                  </nut-box>
                );
              },
              "item-2": () => {
                return (
                  <nut-box background padding-size={"small"} clearPadding={["left", "right"]}>
                    <nut-list-v2-only
                      v-model:refreshLoading={refreshLoading.value}
                      ref={listRef}
                      items={flowList.value}
                      onRefresh={methods.loadData}
                      isVirtual={true}
                      isRefresh={true}
                      border={false}
                    >
                      {{
                        default: ({ item, index }: IPublicListItemType<IPublicTaskItemType>) => {
                          return (
                            <nut-panel
                              title={"节点" + (index + 1)}
                              background
                              border={false}
                              clearPadding={["left", "right", "bottom"]}
                            >
                              <nut-filter-item label-width={lbWidth} label="材料名称：">
                                {item.orgName}
                              </nut-filter-item>
                              <nut-filter-item label-width={lbWidth} label="审批节点：">
                                {item.stepName}
                              </nut-filter-item>
                              <nut-filter-item label-width={lbWidth} label="审批人：">
                                {item.flowReceiveName}
                              </nut-filter-item>
                              <nut-filter-item label-width={lbWidth} label="任务类型：">
                                <RenderTaskType taskType={item.taskType} />
                              </nut-filter-item>
                              <nut-filter-item label-width={lbWidth} label="到达时间：">
                                {item.flowReceiveTime && formatDate(item.flowReceiveTime)}
                              </nut-filter-item>
                              <nut-filter-item label-width={lbWidth} label="处理时间：">
                                {item.flowCompletedTime && formatDate(item.flowCompletedTime)}
                              </nut-filter-item>
                              <nut-filter-item label-width={lbWidth} label="状态：">
                                <RenderTaskStatus status={item.status} />
                              </nut-filter-item>
                              <nut-filter-item label-width={lbWidth} label="审批意见：">
                                <span style={item.flowComment == "同意" ? "#345dfc" : "#f0222f"}>{item.flowComment}</span>
                              </nut-filter-item>
                              <nut-filter-item label-width={lbWidth} label="处理说明：">
                                {item.flowOption}
                              </nut-filter-item>
                              <nut-filter-item label-width={lbWidth} label="附件：">
                                {item.attachKeys && (
                                  <div class={"text-primary"} onClick={methods.taskUploadPreview.bind(null, item)}>
                                    查看附件
                                    <i class="icon approve pa-1 approve-fujian"></i>
                                  </div>
                                )}
                              </nut-filter-item>
                            </nut-panel>
                          );
                        }
                      }}
                    </nut-list-v2-only>
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
