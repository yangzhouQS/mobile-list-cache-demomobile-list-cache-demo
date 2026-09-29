import { defineComponent, PropType, ref } from "vue";
import { ElementOption } from "./types";

export const ComInput = defineComponent({
  name: "ComInput",
  props: {
    value: {
      type: [Number, String, Boolean]
    },
    options: {
      type: Object as PropType<ElementOption>
    },
    disabled: {
      type: Boolean
    }
  },
  emits: ["update:value", "change"],
  setup(props, { emit }) {
    const value = ref(props.value);
    return () => {
      if (props.options.elementConfig.type === "textarea") {
        return (
          <nut-textarea
            v-model={value.value}
            placeholder={props.options.elementConfig.placeholder}
            disabled={props.options.elementConfig.disabled || props.disabled}
            readonly={props.options.elementConfig.isRead}
            maxLength={props.options.elementConfig.maxlength || 5000}
            style={props.options.elementConfig.style}
            rows={1}
            onBlur={(val: any) => {
              emit("update:value", val.value);
              emit("change", val.value);
            }}
          />
        );
      } else {
        return (
          <nut-input
            v-model={value.value}
            placeholder={props.options.elementConfig.placeholder || ""}
            disabled={props.options.elementConfig.disabled || props.disabled}
            clearable={props.options.elementConfig.clearable}
            readonly={props.options.elementConfig.isRead}
            type={props.options.elementConfig.type || "text"}
            maxLength={props.options.elementConfig.maxlength || 5000}
            style={props.options.elementConfig.style}
            onBlur={(val: { currentTarget: any }) => {
              emit("update:value", val.currentTarget._value);
              emit("change", val.currentTarget._value);
            }}
          />
        );
      }
    };
  }
});
