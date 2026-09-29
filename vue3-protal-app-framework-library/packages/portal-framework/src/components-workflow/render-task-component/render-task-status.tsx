import { defineComponent } from "vue";

// 任务状态渲染
export const RenderTaskStatus = defineComponent({
  name: "RenderTaskStatus",
  props: {
    status: {
      type: Number,
      default: null,
      required: true
    }
  },
  setup(props) {
    const statusMap = {
      "-1": {
        label: "等待中",
        type: "primary",
        plain: true
      },
      "1": {
        label: "处理中",
        type: "warning",
        plain: true
      },
      "2": {
        label: "已完成",
        type: "success"
      }
    };
    return () => {
      let status = statusMap[props.status];
      if (!status) {
        status = {
          plain: true,
          label: "未处理",
          type: "warning"
        };
      }
      return (
        <nut-tag plain={status.plain} type={status.type}>
          {status.label}
        </nut-tag>
      );
    };
  }
});
