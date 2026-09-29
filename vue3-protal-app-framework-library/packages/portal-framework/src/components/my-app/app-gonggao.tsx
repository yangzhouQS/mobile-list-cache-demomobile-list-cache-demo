import { defineComponent, onMounted, reactive, ref } from "vue";
import { appStore } from "../../store/frame-store";
import dayjs from "dayjs";
import { $http } from "../../utils";
import { showDialog } from "@nutui/nutui";
import "./style.less";
import { IPublicListItemType, ResulType } from "../../components-workflow";
import { FileAttachmentType } from "../../components-workflow";

export const AppGonggao = defineComponent({
  name: "AppGonggao",
  setup: function () {
    const flexConfig = reactive([
      {
        tag: "item-1",
        isFixed: false,
        size: "",
        paddingSize: "large",
        clearPadding: []
      }
    ]);
    const store = appStore();
    const readLoading = ref(false);
    const fileList = ref<any[]>([]);
    const listRef = ref();
    const methods = {
      openMsg: (item: any) => {
        showDialog({
          title: item.title,
          content: "<div style='padding: 8px'>" + item.msgContent + "</div>",
          noOkBtn: true,
          noCancelBtn: true
        });
      }
    };
    const onFetch = async (_: boolean) => {
      readLoading.value = true;
      const result = (await $http.get(
        `/shared-data/message/backlog?msgType=sysmsg&limit=100&offset=0&tenantId=${store.$context.tenantId}`,
        {}
      )) as ResulType;
      if (result.result && result.result.length > 0) {
        // result.tasks.forEach((i: any) => {
        //   i.isExpand = false;
        //   if (!i.appUrl) {
        //     let stringArray = i.msgContent.split('class="operator-btn">');
        //     i.msgContent = stringArray[0] + "></div>";
        //   } else {
        //     i.msgContent = i.msgContent.replace("button", 'nut-button shape="round" size="small"');
        //     i.msgContent = i.msgContent.replace(
        //       "background-color: #518db5;border-color: #518db5;",
        //       "background-color: #345dfc;border-color: #345dfc;margin-top: 5px;"
        //     );
        //     i.msgContent = i.msgContent.replace("padding: 9px 15px;", "padding: 6px 12px;");
        //   }
        // });
        fileList.value = result.result;
        readLoading.value = false;
      } else {
        readLoading.value = false;
      }
    };
    onMounted(async () => {
      await onFetch(false);
    });
    return () => {
      return (
        <div style={"width:100%;height:100%"}>
          <nut-flex-box item-num={flexConfig.length} item-config={flexConfig}>
            {{
              "item-1": () => {
                return (
                  <nut-box paddingSize={"small"} background>
                    <nut-list-v2-only
                      ref={listRef.value}
                      items={fileList.value}
                      loading={readLoading.value}
                      isVirtual={true}
                      isRefresh={false}
                    >
                      {{
                        default: ({ item }: IPublicListItemType<FileAttachmentType>) => {
                          return (
                            <div class="unRead-border" onClick={methods.openMsg.bind(null, item)} style={"background:#ffffff"}>
                              <nut-row class="list-margin">
                                <nut-col span={"24"}>
                                  <span class="unRead-icon"></span>
                                  {item.title}
                                </nut-col>
                              </nut-row>
                              <nut-row class="list-margin">{dayjs(item.createdAt).format("YYYY-MM-DD HH:mm:ss")}</nut-row>
                            </div>
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
