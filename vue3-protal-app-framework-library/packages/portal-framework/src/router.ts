import { FlowPageTaskPendingApprove, FlowPageTaskProcessInitiation, FlowPageTaskToMe } from "./components-workflow";
import { AppMy } from "./components/frame-app/app-my";
import { appEventBus } from "../src/components/app-event-bus";
import { AppMessage } from "./components/my-app/app-message";
import { AppGonggao } from "./components/my-app/app-gonggao";
import { UserIndexSetting } from "./components/user-setting/user-index-setting";
import { UserSetting } from "./components/user-setting/user-setting";
import { userPrint } from "./components/user-print/user-print";
import { FlowTaskDetail, FlowTaskProcess, FlowTaskUrge } from "./components-workflow/flow-component";

export const routes = [
  // 流程列表界面b
  {
    path: "/InnerTaskToMe", // 与我相关
    name: "InnerTaskToMe",
    component: FlowPageTaskToMe,
    meta: {
      title: "与我相关"
    }
  },
  {
    path: "/InnerPendingApprove", // 待我处理
    name: "InnerPendingApprove",
    component: FlowPageTaskPendingApprove
  },
  {
    path: "/InnerProcessInitiation", // 由我发起
    name: "InnerProcessInitiation",
    component: FlowPageTaskProcessInitiation
  },
  {
    path: "/InnerAppMy", // 我的
    name: "InnerAppMy",
    meta: {
      showTab: true
    },
    component: AppMy,
    beforeEnter: (to, from, next) => {
      appEventBus.emit("setTabActive", "my");
      next();
    }
  },

  // 流程任务相关
  {
    path: "/InnerFlowTaskDetail", // 流程详情
    name: "InnerFlowTaskDetail",

    component: FlowTaskDetail
  },
  {
    path: "/InnerFlowTaskProcess", // 流程处理过程
    name: "InnerFlowTaskProcess",

    component: FlowTaskProcess
  },
  {
    path: "/InnerFlowTaskUrge", // 任务催办
    name: "InnerFlowTaskUrge",

    component: FlowTaskUrge
  },
  {
    path: "/AppMessage", // 消息
    name: "AppMessage",
    component: AppMessage
  },
  {
    path: "/UserSetting", // 设置
    name: "UserSetting",
    component: UserSetting
  },
  {
    path: "/UserIndexSetting", // 设置
    name: "UserIndexSetting",
    component: UserIndexSetting
  },
  {
    path: "/AppGonggao", // 公告
    name: "AppGonggao",
    component: AppGonggao
  },
  {
    path: "/userPrint", //打印机
    name: "userPrint",
    component: userPrint
  }
];
