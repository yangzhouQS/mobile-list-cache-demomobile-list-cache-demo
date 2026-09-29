import { defineComponent, PropType, ref } from "vue";
import { ElementOption } from "./types";

export const ComInputNumber = defineComponent({
  name: "ComInputNumber",
  props: {
    value: {
      type: Number
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
        emit("update:value", val);
        emit("change", val);
      }
    };
    return () => {
      return (
        <nut-input-number
          v-model={value.value}
          disabled={props.options.elementConfig.disabled || props.disabled}
          step={props.options.elementConfig.step}
          min={props.options.elementConfig.min}
          max={props.options.elementConfig.max}
          style={props.options.elementConfig.style}
          decimalPlaces={props.options.elementConfig.precision}
          onChange={methods.handleChange}
        />
      );
    };
  }
});
