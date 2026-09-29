import { defineComponent, onMounted, reactive, ref } from "vue";
import "./style.less";
import { flowTaskApiHelper, ResulType } from "../../components-workflow";
import { appStore } from "../../store/frame-store";
import { $http, errorMessage, GlobalToast } from "../../utils";
import { myAppFlexConfig, messageConfigFlexConfig } from "./flex-box-config";
import {
  IconArrowRight,
  IconMessage,
  IconSetting,
  IconGonggao,
  IconDaiwo,
  IconYuwo,
  IconYouwo,
  IconPrint,
  IconLianxi,
  IconWenti,
  IconBanben
} from "../icons";
import backgroundUrl from "./background.jpg";
import url from "./gongren.png";
import { useRouter } from "vue-router";

/*我的个人中心*/
export const MyApp = defineComponent({
  name: "MyApp",
  props: {},
  setup: function () {
    const router = useRouter();
    const ctx = appStore();
    const userId = ctx.$context.userId;
    const messageNum = ref(0);
    const gongHaoNUm = ref(0);
    const state = reactive({
      waitManage: 0, // 待我处理
      meStart: 0, // 由我发起
      aboutMe: 0 // 与我相关
    });
    const queryTask = () => {
      flowTaskApiHelper
        .queryTaskSum({
          orgId: ctx.currentOrg.id,
          userId: `${ctx.user.id}`
        })
        .then((result: ResulType) => {
          if (result.status === "success") {
            const data = result.result;
            state.waitManage = data.waitManage;
            state.meStart = data.meStart;
            state.aboutMe = data.aboutMe;
          } else {
            GlobalToast.error(errorMessage(result.message, "查询失败"));
          }
        })
        .catch((err: Error) => {
          console.log("err", err);
        });
    };
    const onFetch = async (isRead: boolean) => {
      const result = (await $http.get(
        `/shared-data/message/backlog?isAgenda=1&userId=${userId}&isRead=${isRead}`,
        {}
      )) as ResulType;
      const resData = (await $http.get(
        `/shared-data/message/backlog?msgType=sysmsg&limit=10000&offset=0&tenantId=${ctx.$context.tenantId}`,
        {}
      )) as ResulType;
      if (resData && resData.result) {
        gongHaoNUm.value = resData.result.length;
      }
      if (result.status == "success") {
        messageNum.value = result.result.length;
      }
    };
    // const url = "https://img12.360buyimg.com/imagetools/jfs/t1/196430/38/8105/14329/60c806a4Ed506298a/e6de9fb7b8490f38.png";
    onMounted(() => {
      onFetch(false);
      queryTask();
    });
    return () => {
      return (
        <div class="my-style">
          <nut-flex-box item-num={myAppFlexConfig.length} item-config={myAppFlexConfig}>
            {{
              "item-1": () => {
                return (
                  <nut-box
                    background
                    border
                    paddingSize={"large"}
                    clearPadding={["top", "bottom"]}
                    style={`background-image: url(${backgroundUrl});background-repeat: round;display: flex;align-items: center;justify-content: space-between;`}
                  >
                    <nut-row className={"d-flex align-center"} style={"height: 100%; width:100%;"}>
                      <nut-col span={"20"} style={"display: flex; flex-direction: column;"}>
                        <nut-row className="head-title-weight-style">{ctx.$context.userName}</nut-row>
                        <nut-row className="head-title-font-style">{ctx.$context.orgShortName || ctx.$context.orgName}</nut-row>
                      </nut-col>
                      <nut-col span={"4"} style={"text-align:center"}>
                        <nut-avatar size="large">
                          <img src={url} />
                        </nut-avatar>
                      </nut-col>
                    </nut-row>
                  </nut-box>
                );
              },
              "item-2": () => {
                return (
                  <nut-box background border padding-size={"small"} clear-padding={["bottom", "left", "right"]}>
                    <nut-grid column-num={3} gutter={8} border={false}>
                      <nut-grid-item>
                        {{
                          default: () => {
                            return (
                              <div
                                onClick={() => {
                                  router.push({ path: "/InnerPendingApprove" });
                                }}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center"
                                }}
                              >
                                <nut-badge value={state.waitManage} color="red" top={4}>
                                  <div
                                    style={
                                      "height: 50px; width: 50px; background: #e5f2fd;border-radius: 50%;line-height:70px;text-align: center;"
                                    }
                                  >
                                    <IconDaiwo />
                                  </div>
                                </nut-badge>
                                <span style={{ display: "block", marginTop: "8px" }}>待我处理</span>
                              </div>
                            );
                          }
                        }}
                        {/*<nut-badge value={state.waitManage} color="red" top={4}>
                          <div
                            style={
                              "height: 50px; width: 50px; background: #e5f2fd;border-radius: 50%;line-height:70px;text-align: center;"
                            }
                          >
                            <IconDaiwo />
                          </div>
                        </nut-badge>*/}
                      </nut-grid-item>
                      <nut-grid-item>
                        {{
                          default: () => {
                            return (
                              <div
                                onClick={() => {
                                  router.push({ name: "InnerProcessInitiation" });
                                }}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center"
                                }}
                              >
                                <nut-badge value={state.meStart} color="red" top={4}>
                                  <div
                                    style={
                                      "height: 50px; width: 50px; background: #e5f2fd;border-radius: 50%;line-height:70px;text-align: center;"
                                    }
                                  >
                                    <IconYuwo />
                                  </div>
                                </nut-badge>
                                <span style={{ display: "block", marginTop: "8px" }}>由我发起</span>
                              </div>
                            );
                          }
                        }}
                      </nut-grid-item>
                      <nut-grid-item>
                        {{
                          default: () => {
                            return (
                              <div
                                onClick={() => {
                                  router.push({ name: "InnerTaskToMe" });
                                }}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center"
                                }}
                              >
                                <nut-badge value={state.aboutMe} color="red" top={4}>
                                  <div
                                    style={
                                      "height: 50px; width: 50px; background: #e5f2fd;border-radius: 50%;line-height:70px;text-align: center;"
                                    }
                                  >
                                    <IconYouwo />
                                  </div>
                                </nut-badge>
                                <span style={{ display: "block", marginTop: "8px" }}>与我相关</span>
                              </div>
                            );
                          }
                        }}
                      </nut-grid-item>
                    </nut-grid>
                  </nut-box>
                );
              },
              "item-3": () => {
                return (
                  <nut-box background border padding-size={"small"} clear-padding={["bottom", "left", "right"]}>
                    <nut-flex-box item-num={messageConfigFlexConfig.length} item-config={messageConfigFlexConfig}>
                      {{
                        "item-1": () => {
                          return (
                            <nut-box
                              background
                              border
                              radius={false}
                              clearBorder={["top", "right", "left"]}
                              padding-size={"small"}
                              style={"border-radius: 0px;"}
                              onClick={() => {
                                router.push({ path: "/AppGonggao" });
                              }}
                            >
                              <nut-row className={"d-flex align-center"}>
                                <nut-col span={"3"} className={"d-flex align-center"} style={"margin-right: 4px;"}>
                                  <IconGonggao />
                                </nut-col>
                                <nut-col span={"12"}>
                                  <span class="message-style">公告</span>
                                </nut-col>
                                <nut-col span={7}>
                                  <nut-badge value={gongHaoNUm.value} color={"red"} top={"-7"}>
                                    <span style={"display: block;width: 70px;"}></span>
                                  </nut-badge>
                                </nut-col>
                                <nut-col span={"2"}>
                                  <IconArrowRight />
                                </nut-col>
                              </nut-row>
                            </nut-box>
                          );
                        },
                        "item-2": () => {
                          return (
                            <nut-box
                              background
                              border
                              radius={false}
                              clearBorder={["top", "right", "left"]}
                              style={"border-radius: 0px;"}
                              padding-size={"small"}
                              onClick={() => {
                                router.push({ path: "/AppMessage" });
                              }}
                            >
                              <nut-row className={"d-flex align-center"}>
                                <nut-col span={"3"} className={"d-flex align-center"} style={"margin-right: 4px;"}>
                                  <IconMessage />
                                </nut-col>
                                <nut-col span={"12"}>
                                  <span class="message-style">消息</span>
                                </nut-col>
                                <nut-col span={7}>
                                  <nut-badge value={messageNum.value} top={"-7"} color={"red"}>
                                    <span style={"display: block;width: 70px;"}></span>
                                  </nut-badge>
                                </nut-col>
                                <nut-col span={"2"} className={"d-flex align-center"}>
                                  <IconArrowRight />
                                </nut-col>
                              </nut-row>
                            </nut-box>
                          );
                        },
                        "item-3": () => {
                          return (
                            <nut-box
                              background
                              border
                              radius={false}
                              clearBorder={["top", "right", "left"]}
                              style={"border-radius: 0px;"}
                              padding-size={"small"}
                              onClick={() => {
                                router.push({ path: "/UserIndexSetting" });
                              }}
                            >
                              <nut-row className={"d-flex align-center"}>
                                <nut-col span={"3"} className={"d-flex align-center"} style={"margin-right: 4px;"}>
                                  <IconSetting />
                                </nut-col>
                                <nut-col span={"19"}>
                                  <span class="message-style">设置</span>
                                </nut-col>
                                <nut-col span={"2"}>
                                  <IconArrowRight />
                                </nut-col>
                              </nut-row>
                            </nut-box>
                          );
                        },
                        "item-4": () => {
                          return (
                            <nut-box
                              background
                              border
                              radius={false}
                              clearBorder={["top", "right", "left"]}
                              style={"border-radius: 0px;"}
                              padding-size={"small"}
                              onClick={() => {
                                router.push({ path: "/userPrint" });
                              }}
                            >
                              <nut-row className={"d-flex align-center"}>
                                <nut-col span={"3"} className={"d-flex align-center"} style={"margin-right: 4px;"}>
                                  <IconPrint />
                                </nut-col>
                                <nut-col span={"19"}>
                                  <span class="message-style">打印机</span>
                                </nut-col>
                                <nut-col span={"2"}>
                                  <IconArrowRight />
                                </nut-col>
                              </nut-row>
                            </nut-box>
                          );
                        },
                        "item-5": () => {
                          return (
                            <nut-box
                              background
                              border
                              radius={false}
                              clearBorder={["top", "right", "left"]}
                              style={"border-radius: 0px;"}
                              padding-size={"small"}
                            >
                              <nut-row className={"d-flex align-center"}>
                                <nut-col span={"3"} className={"d-flex align-center"} style={"margin-right: 4px;"}>
                                  <IconWenti />
                                </nut-col>
                                <nut-col span={"19"}>
                                  <span class="message-style">问题反馈</span>
                                </nut-col>
                                <nut-col span={"2"}>
                                  <IconArrowRight />
                                </nut-col>
                              </nut-row>
                            </nut-box>
                          );
                        },
                        "item-6": () => {
                          return (
                            <nut-box
                              background
                              border
                              radius={false}
                              clearBorder={["top", "right", "left"]}
                              style={"border-radius: 0px;"}
                              padding-size={"small"}
                            >
                              <nut-row className={"d-flex align-center"}>
                                <nut-col span={"3"} className={"d-flex align-center"} style={"margin-right: 4px;"}>
                                  <IconLianxi />
                                </nut-col>
                                <nut-col span={"19"}>
                                  <span class="message-style">联系我们</span>
                                </nut-col>
                                <nut-col span={"2"}>
                                  <IconArrowRight />
                                </nut-col>
                              </nut-row>
                            </nut-box>
                          );
                        },
                        "item-7": () => {
                          return (
                            <nut-box
                              background
                              border
                              radius={false}
                              clearBorder={["top", "right", "left"]}
                              style={"border-radius: 0px;"}
                              padding-size={"small"}
                            >
                              <nut-row className={"d-flex align-center"}>
                                <nut-col span={"3"} className={"d-flex align-center"} style={"margin-right: 4px;"}>
                                  <IconBanben />
                                </nut-col>
                                <nut-col span={"19"}>
                                  <span class="message-style">版本日志</span>
                                </nut-col>
                                <nut-col span={"2"}>
                                  <IconArrowRight />
                                </nut-col>
                              </nut-row>
                            </nut-box>
                          );
                        }
                      }}
                    </nut-flex-box>
                  </nut-box>
                );
              },
              "item-4": () => {
                return (
                  <nut-panel
                    title={"快捷切换"}
                    background
                    border
                    padding-size={"small"}
                    clear-padding={["bottom", "left", "right"]}
                  >
                    <nut-grid column-num={4} gutter={8} border={false}>
                      <nut-grid-item>
                        {{
                          default: () => {
                            return (
                              <div
                                onClick={() => {
                                  router.push({ path: "/InnerPendingApprove" });
                                }}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center"
                                }}
                              >
                                <nut-badge value={state.waitManage} color="red" top={4}>
                                  <div
                                    style={
                                      "height: 50px; width: 50px; background: #e5f2fd;border-radius: 50%;line-height:70px;text-align: center;"
                                    }
                                  >
                                    <IconDaiwo />
                                  </div>
                                </nut-badge>
                                <span style={{ display: "block", marginTop: "8px" }}>待我处理</span>
                              </div>
                            );
                          }
                        }}
                        {/*<nut-badge value={state.waitManage} color="red" top={4}>
                          <div
                            style={
                              "height: 50px; width: 50px; background: #e5f2fd;border-radius: 50%;line-height:70px;text-align: center;"
                            }
                          >
                            <IconDaiwo />
                          </div>
                        </nut-badge>*/}
                      </nut-grid-item>
                      <nut-grid-item>
                        {{
                          default: () => {
                            return (
                              <div
                                onClick={() => {
                                  router.push({ name: "InnerProcessInitiation" });
                                }}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center"
                                }}
                              >
                                <nut-badge value={state.meStart} color="red" top={4}>
                                  <div
                                    style={
                                      "height: 50px; width: 50px; background: #e5f2fd;border-radius: 50%;line-height:70px;text-align: center;"
                                    }
                                  >
                                    <IconYuwo />
                                  </div>
                                </nut-badge>
                                <span style={{ display: "block", marginTop: "8px" }}>由我发起</span>
                              </div>
                            );
                          }
                        }}
                      </nut-grid-item>
                      <nut-grid-item>
                        {{
                          default: () => {
                            return (
                              <div
                                onClick={() => {
                                  router.push({ name: "InnerTaskToMe" });
                                }}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center"
                                }}
                              >
                                <nut-badge value={state.aboutMe} color="red" top={4}>
                                  <div
                                    style={
                                      "height: 50px; width: 50px; background: #e5f2fd;border-radius: 50%;line-height:70px;text-align: center;"
                                    }
                                  >
                                    <IconYouwo />
                                  </div>
                                </nut-badge>
                                <span style={{ display: "block", marginTop: "8px" }}>与我相关</span>
                              </div>
                            );
                          }
                        }}
                      </nut-grid-item>
                    </nut-grid>
                  </nut-panel>
                );
              }
            }}
          </nut-flex-box>
        </div>
      );
    };
  }
});
