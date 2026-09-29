## 移动端portal功能列表
``` 
1，根据url应用id查询授权的组织

2，根据url加载指定组织机构上下文信息

3，组织机构显示根据路由原信息配置显示

4，tab页签根据配置在指定路由显示（主页 / 我的）

5，上下文初始化和tab页签切换提供对外监听事件

```

## 调用流程
``` 
1. 模块上下文初始化/services/module-context

2.根节点 /services/org-nodes、菜单/services/menus、所属项目部/cbaseinfo/organizations-type


```

## 元数据配置方式
``` 
/applications/1815071978877440
访问后重定向, 会携带默认的orgId和moduleId
/nutui-app/home-page.html?applicationId=1815071978877440&moduleId=1815071446004224&orgId=10001#/
```

## 点击菜单跳转模块
```tsx
import {defineComponent} from 'vue';
import {appStore, openMenu} from '@yearrow/vue3-portal-app-framework-library'
import {computed} from 'vue'
import {Dongdong} from '@nutui/icons-vue'

export const HomePage = defineComponent({
  name: 'HomePage',
  setup(props) {
    const store = appStore()
    // 排除当前模块的所有菜单
    const menus = computed(() => store.menus)

    // 点击菜单调整模块
    const handleClick = (item: any) => {
      if (!item) return
      openMenu(item)
    }

    return () => {
      return <div>
        component name: HomePage
        <nut-grid column-num={3}>
          {
            menus.value.map(item => {
              return <nut-grid-item text={item.aliasName} onClick={handleClick.bind(null, item)}><Dongdong/>
              </nut-grid-item>
            })
          }
        </nut-grid>
      </div>
    }
  }
})

```

## 使用方式
```ts
import { CreateAppFramework } from '@yearrow/vue3-portal-app-framework-library'

import { VuePageStackPlugin } from 'vue-page-stack'
// import { router } from './router'
const router = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/Home.vue'),
  }
]

// 初始化, 路由会内部进行初始化
const app = new CreateAppFramework({ rootComponent: App, router })

// 插件注册
app.use(VuePageStackPlugin, { router:app.router })

// 挂载渲染
app.mount('#app')
```
## 待处理
``` 
1，树形结构设置默认展开存在问题

2，展开和收起设置图标
```

## 上下文初始化生命周期

``` 

beforeCreateApp
afterCreateApp


tab切换事件
app.tableSwitch.item ({item,index})=>void


动态设置组织机构隐藏(路由必须先配置组织机构显示)
app.setShowHeader

/*监听设置showHeader的显示状态*/
appEventBus.on('app.setShowHeader', (show: boolean) => {
    // 路由配置显示为前提
    showHeader.value = routeMeta.value?.meta?.orgPanel && show
})

```


## 快速使用方式
``` 
import { CreateAppFramework } from '@yearrow/vue3-portal-app-framework-library'

import { VuePageStackPlugin } from 'vue-page-stack'

// 初始化
const app = new CreateAppFramework({ rootComponent: App,router  })

// 插件注册
app.use(VuePageStackPlugin, { router: app.router })

// 挂载渲染
app.mount('#app')

```

## 发版日志记录



|  版本号  |     时间     | 更新内容                           | 备注                       |
|:-----:|:----------:|:-------------------------------| -------------------------- |
| 0.6.0 | 2026-06-01 | 审批流解决查询结果数组访问问题                            |                            |
| 0.5.1 | 2026-4-15  | 支持云打印功能                        |                            |
| 0.5.0 | 2026-1-24  | 支持填写审批处理意见                     |                            |
| 0.4.0 | 2025-04-03 | 支持审批流表单自定义组件渲染                 |                            |
| 0.2.3 | 2024-11-29 | 过滤应用中的默认菜单                     |                            |
| 0.2.1 | 2024-11-29 | 导入openMenu方法, 外部打开菜单跳转使用       |                            |
| 0.2.0 | 2024-11-27 | 上下文初始化查询接口替换                   | 和PC端接口一致             |
| 0.1.2 | 2024-11-4  | context上下文添加 {fullId,fullName} | 查询账期需要组织机构fullId |


