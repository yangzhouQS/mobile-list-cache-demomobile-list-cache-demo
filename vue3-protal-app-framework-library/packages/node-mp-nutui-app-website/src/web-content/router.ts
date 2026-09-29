import { MainPage } from './components/main-page'
import { FlowDemo } from './components/flow-demo/flow-demo'


export const routes =  [
  {
    path: "/",
    component: MainPage,
    meta: {
      title: '首页',
      orgPanel: true, // 路由显示组织机构
      showTab: true // 路由显示底部tab
    },
  },
  {
    path: "/index-demo",
    component: () => import( "./views/index/index.vue" ),
  },
  /*{
    path: "/TabsTest",
    component: () => import( "./components/tabs/demo" ),
  },*/
  {
    path: "/flow-demo",
    component: FlowDemo,
  },
  { path: "/home", component: () => import( "./views/home.vue" ) },
  { path: "/details", component: () => import( "./views/details/index.vue" ) },
]

