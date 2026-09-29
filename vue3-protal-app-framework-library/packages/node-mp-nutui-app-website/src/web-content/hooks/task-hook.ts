import { camelCase } from "lodash";

export const flowTaskFields = [
  "id",
  "tenant_code",
  "tenant_id",
  "tenant_name",
  "org_id",
  "org_name",
  "prev_id",
  "prev_step_id",
  "flow_id",
  "flow_name",
  "step_id",
  "step_name",
  "flow_group_id",
  "instance_id",
  "ori_instance_id",
  "instance_code",
  "task_type",
  "task_title",
  "flow_sender_id",
  "flow_sender_name",
  "flow_receive_id",
  "flow_receive_name",
  "flow_receive_time",
  "flow_open_time",
  "flow_completed_time",
  "flow_comment",
  "flow_customize_comment",
  "flow_option",
  "is_sign",
  "attach_keys",
  "sort_code",
  "status",
  "task_execute_type",
  "flow_step_sort_code",
  "flow_other_type",
  "remark",
  "is_finished",
  "created_at",
  "creator_id",
  "creator_name",
  "modified_at",
  "modifier_id",
  "modifier_name",
  "is_removed",
  "version"
];

export const getFlowTaskField = () => {
  return flowTaskFields.map((filedKey: string) => {
    return camelCase(filedKey);
  });
};
