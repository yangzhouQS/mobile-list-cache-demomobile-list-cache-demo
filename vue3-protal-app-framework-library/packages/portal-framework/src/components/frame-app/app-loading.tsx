import { defineComponent } from "vue";

export const AppLoading = defineComponent({
  name: "AppLoading",
  setup() {
    return () => {
      return (
        <div class="app-loading">
          <div class="breeding-rhombus-spinner">
            <div class="rhombus child-1" />
            <div class="rhombus child-2" />
            <div class="rhombus child-3" />
            <div class="rhombus child-4" />
            <div class="rhombus child-5" />
            <div class="rhombus child-6" />
            <div class="rhombus child-7" />
            <div class="rhombus child-8" />
            <div class="rhombus big" />
          </div>
        </div>
      );
    };
  }
});
