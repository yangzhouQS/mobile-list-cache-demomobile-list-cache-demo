import { defineComponent, ref, watch } from "vue";
import { debounce, get } from "lodash";
import { useContext } from "../../../hooks/useContext";
import { QueryTaskResultType, ResulType } from "../../workflow-types";
import { errorMessage, GlobalToast, QueryParams } from "../../../utils";
import { FlowTaskList } from "../../inner-task-list";
import { flowTaskApiHelper } from "../../api-config";

/**
 * 抄送我的
 */
export const CopyMe = defineComponent({
  name: "CopyMe",
  props: {
    filerValue: {
      type: String,
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
        return props.filerValue;
      },
      debounce(() => {
        taskRef.value?.reload();
      }, 300)
    );

    expose({
      listRef: taskRef
    });

    return () => {
      const onFetch = ({ done, fail, paginationParams }) => {
        const params = new QueryParams({
          conditionLambda: ` is_removed = 0 
          and tenant_id = :tenantId 
          and flow_sender_id = :flowSenderId
          and task_type = 2
          `,
          conditionValue: {
            tenantId: ctx.tenantId,
            instanceCode: `%${props.filerValue.trim()}%`,
            orgId: ctx.currentOrg.id,

            flowSenderId: `${ctx.user.id}`,
            prevId: ""
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
        Object.assign(params, { orgId: ctx.currentOrg.id });

        flowTaskApiHelper
          .queryTaskParams(params)
          .then((result: ResulType<QueryTaskResultType>) => {
            const items = get(result, "result.result", []);
            if (result.status === "success" && Array.isArray(items)) {
              done(items);
            } else {
              GlobalToast.error(errorMessage(result.message, "抄送我的，查询失败"));
              fail();
            }
            loading.value = false;
          })
          .catch((error: Error) => {
            GlobalToast.error(errorMessage(error, "抄送我的，查询失败"));
            loading.value = false;
            fail();
          });
      };
      return <FlowTaskList onFetch={onFetch} ref={taskRef} showPreviewDetail />;
    };
  }
});
