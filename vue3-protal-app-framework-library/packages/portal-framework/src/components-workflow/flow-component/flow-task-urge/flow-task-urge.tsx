import { defineComponent, onMounted, reactive, ref } from "vue";
import { FlowTaskUrgeConfig, FlowTaskUrgeSendUserConfig } from "./flex-config";
import { useRoute } from "vue-router";
import { ResulType } from "../../workflow-types";
import { IPublicTaskItemType } from "../../workflow-types";
import { GlobalToast } from "../../../utils/global-toast";
import { useContext } from "../../../hooks/useContext";
import { filter, maxBy, uniqBy } from "lodash";
import { errorMessage } from "../../../utils/util";
import { $http } from "../../../utils/http";
import { flowTaskApiHelper } from "../../api-config";

interface ItemUserType extends IPublicTaskItemType {
  disabled: boolean;
  selected: boolean;
}

// 2024-10-9 10:43:59
// 任务催办
export const FlowTaskUrge = defineComponent({
  name: "FlowTaskUrge",
  setup() {
    const listRef = ref();
    const ctx = useContext();
    const taskCount = ref(0);
    const visible = ref(false);
    const loading = ref(false);
    const route = useRoute();
    const task = ref<IPublicTaskItemType>();

    const state = reactive<{
      senderUsers: ItemUserType[];
      refreshLoading: boolean;
      disabled: boolean;
    }>({
      senderUsers: [],
      refreshLoading: false,
      disabled: false
    });
    const methods = {
      queryTaskOneBase: () => {
        if (!route.query || !route.query.taskId) {
          GlobalToast.error("任务ID不存在");
          return;
        }
        const params = {
          query: {
            tenantId: ctx.tenantId,
            isRemoved: false,
            id: route.query.taskId
          },
          queryType: "getOne"
        };
        flowTaskApiHelper
          .getTaskParams(params, { headers: { "X-Tenant-Id": ctx.tenantId } })
          .then((result: ResulType) => {
            if (result.status === "success") {
              task.value = result.result;
              methods.loadCurrentOrder();
            } else {
              GlobalToast.error(result.message || "任务查看失败");
            }
          })
          .catch((error: Error) => {
            GlobalToast.error(errorMessage(error.message, "催办列表，查询失败"));
          });
      },
      loadCurrentOrder: () => {
        const params = {
          query: {
            tenantId: ctx.tenantId,
            isRemoved: false,
            instanceId: route.query.instanceId
          },
          queryType: "getMany"
        };
        flowTaskApiHelper
          .getTaskParams(params, { headers: { "X-Tenant-Id": ctx.tenantId } })
          .then((result: ResulType) => {
            if (result.status === "success" && Array.isArray(result.result)) {
              const maxSortCodeTask = maxBy(result.result, "sortCode");
              if (maxSortCodeTask) {
                const rows = filter(result.result, (item: IPublicTaskItemType) => {
                  // 0未处理 1处理中 taskType不是抄送的 ，当前步骤的任务进行催办（当前步骤未完成任务允许进行催办）
                  return item.status < 2 && item.taskType !== 2 && item.sortCode === maxSortCodeTask.sortCode;
                }).map((item: any) => {
                  item.disabled = `${item.flowReceiveId}` === `${ctx.user.id}`;
                  item.selected = false;

                  return item;
                });
                taskCount.value = rows.length;
                state.senderUsers = rows;
              }
            } else {
              GlobalToast.error(errorMessage(result.message, "催办列表，查询失败"));
            }
            loading.value = false;
          })
          .catch((error: Error) => {
            GlobalToast.error(errorMessage(error.message, "催办列表，查询失败"));
          });
      },
      sendMsg: async () => {
        const failed: any[] = [];
        const selectRows = filter(state.senderUsers, (row: ItemUserType) => {
          return row.selected;
        });
        if (selectRows.length === 0) {
          GlobalToast.warn("请选择催办用户！");
          return;
        }

        state.disabled = true;

        // 接收用户进行去重处理
        const uniqTaskArray = uniqBy(selectRows, (user: ItemUserType) => {
          return user.flowReceiveId;
        });
        for (const task of uniqTaskArray) {
          const name = task.flowReceiveName;
          const result = (await $http.post("/shared-data/message/send-message-user", {
            msgType: "sms",
            templateCode: "ApproveUrgeV2",
            userIds: [task.flowReceiveId],
            params: {
              name: name,
              order: task.instanceCode,
              org: task.orgName
            }
          })) as ResulType;
          if (result.status !== "success") {
            failed.push(name);
          }
        }
        if (failed.length === 0) {
          GlobalToast.success("催办信息已通过短信发送成功！");
        } else if (failed.length === selectRows.length) {
          GlobalToast.error(`发送失败！`);
        } else {
          GlobalToast.warn(`部分发送成功，用户(${failed.join(",")})未发送成功！`);
        }
        state.disabled = false;
        setTimeout(() => {
          visible.value = false;
        }, 500);
      },
      cancel: () => {
        visible.value = false;
        state.disabled = false;
        state.senderUsers = state.senderUsers.map((item: ItemUserType) => {
          item.selected = false;
          return item;
        });
      }
    };
    onMounted(() => {
      methods.queryTaskOneBase();
    });

    return () => {
      return (
        <div class={"main-page"}>
          <nut-flex-box itemNum={FlowTaskUrgeConfig.length} item-config={FlowTaskUrgeConfig}>
            {{
              "item-1": () => {
                return (
                  <nut-box background>
                    <nut-row>
                      <nut-col span={24}>
                        <nut-filter-item
                          label="催办单据"
                          left-label-position="left"
                          right-label-position="right"
                          label-width="80px"
                        >
                          {task.value?.instanceCode || ""}
                        </nut-filter-item>
                      </nut-col>
                      <nut-col
                        span={24}
                        onClick={() => {
                          visible.value = true;
                        }}
                      >
                        <nut-filter-item
                          label="接收人"
                          left-label-position="left"
                          right-label-position="right"
                          label-width="80px"
                        >
                          {taskCount.value}人
                          <i class="icon approve approve-xiangyou-copy text-primary pa-1" />
                        </nut-filter-item>
                      </nut-col>
                      <nut-col span={24}>
                        <nut-filter-item
                          label="提醒方式"
                          left-label-position="left"
                          right-label-position="right"
                          label-width="80px"
                        >
                          短信
                        </nut-filter-item>
                      </nut-col>
                    </nut-row>
                  </nut-box>
                );
              }
            }}
          </nut-flex-box>

          <nut-popup v-model:visible={visible.value} position="bottom" style={{ height: "70%" }}>
            <nut-flex-box itemNum={FlowTaskUrgeSendUserConfig.length} item-config={FlowTaskUrgeSendUserConfig}>
              {{
                "item-1": () => {
                  return (
                    <nut-box background>
                      <nut-list-v2-only
                        is-virtual={true}
                        is-refresh={false}
                        ref={listRef}
                        v-model:refreshLoading={state.refreshLoading}
                        items={state.senderUsers}
                      >
                        {{
                          default: ({ item }) => {
                            return (
                              <nut-checkbox class={"xxxxxx"} v-model={item.selected} disabled={item.disabled}>
                                {item.flowReceiveName}
                              </nut-checkbox>
                            );
                          }
                        }}
                      </nut-list-v2-only>
                    </nut-box>
                  );
                },
                "item-2": () => {
                  return (
                    <nut-box background>
                      <nut-row gutter={10}>
                        <nut-col span={12}>
                          <nut-button block onClick={methods.cancel}>
                            取消
                          </nut-button>
                        </nut-col>
                        <nut-col span={12}>
                          <nut-button type={"primary"} block onClick={methods.sendMsg} disabled={state.disabled}>
                            确认发送
                          </nut-button>
                        </nut-col>
                      </nut-row>
                    </nut-box>
                  );
                }
              }}
            </nut-flex-box>
          </nut-popup>
        </div>
      );
    };
  }
});
