import { defineComponent, onMounted, reactive, watch } from "vue";
import { ButtonCopyForFormConfig } from "./flex-config-render-button";
import { Search2 } from "@nutui/icons-vue";
import { useContext } from "../../../hooks/useContext";
import { ResulType } from "../../workflow-types";
import { debounce, filter, get, map } from "lodash";
import { GlobalToast } from "../../../utils/global-toast";
import { errorMessage } from "../../../utils/util";
import { $http } from "../../../utils/http";

export const ButtonCopyForForm = defineComponent({
  name: "ButtonCopyForForm",
  emits: ["cancel", "sendCopyForm"],
  setup(props, { emit }) {
    const ctx = useContext();
    const state = reactive<{
      filterText: string;
      refreshLoading: boolean;
      saveLoading: boolean;
      listLoading: boolean;
      tableData: any[];
    }>({
      filterText: "",
      listLoading: false,
      refreshLoading: false,
      saveLoading: false,
      tableData: []
    });
    const methods = {
      handleRefresh: () => {
        state.refreshLoading = true;
        methods.loadUserData();
      },
      saveForm() {
        state.saveLoading = true;
        const selectData = filter(state.tableData, (item: any) => {
          return item.selected;
        });
        emit("sendCopyForm", selectData);
      },
      cancel() {
        state.tableData = map(state.tableData, (item: any) => {
          item.selected = false;
          return item;
        });
        emit("cancel");
      },
      loadUserData: debounce(() => {
        let url = `/shared-data/get-org-users?tenantId=${ctx.tenantId}&orgId=${ctx.orgId}&limit=1000000&offset=0`;

        // 不是纯数字
        if (state.filterText && !/\d+/.test(state.filterText)) {
          url += `&userName=${state.filterText}`;
        }
        state.listLoading = true;
        $http
          .get(url)
          .then((data: ResulType) => {
            let list = get(data, "result", []);

            if (state.filterText) {
              list = filter(list, (item: any) => {
                return item.name.includes(state.filterText) || `${item.phoneNumber}`.includes(state.filterText);
              });
            }

            state.tableData = list;
            state.saveLoading = false;
            state.listLoading = false;
            state.refreshLoading = false;
          })
          .catch((err: Error) => {
            console.log(err);
            state.listLoading = false;
            state.saveLoading = false;
            state.refreshLoading = false;
            GlobalToast.error(errorMessage(err || "用户查询失败"));
          });
      }, 300)
    };

    watch(
      () => {
        return state.filterText;
      },
      () => {
        methods.loadUserData();
      }
    );

    onMounted(() => {
      methods.loadUserData();
    });

    return () => {
      return (
        <div class={"main-page"}>
          <nut-flex-box itemNum={ButtonCopyForFormConfig.length} item-config={ButtonCopyForFormConfig}>
            {{
              "item-1": () => {
                return (
                  <nut-searchbar
                    background={"var(--nut-primary-color)"}
                    placeholder="请输入姓名或手机号检索"
                    v-model={state.filterText}
                  >
                    {{
                      leftin: () => {
                        return <Search2 />;
                      }
                    }}
                  </nut-searchbar>
                );
              },
              "item-2": () => {
                return (
                  <nut-box background border padding-size={"base"}>
                    <nut-list-v2-only
                      ref="listRef"
                      loading={state.listLoading}
                      is-virtual={true}
                      isRefresh={true}
                      v-model:refreshLoading={state.refreshLoading}
                      items={state.tableData}
                      onRefresh={methods.handleRefresh}
                    >
                      {{
                        default: ({ item }) => {
                          return (
                            <nut-box background border>
                              <nut-checkbox v-model={item.selected} text-position="left" class={"w-full mr-0 mb-0"}>
                                <div class={"mb-1"}>{item.name}</div>
                                <div>{item.phoneNumber}</div>
                              </nut-checkbox>
                            </nut-box>
                          );
                        }
                      }}
                    </nut-list-v2-only>
                  </nut-box>
                );
              },
              "item-3": () => {
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
                          抄送
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
