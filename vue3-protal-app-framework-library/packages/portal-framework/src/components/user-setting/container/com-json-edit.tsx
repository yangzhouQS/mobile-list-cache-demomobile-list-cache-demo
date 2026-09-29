import { defineComponent, ref } from "vue";
import { showToast } from "@cs/nutui-pro";
export const ComJsonEdit = defineComponent({
  name: "ComJsonEdit",
  props: {
    value: {
      type: Boolean
    },
    disabled: {
      type: Boolean
    }
  },
  emits: ["update:value", "change"],
  setup(props, { emit }) {
    const value = ref(JSON.stringify(props.value, null, "  "));
    const dialogVisible = ref(false);
    const flexConfig = ref([
      {
        tag: "item-1",
        isFixed: false,
        size: "",
        paddingSize: "large",
        clearPadding: []
      }
    ]);
    return () => {
      return (
        <div>
          <nut-button
            type={"primary"}
            plain
            onClick={() => {
              dialogVisible.value = true;
            }}
          >
            {{
              default: () => {
                return props.disabled ? "查看配置" : "打开编辑";
              }
            }}
          </nut-button>
          <nut-dialog
            teleport={"#app"}
            title={props.disabled ? "查看配置" : "编辑对象"}
            ok-text="保存"
            onOk={() => {
              try {
                const val = JSON.parse(value.value);
                emit("update:value", val);
                emit("change", val);
                dialogVisible.value = false;
              } catch (error) {
                showToast.fail("请输入正确的格式");
              }
            }}
            closeOnClickOverlay={false}
            v-model:visible={dialogVisible.value}
          >
            {{
              default: () => {
                return (
                  <nut-flex-box item-num={flexConfig.value.length} item-config={flexConfig.value}>
                    {{
                      "item-1": () => {
                        return (
                          <nut-box paddingSize={"small"} border>
                            <nut-textarea v-model={value.value} disabled={props.disabled} rows={8} />
                          </nut-box>
                        );
                      }
                    }}
                  </nut-flex-box>
                );
              }
            }}
          </nut-dialog>
        </div>
      );
    };
  }
});
