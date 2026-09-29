import { defineComponent } from "vue";

export const IconDaiwo = defineComponent({
  name: "IconDaiwo",
  emits: ["click"],
  setup(_, { emit }) {
    return () => {
      return (
        <svg
          class="icon"
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          p-id="1540"
          width="32"
          height="32"
          onClick={(e: Event) => {
            emit("click", e);
          }}
        >
          <path
            d="M896 564.565A277.333 277.333 0 0 0 590.763 1024H128a85.333 85.333 0 0 1-85.333-85.333V85.333A85.333 85.333 0 0 1 128 0h682.667A85.333 85.333 0 0 1 896 85.333v479.232zM213.333 224H731.82a32 32 0 0 0 0-64H213.333a32 32 0 0 0 0 64z m0 170.667h236.331a32 32 0 1 0 0-64h-236.33a32 32 0 0 0 0 64zM768 1024a213.333 213.333 0 1 1 0-426.667A213.333 213.333 0 0 1 768 1024z m30.421-245.333v-53.334a32 32 0 1 0-64 0v85.334c0 17.664 14.336 32 32 32h85.334a32 32 0 0 0 0-64H798.42z"
            fill="#2d6bef"
            p-id="1541"
          ></path>
        </svg>
      );
    };
  }
});
