import { defineComponent, onMounted, reactive, ref } from 'vue'
import { flowTaskApiHelper } from '@yearrow/vue3-portal-app-framework-library'
// import { useContext } from '@/web-content/hooks/useContext'
import type { ResulType } from '@yearrow/vue3-portal-app-framework-library'
import { GlobalToast, errorMessage } from '@yearrow/vue3-portal-app-framework-library'
import {
  FlowPageTaskPendingApprove,
  FlowPageTaskProcessInitiation,
  FlowPageTaskToMe
} from '@yearrow/vue3-portal-app-framework-library'
import { useContext } from '../../hooks/useContext'

export const FlowDemo = defineComponent({
  name: 'FlowDemo',
  setup(props) {
    const ctx = useContext()
    const taskRef = ref(null)
    const refresh = ref(false)
    const state = reactive({
      waitManage: 0,
      meStart: 0,
      aboutMe: 0,
      waitVisible: false, // 待我处理
      meVisible: false, // 由我发起
      aboutVisible: false // 与我相关
    })

    const methods = {
      queryTaskSumCount: () => {
        flowTaskApiHelper.queryTaskSum({
          orgId: ctx.currentOrg.id,
          userId: `${ctx.user.id}`
        }).then((result: ResulType) => {
          if (result.status === 'success') {
            const data = result.result
            state.waitManage = data.waitManage
            state.meStart = data.meStart
            state.aboutMe = data.aboutMe
          } else {
            GlobalToast.error(errorMessage(result.message, '查询失败'))
          }
        }).catch((err: Error) => {
          console.log('err', err)
        })
      }
    }
    onMounted(() => {
      methods.queryTaskSumCount()
    })
    return () => {
      return <div class={'main-page'}>
        <nut-popup duration={0} v-model:visible={state.waitVisible} position="bottom" style={{ height: '100%' }}>
          {state.waitVisible && (<FlowPageTaskPendingApprove />)}
        </nut-popup>
        <nut-popup duration={0} v-model:visible={state.meVisible} position="bottom" style={{ height: '100%' }}>
          {state.meVisible && (<FlowPageTaskProcessInitiation />)}
        </nut-popup>
        <nut-popup duration={0} v-model:visible={state.aboutVisible} position="bottom" style={{ height: '100%' }}>
          {state.aboutVisible && (<FlowPageTaskToMe />)}
        </nut-popup>
        <nut-pull-refresh v-model={refresh.value} onRefresh={methods.queryTaskSumCount}>
          <div class={'d-flex w-full h-full flex-column'}>
            <div class="main-page-banner"></div>
            <div class="flex-1 main-page-task-container relative" ref={taskRef}>
              {refresh.value && <nut-loading-v2 text="加载中......." attach={taskRef.value} />}
              <div
                class="main-page-task-count-item"
                onClick={() => {
                  state.waitVisible = true
                }}
              >
                <span class="main-page-task-count">{state.waitManage}</span>
                <span class="main-page-task-title">待我处理</span>
              </div>
              <div
                class="main-page-task-count-item opacity-60"
                onClick={() => {
                  state.meVisible = true
                  // return router.push("/TaskProcessInitiation");
                }}
              >
                <span class="main-page-task-count">{state.meStart}</span>
                <span class="main-page-task-title">由我发起</span>
              </div>
              <div
                class="main-page-task-count-item opacity-60"
                onClick={() => {
                  state.aboutVisible = true
                  // return router.push("/FlowTaskToMe");
                }}
              >
                <span class="main-page-task-count">{state.aboutMe}</span>
                <span class="main-page-task-title">与我相关</span>
              </div>
            </div>
          </div>
        </nut-pull-refresh>
      </div>
    }
  }
})
