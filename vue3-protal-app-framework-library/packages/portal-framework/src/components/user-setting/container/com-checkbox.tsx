import { defineComponent, PropType, ref } from "vue";
import { ElementOption } from "./types";

export const ComCheckbox = defineComponent({
  name: "ComCheckbox",
  props: {
    value: {
      type: Boolean
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
      handleChange: (val: number) => {
        emit("change", val);
        setTimeout(() => {
          emit("update:value", val);
        });
      }
    };
    return () => {
      return (
        <nut-switch
          model-value={value.value}
          disabled={props.options.elementConfig.disabled || props.disabled}
          // style={props.options.elementConfig.style}
          onChange={methods.handleChange}
        />
      );
    };
  }
});
