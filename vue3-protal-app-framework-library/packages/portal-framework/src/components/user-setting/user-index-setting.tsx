import { ref, onMounted, defineComponent, computed } from "vue";
import { $http } from "../../utils";
import { appStore } from "../../store/frame-store";
import { showToast } from "@cs/nutui-pro";
import "./style.less";
import { Category } from "./container/types";
import { useRouter } from "vue-router";

export const UserIndexSetting = defineComponent({
  name: "UserIndexSetting",
  setup() {
    const router = useRouter();
    const store = appStore();
    const configCategoryValue = ref({});
    const configCategoryArr = ref([]);
    const loading = ref(false);
    const isRender = ref(false);
    const slots = ref({});
    const flexConfig = computed(() => {
      return configCategoryArr.value.map((item, i) => {
        return {
          tag: "item-" + (i + 1),
          isFixed: true,
          size: "",
          paddingSize: "large",
          isHidden: false,
          clearPadding: i === configCategoryArr.value.length - 1 ? [] : ["bottom"],
          data: {
            category: item,
            paramsValue: configCategoryValue.value[item.code]
          }
        };
      });
    });

    /*watch(
      () => configCategoryArr,
      () => {
        configCategoryArr.value.map((item, i) => {
          const _item = {
            tag: "item-" + (i + 1),
            isFixed: true,
            size: "",
            paddingSize: "large",
            clearPadding: i === configCategoryArr.value.length - 1 ? [] : ["bottom"],
            data: {
              category: item,
              paramsValue: configCategoryValue.value[item.code]
            }
          };

          slots.value[_item.tag] = () => {
            return <SettingPanel category={_item.data} onReload={loadCategoryData} />;
          };

          return _item;
        });
      },
      { immediate: true, deep: true }
    );*/

    function generateFlexConfig(categorys: any[]) {
      if (!Array.isArray(categorys)) return;

      // 每次计算先清空之前的
      slots.value = {};
      categorys.forEach((item, i) => {
        const _item = {
          tag: "item-" + (i + 1),
          isFixed: true,
          size: "",
          paddingSize: "large",
          clearPadding: i === configCategoryArr.value.length - 1 ? [] : ["bottom"],
          data: {
            category: item,
            paramsValue: configCategoryValue.value[item.code]
          } as Category
        };

        slots.value[_item.tag] = () => {
          return (
            <nut-panel title={item.nameType} background padding={"small"} clearPadding={["left", "right", "bottom", "top"]}>
              {item.items.map((k: any) => {
                return (
                  <nut-cell
                    title={k.name}
                    is-link
                    onClick={() => {
                      let list = {
                        items: []
                      };
                      list.items.push(k);
                      store.categorysList = list;
                      router.push({ path: "/UserSetting" });
                    }}
                  ></nut-cell>
                );
              })}
            </nut-panel>
          );
        };
      });

      isRender.value = true;
    }

    const loadCategoryData = () => {
      loading.value = true;
      $http
        .post("/mp-configuration/config-panel-user", {
          namespaceCode: store.configSetting.namespaceCode,
          categoryCodes: ["global", "mq2APP"],
          level: 3,
          tenantId: store.$context.tenantId,
          orgId: store.orgRoot.fullId,
          global: "global",
          userId: store.$context.userId
        })
        .then((data: any) => {
          if (data.status === "success" && data.result) {
            configCategoryValue.value = data.result.jsonConfig;
            let categorysList = [];
            data.result.categorys.forEach((item: any) => {
              const fullName = item.fullName.split("|")[1];
              if (categorysList && categorysList.length > 0) {
                const num = categorysList.findIndex(k => k.nameType == fullName);
                if (num > -1) {
                  categorysList[num].items.push(item);
                } else {
                  categorysList.push({
                    nameType: fullName,
                    items: []
                  });
                  const nameNum = categorysList.findIndex(k => k.nameType == fullName);
                  categorysList[nameNum].items.push(item);
                }
              } else {
                categorysList.push({
                  nameType: fullName,
                  items: []
                });
                categorysList[0].items.push(item);
              }
            });
            configCategoryArr.value = categorysList; // data.result.categorys;
            // 优先使用方法去处理
            generateFlexConfig(configCategoryArr.value);

            // const jsonConfig = data.result.jsonConfig;
            // unset(jsonConfig, "mq2-material-account");
            // const categorys = filter(data.result.categorys, (item: Category) => {
            //   return !["mq2-material-account"].includes(item.code);
            // });
            //
            // configCategoryValue.value = jsonConfig;
            // configCategoryArr.value = categorys; // data.result.categorys;
            //
            // // 优先使用方法去处理
            // generateFlexConfig(categorys);
          } else if (data.status !== "success") {
            showToast.error({
              message: "配置加载失败"
            });
          }
          loading.value = false;
        });
    };
    onMounted(async () => {
      loadCategoryData();
    });

    return () => {
      if (configCategoryArr.value && configCategoryArr.value.length > 0 && !loading.value && isRender.value) {
        return (
          <nut-flex-box v-slots={slots.value} item-num={flexConfig.value.length} item-config={flexConfig.value}></nut-flex-box>
        );
      } else {
        return <nut-box border>暂无配置</nut-box>;
      }
    };
  }
});
