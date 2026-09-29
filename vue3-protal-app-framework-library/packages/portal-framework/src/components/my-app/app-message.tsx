import { defineComponent, onMounted, reactive, ref } from "vue";
import { appStore } from "../../store/frame-store";
import dayjs from "dayjs";
import { $http } from "../../utils";
import "./style.less";
import { IPublicListItemType, ResulType } from "../../components-workflow";
import { FileAttachmentType } from "../../components-workflow";

export const AppMessage = defineComponent({
  name: "AppMessage",
  setup: function () {
    const flexConfig = reactive([
      {
        tag: "item-1",
        isFixed: true,
        size: "",
        paddingSize: "large",
        clearPadding: ["top", "bottom", "left", "right"]
      },
      {
        tag: "item-2",
        isFixed: false,
        size: "",
        paddingSize: "large",
        clearPadding: ["top", "bottom", "left", "right"]
      }
    ]);
    const flexPopuerConfig = reactive([
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
    const store = appStore();
    const searchVal = ref("");
    const checkVal = ref([]);
    const readLoading = ref(false);
    const showTop = ref(false);
    const userId = store.$context.userId;
    const fileList = ref<any[]>([]);
    const messageList = ref<any[]>([]);
    const listRef = ref();
    const tabValue = ref("1");
    const methods = {
      openMsg: async (item: any) => {
        // setTimeout(async () => {
        item.isExpand = false;
        // if (!item.isExpand && !item.isRead) {
        //   const result: any = await $http.get(`/shared-data/message/msg-read/${item.id}`);
        //   if (result.status === "success") {
        // item.isRead = 1;
        //   }
        // }
        // }, 200);
      },
      // goUrl: async (item: any) => {
      //   // item.isExpand = false;
      //   // if (!item.isExpand && !item.isRead) {
      //   //   const result: any = await $http.get(`/shared-data/message/msg-read/${item.id}`);
      //   //   if (result.status === "success") {
      //   //     item.isRead = 1;
      //   //   }
      //   // }
      //   // setTimeout(async () => {
      //   //   await onFetch()
      //   // }, 300)
      // },
      getSearch: () => {
        showTop.value = false;
        messageList.value = [];
        if (checkVal.value && checkVal.value.length > 0) {
          checkVal.value.forEach((i: any) => {
            const data = fileList.value.filter((k: any) => k.title.indexOf(i) != -1);
            messageList.value.push(...data);
          });
        } else {
          messageList.value = fileList.value;
        }
      },
      search: () => {
        messageList.value = [];
        if (searchVal.value && searchVal.value.length > 0) {
          fileList.value.forEach((i: any) => {
            const num = i.title.indexOf(searchVal.value) != -1;
            if (num) {
              messageList.value.push(i);
            }
          });
        } else {
          messageList.value = fileList.value;
        }
      }
    };
    const onFetch = async (isRead: boolean) => {
      readLoading.value = true;
      const result = (await $http.get(
        `/shared-data/message/backlog?isAgenda=1&userId=${userId}&isRead=${isRead}`,
        {}
      )) as ResulType;
      if (result.status == "success") {
        result.result.forEach((i: any) => {
          i.isExpand = true;
          if (!i.appUrl) {
            let stringArray = i.msgContent.split('class="operator-btn">');
            i.msgContent = stringArray[0] + "></div>";
          } else {
            i.msgContent = i.msgContent.replace("button", 'nut-button shape="round" size="small"');
            i.msgContent = i.msgContent.replace(
              "background-color: #518db5;border-color: #518db5;",
              "background-color: #345dfc;border-color: #345dfc;margin-top: 5px;"
            );
            i.msgContent = i.msgContent.replace("padding: 9px 15px;", "padding: 6px 12px;");
          }
        });
        fileList.value = result.result;
        messageList.value = [];
        if (checkVal.value && checkVal.value.length > 0) {
          checkVal.value.forEach((i: any) => {
            const data = fileList.value.filter((k: any) => k.title.indexOf(i) != -1);
            messageList.value.push(...data);
          });
        } else {
          messageList.value = fileList.value;
        }
        readLoading.value = false;
      } else {
        readLoading.value = false;
      }
    };
    const getTab = async (title: any) => {
      if (title.paneKey == "2") {
        await onFetch(true);
      } else {
        await onFetch(false);
      }
    };
    onMounted(async () => {
      await onFetch(false);
    });
    return () => {
      return (
        <div class="my-style">
          <nut-flex-box item-num={flexConfig.length} item-config={flexConfig}>
            {{
              "item-1": () => {
                return (
                  <nut-box background border clearPadding={["top", "bottom", "right", "left"]}>
                    <nut-searchbar
                      v-model={searchVal.value}
                      placeholder={"请输入单据编号或名称检索"}
                      shape="square"
                      onChange={() => {
                        methods.search();
                      }}
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
                  </nut-box>
                );
              },
              "item-2": () => {
                return (
                  <nut-tabs v-model={tabValue.value} class="my-style" onChange={getTab}>
                    <nut-tab-pane title="未读消息" pane-key="1">
                      <nut-list-v2-only
                        ref={listRef.value}
                        items={messageList.value}
                        loading={readLoading.value}
                        virtualScrollProps={{
                          style: {
                            background: "#fff"
                          }
                        }}
                        virtualScrollItemProps={{
                          style: {
                            // background: "#f1f1f1",
                            padding: "8px",
                            border: "1px solid #f1f1f1"
                          }
                        }}
                        isVirtual={true}
                        isRefresh={false}
                      >
                        {{
                          default: ({ item }: IPublicListItemType<FileAttachmentType>) => {
                            return (
                              <div class="unRead-border">
                                <nut-row className="list-margin">
                                  <nut-col span={"24"}>
                                    <span class="unRead-icon"></span>您有一条新的{item.title}需要处理
                                  </nut-col>
                                </nut-row>
                                <nut-row className="list-margin list-date">
                                  <nut-col span={3}>
                                    <svg
                                      class="icon"
                                      viewBox="0 0 1024 1024"
                                      version="1.1"
                                      xmlns="http://www.w3.org/2000/svg"
                                      p-id="21696"
                                      width="20"
                                      height="20"
                                    >
                                      <path
                                        d="M511.3 926.5c-55.9 0-110.2-11-161.2-32.6-49.3-20.9-93.6-50.7-131.7-88.8-38-38-67.9-82.3-88.8-131.7C108 622.3 97 568.1 97 512.2S108 402 129.6 351c20.9-49.3 50.7-93.6 88.8-131.7 38-38 82.3-67.9 131.7-88.8C401.2 108.9 455.4 98 511.3 98s110.2 11 161.2 32.6c49.3 20.9 93.6 50.7 131.7 88.8 38 38 67.9 82.3 88.8 131.7 21.6 51.1 32.6 105.3 32.6 161.2s-11 110.2-32.6 161.2c-20.9 49.3-50.7 93.6-88.8 131.7s-82.3 67.9-131.7 88.8c-51 21.5-105.3 32.5-161.2 32.5z m0-768.5C316 158 157.1 316.9 157.1 512.2S316 866.5 511.3 866.5s354.2-158.9 354.2-354.2S706.7 158 511.3 158z"
                                        fill="#515151"
                                        p-id="21697"
                                      ></path>
                                      <path
                                        d="M640.1 702.1c-7.7 0-15.3-2.9-21.2-8.8l-128-127.9c-5.6-5.6-8.8-13.3-8.8-21.2V288c0-16.6 13.4-30 30-30s30 13.4 30 30v243.8l119.2 119.1c11.7 11.7 11.7 30.7 0 42.4-5.8 5.9-13.5 8.8-21.2 8.8z"
                                        fill="#515151"
                                        p-id="21698"
                                      ></path>
                                    </svg>
                                  </nut-col>
                                  <nut-col span={21}>{dayjs(item.createdAt).format("YYYY-MM-DD HH:mm:ss")}</nut-col>
                                </nut-row>
                                <nut-row className="list-border">
                                  <nut-tag type="primary" onClick={methods.openMsg.bind(null, item)}>
                                    查看详情
                                  </nut-tag>
                                  {/*<nut-fold-divider*/}
                                  {/*  v-model={item.isExpand}*/}
                                  {/*  title="查看详情"*/}
                                  {/*  content-position="center"*/}
                                  {/*></nut-fold-divider>*/}
                                </nut-row>
                                <nut-row v-show={!item.isExpand} className="list-margin">
                                  <div class="list-text" v-html={item.msgContent}></div>
                                </nut-row>
                                <nut-row
                                  v-show={
                                    !item.isExpand && item.pcUrl && ((item.isNeedDispose && !item.isRead) || !item.isNeedDispose)
                                  }
                                  className="list-margin"
                                >
                                  <nut-button
                                    type="primary"
                                    shape="round"
                                    style={"margin-top:10px"}
                                    onClick={async () => {
                                      item.isExpand = false;
                                      if (!item.isExpand && !item.isRead) {
                                        const result: any = await $http.get(`/shared-data/message/msg-read/${item.id}`);
                                        if (result.status === "success") {
                                          item.isRead = 1;
                                        }
                                      }
                                      setTimeout(async () => {
                                        await onFetch(true);
                                      }, 300);
                                      if ((item as any).appUrl) {
                                        window.location.href = (item as any).appUrl;
                                      }
                                    }}
                                  >
                                    去处理
                                  </nut-button>
                                </nut-row>
                              </div>
                            );
                          }
                        }}
                      </nut-list-v2-only>
                    </nut-tab-pane>
                    <nut-tab-pane title="已读消息" pane-key="2">
                      <nut-list-v2-only
                        ref={listRef.value}
                        loading={readLoading.value}
                        items={fileList.value}
                        virtualScrollProps={{
                          style: {
                            background: "#fff"
                          }
                        }}
                        virtualScrollItemProps={{
                          style: {
                            // background: "#f1f1f1",
                            padding: "8px",
                            border: "1px solid #f1f1f1"
                          }
                        }}
                        isVirtual={true}
                        isRefresh={false}
                      >
                        {{
                          default: ({ item }: IPublicListItemType<FileAttachmentType>) => {
                            return (
                              <div class="unRead-border">
                                <nut-row className="list-margin">
                                  <nut-col span={"24"}>
                                    <span class="read-icon"></span>您有一条新的{item.title}需要处理
                                  </nut-col>
                                </nut-row>
                                <nut-row className="list-margin list-date">
                                  <nut-col span={3}>
                                    <svg
                                      class="icon"
                                      viewBox="0 0 1024 1024"
                                      version="1.1"
                                      xmlns="http://www.w3.org/2000/svg"
                                      p-id="21696"
                                      width="20"
                                      height="20"
                                    >
                                      <path
                                        d="M511.3 926.5c-55.9 0-110.2-11-161.2-32.6-49.3-20.9-93.6-50.7-131.7-88.8-38-38-67.9-82.3-88.8-131.7C108 622.3 97 568.1 97 512.2S108 402 129.6 351c20.9-49.3 50.7-93.6 88.8-131.7 38-38 82.3-67.9 131.7-88.8C401.2 108.9 455.4 98 511.3 98s110.2 11 161.2 32.6c49.3 20.9 93.6 50.7 131.7 88.8 38 38 67.9 82.3 88.8 131.7 21.6 51.1 32.6 105.3 32.6 161.2s-11 110.2-32.6 161.2c-20.9 49.3-50.7 93.6-88.8 131.7s-82.3 67.9-131.7 88.8c-51 21.5-105.3 32.5-161.2 32.5z m0-768.5C316 158 157.1 316.9 157.1 512.2S316 866.5 511.3 866.5s354.2-158.9 354.2-354.2S706.7 158 511.3 158z"
                                        fill="#515151"
                                        p-id="21697"
                                      ></path>
                                      <path
                                        d="M640.1 702.1c-7.7 0-15.3-2.9-21.2-8.8l-128-127.9c-5.6-5.6-8.8-13.3-8.8-21.2V288c0-16.6 13.4-30 30-30s30 13.4 30 30v243.8l119.2 119.1c11.7 11.7 11.7 30.7 0 42.4-5.8 5.9-13.5 8.8-21.2 8.8z"
                                        fill="#515151"
                                        p-id="21698"
                                      ></path>
                                    </svg>
                                  </nut-col>
                                  <nut-col span={21}>{dayjs(item.createdAt).format("YYYY-MM-DD HH:mm:ss")}</nut-col>
                                </nut-row>
                                <nut-row className="list-border">
                                  <nut-tag type="primary" onClick={methods.openMsg.bind(null, item)}>
                                    查看详情
                                  </nut-tag>
                                  {/*<nut-fold-divider*/}
                                  {/*  v-model={item.isExpand}*/}
                                  {/*  title="查看详情"*/}
                                  {/*  content-position="center"*/}
                                  {/*></nut-fold-divider>*/}
                                </nut-row>
                                <nut-row v-show={!item.isExpand} className="list-margin">
                                  <div class="list-text" v-html={item.msgContent}></div>
                                </nut-row>
                                <nut-row
                                  v-show={!item.isExpand && item.pcUrl && (item.isNeedDispose || !item.isNeedDispose)}
                                  className="list-margin"
                                >
                                  <nut-button
                                    type="primary"
                                    shape="round"
                                    style={"margin-top:10px"}
                                    onClick={() => {
                                      if ((item as any).appUrl) {
                                        window.location.href = (item as any).appUrl;
                                      }
                                    }}
                                  >
                                    去处理
                                  </nut-button>
                                </nut-row>
                                <nut-row v-show={!item.isExpand && item.isRead && item.msgDisposeResult} className="list-margin">
                                  <nut-row>处理结果：</nut-row>
                                  <nut-row>
                                    <div v-html={item.msgDisposeResult}></div>
                                  </nut-row>
                                </nut-row>
                              </div>
                            );
                          }
                        }}
                      </nut-list-v2-only>
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
                  <div style={"height:200px;background:#fff"}>
                    <nut-flex-box item-num={flexPopuerConfig.length} item-config={flexPopuerConfig}>
                      {{
                        "item-1": () => {
                          return (
                            <nut-panel border title={"消息类型"} background paddingSize={"smalll"}>
                              <nut-checkbox-group ref="group" v-model={checkVal.value}>
                                <nut-checkbox label="预警" shape="button">
                                  预警信息
                                </nut-checkbox>
                                <nut-checkbox label="审批" shape="button">
                                  审批消息
                                </nut-checkbox>
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
                                          messageList.value = fileList.value;
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
