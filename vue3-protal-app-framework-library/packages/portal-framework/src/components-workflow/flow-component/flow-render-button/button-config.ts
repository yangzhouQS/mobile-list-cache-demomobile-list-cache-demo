export const buttonConfig = {
  submit: {
    value: "转交下一步",
    type: "primary",
    plain: true,
    loading: false
  }, // 转交下一步 同意所审批的表单，并转给下一步处理人
  goBack: {
    value: "驳回",
    type: "warning",
    plain: true,
    loading: false
  }, // 驳回 否决所审批的表单，退回到规定的审批环节
  stop: {
    value: "终止",
    type: "danger",
    plain: false,
    loading: false
  }, // 终止
  copyFor: {
    value: "抄送",
    type: "primary",
    plain: true,
    loading: false
  }, // 抄送
  complete: {
    value: "完成",
    type: "primary",
    plain: false,
    loading: false
  }, // 完成
  copyForComplete: {
    value: "阅知",
    type: "primary",
    plain: true,
    loading: false
  }, // 阅知
  flowProcess: {
    value: "流程处理过程",
    type: "primary",
    plain: true,
    loading: false
  }, // 流程处理过程
  commentButton: {
    value: "审批意见",
    type: "primary",
    plain: true,
    loading: false
  } // 流程处理过程
};
