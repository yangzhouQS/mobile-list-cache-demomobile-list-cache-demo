import { computed, defineComponent } from "vue";

const taskExecuteTypeMap = {
  "0": {
    text: "未处理",
    type: "warning",
    plain: true
  },
  "1": {
    text: "处理中",
    plain: true,
    type: "primary"
  },
  "2": {
    text: "已完成",
    type: "success"
  },
  "21": {
    text: "他人已处理",
    type: "success",
    plain: true
  },
  "3": {
    text: "已退回",
    type: "warning"
  },
  "31": {
    text: "他人已退回",
    type: "warning"
  },
  "4": {
    text: "已抄送",
    type: "warning"
  },
  "77": {
    text: "已阅知",
    type: "success"
  },
  "87": {
    text: "已终止",
    type: "danger"
  },
  "88": {
    text: "他人已终止",
    type: "danger"
  },
  "99": {
    text: "征求意见回复",
    type: "warning"
  },
  "-1": {
    text: "等待中",
    type: "warning"
  }
};

// 执行任务类型
export const RenderTaskExecuteType = defineComponent({
  name: "RenderTaskExecuteType",
  props: {
    taskExecuteType: {
      type: [Number, String],
      default: 0
    }
  },
  setup(props) {
    const task = computed(() => {
      if (taskExecuteTypeMap[props.taskExecuteType]) {
        return taskExecuteTypeMap[String(props.taskExecuteType)];
      }
      return {
        text: "默认",
        type: "warning",
        plain: true
      };
    });
    return () => {
      return (
        <nut-tag type={task.value.type} plain={task.value.plain}>
          {task.value.text}
        </nut-tag>
      );
    };
  }
});
