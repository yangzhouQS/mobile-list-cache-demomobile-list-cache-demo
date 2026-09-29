import { defineComponent, PropType, ref } from "vue";
import { ElementOption } from "./types";

export const ComDatePicker = defineComponent({
  name: "ComDatePicker",
  props: {
    value: {
      type: String
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
    const methods = {
      handleChange: (val: string) => {
        emit("update:value", val);
        emit("change", val);
      }
    };
    return () => {
      return (
        <nut-select-date-picker
          v-model={value.value}
          ok-text="生效"
          type={props.options.elementConfig.type}
          disable={props.options.elementConfig.disabled || props.disabled}
          style={props.options.elementConfig.style}
          onChange={methods.handleChange}
        />
      );
    };
  }
});
