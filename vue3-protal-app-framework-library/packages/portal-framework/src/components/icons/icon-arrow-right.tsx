import { defineComponent } from "vue";

export const IconArrowRight = defineComponent({
  name: "IconArrowRight",
  setup() {
    return () => {
      return (
        <svg
          class="icon"
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          p-id="3996"
          width="16"
          height="16"
        >
          <path
            d="M213.333333 128l130.432-128L853.333333 512 343.765333 1024 213.333333 896l384-384z"
            p-id="3997"
            fill="#707070"
          ></path>
        </svg>
      );
    };
  }
});
