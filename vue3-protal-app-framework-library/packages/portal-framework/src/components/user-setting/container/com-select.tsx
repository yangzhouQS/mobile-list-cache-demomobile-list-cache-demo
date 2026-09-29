import { defineComponent, PropType, ref } from "vue";
import { ElementOption } from "./types";

export const ComSelect = defineComponent({
  name: "ComSelect",
  props: {
    value: {
      type: [Number, String, Object]
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
      handleChange: (val: { value: any }) => {
        if (props.options.elementConfig.multiple) {
          emit("update:value", val);
          emit("change", val);
        } else {
          emit("update:value", val.value);
          emit("change", val.value);
        }
      }
    };
    return () => {
      if (props.options.elementConfig.multiple) {
        return (
          <nut-checkbox-group v-model={value.value} onChange={methods.handleChange}>
            {props.options.elementConfig.data.map((item: any) => {
              return (
                <nut-checkbox shape="button" label={item[props.options.elementConfig.value]}>
                  {item[props.options.elementConfig.label]}
                </nut-checkbox>
              );
            })}
          </nut-checkbox-group>
        );
      } else {
        let fieldNames = {
          text: props.options.elementConfig.defaultProps.label,
          value: props.options.elementConfig.defaultProps.value
        };
        let defaultText = "";
        let num = props.options.elementConfig.data.findIndex(
          i => i[props.options.elementConfig.defaultProps.value] == value.value
        );
        if (num > -1) {
          defaultText = props.options.elementConfig.data[num][props.options.elementConfig.defaultProps.label];
        }
        return (
          <nut-select-picker
            v-model={value.value}
            placeholder={props.options.elementConfig.placeholder}
            defaultText={defaultText}
            ok-text="生效"
            disable={props.options.elementConfig.disabled || props.disabled}
            fieldNames={fieldNames}
            columns={props.options.elementConfig.data}
            onConfirm={methods.handleChange}
          />
        );
      }
    };
  }
});
