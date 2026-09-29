import { defineComponent } from "vue";
import { RouterView } from "vue-router";

export const InnerApp = defineComponent({
  name: "InnerApp",
  setup() {
    return () => {
      return <RouterView />;
    };
  }
});
