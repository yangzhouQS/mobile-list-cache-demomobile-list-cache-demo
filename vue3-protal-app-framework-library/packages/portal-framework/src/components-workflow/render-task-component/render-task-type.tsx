import { defineComponent } from "vue";

// 任务类型
export const RenderTaskType = defineComponent({
  name: "RenderTaskType",
  props: {
    taskType: {
      type: Number,
      default: null,
      required: true
    }
  },
  setup(props) {
    const taskTypeMap = {
      "0": {
        label: "普通",
        type: "primary",
        plain: true
      },
      "1": {
        label: "退回",
        type: "warning",
        plain: true
      },
      "-2": {
        label: "抄送",
        type: "danger",
        plain: true
      }
    };
    return () => {
      let task = taskTypeMap[props.taskType];
      if (!task) {
        task = taskTypeMap[0];
      }
      return (
        <nut-tag plain={task.plain} type={task.type}>
          {task.label}
        </nut-tag>
      );
    };
  }
});
