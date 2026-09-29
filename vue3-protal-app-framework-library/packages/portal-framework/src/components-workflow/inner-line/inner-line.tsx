import { defineComponent } from "vue";

export const InnerLine = defineComponent({
  name: "InnerLine",
  emits: ["click"],
  setup(_, { slots, emit }) {
    return () => {
      return (
        <div class={"d-flex justify-space-between align-center"} onClick={(e: Event) => emit("click", e)}>
          {slots.default?.()}
        </div>
      );
    };
  }
});
