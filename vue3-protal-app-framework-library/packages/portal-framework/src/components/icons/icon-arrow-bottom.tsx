import { defineComponent } from "vue";

export const IconArrowBottom = defineComponent({
  name: "IconArrowBottom",
  setup() {
    return () => {
      return (
        <svg aria-hidden="true" fill="currentColor" width={20} height={20} viewBox="0 0 1024 1024">
          <path fill="currentColor" d="m192 384 320 384 320-384z"></path>
        </svg>
      );
    };
  }
});
