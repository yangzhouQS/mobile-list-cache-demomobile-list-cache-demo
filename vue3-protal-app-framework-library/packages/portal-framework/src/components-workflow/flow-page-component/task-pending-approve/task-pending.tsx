import { defineComponent, ref, watch } from "vue";
import { debounce, trim, get } from "lodash";
import { useContext } from "../../../hooks/useContext";
import { errorMessage, GlobalToast, QueryParams } from "../../../utils";
import { flowTaskApiHelper } from "../../api-config";
import { QueryTaskResultType, ResulType } from "../../workflow-types";
import { FlowTaskList } from "../../inner-task-list";

export const TaskPending = defineComponent({
  name: "TaskPending",
  props: {
    filerValue: {
      type: String,
      default: ""
    },
    flowId: {
      type: [String, Number],
      default: ""
    },
    checkVal: {
      type: Array
    }
  },
  setup(props, { expose }) {
    const ctx = useContext();
    const loading = ref(false);
    const taskRef = ref<any>();

    watch(
      () => {
        return [props.filerValue, props.flowId];
      },
      debounce(() => {
        taskRef.value?.reload();
      }, 300)
    );
    expose({
      listRef: taskRef
    });
    const onFetch = ({ done, fail, paginationParams }) => {
      const params = new QueryParams({
        conditionLambda: `
        is_removed = 0 
        and tenant_id = :tenantId 
        and status in (:...status) 
        and flow_receive_id = :flowReceiveId`,
        conditionValue: {
          tenantId: ctx.tenantId,
          instanceCode: `%${trim(props.filerValue)}%`,
          orgId: ctx.currentOrg.id,
          flowReceiveId: `${ctx.user.id}`,
          status: [0, 1],
          flowId: props.flowId
        },
        orderBy: {
          "f_flow_task.createdAt": "desc",
          sort_code: "asc"
        },
        tableName: "f_flow_task"
      });
      if (props.checkVal && props.checkVal.length > 0) {
        const flowIdStr = props.checkVal.join('","');
        params.conditionLambda += ` and flow_id in ("${flowIdStr}")`;
      }
      params.take = paginationParams.limit;
      params.skip = paginationParams.offset;
      if (props.filerValue && props.filerValue !== "") {
        params.conditionLambda += " and instance_code like :instanceCode";
      }
      if (props.flowId) {
        params.conditionLambda += " and flow_id = :flowId ";
      }

      Object.assign(params, { orgId: ctx.currentOrg.id });

      flowTaskApiHelper
        .queryTaskParams(params)
        .then((result: ResulType<QueryTaskResultType>) => {
          const items = get(result, "result.result", []);
          if (result.status === "success" && Array.isArray(items)) {
            done(items);
          } else {
            GlobalToast.error(errorMessage(result.message, "待处理流程，查询失败"));
            fail();
          }
          console.log("taskRef", taskRef.value);
          loading.value = false;
        })
        .catch((error: Error) => {
          GlobalToast.error(errorMessage(error, "待处理流程，查询失败"));
          loading.value = false;
          fail();
        });
    };

    return () => {
      return <FlowTaskList onFetch={onFetch} ref={taskRef} />;
    };
  }
});
