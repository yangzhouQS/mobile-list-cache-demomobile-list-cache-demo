import { createRouter, createWebHashHistory } from 'vue-router'

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/home-view.vue'),
      meta: { title: '首页' }
    },
    {
      path: '/order-list',
      name: 'orderList',
      component: () => import('../views/order/order-list.vue'),
      meta: { title: '订单列表' }
    },
    {
      path: '/order-add',
      name: 'orderAdd',
      component: () => import('../views/order/order-add.vue'),
      meta: { title: '新增订单' }
    },
    {
      path: '/order-detail/:id',
      name: 'orderDetail',
      component: () => import('../views/order/order-detail.vue'),
      meta: { title: '订单详情' }
    },
    {
      path: '/order-edit/:id',
      name: 'orderEdit',
      component: () => import('../views/order/order-edit.vue'),
      meta: { title: '编辑订单' }
    },
    {
      path: '/select/:type',
      name: 'optionSelect',
      component: () => import('../views/select/option-select.vue'),
      meta: { title: '选择' }
    },
    {
      path: '/stock',
      name: 'stock',
      component: () => import('../views/stock/stock-layout.tsx'),
      meta: { title: '库存管理' },
      children: [
        {
          path: 'list',
          name: 'stockList',
          component: () => import('../views/stock/stock-list.tsx'),
          meta: { title: '库存列表' }
        },
        {
          path: 'list/detail/:id',
          name: 'stockDetail',
          component: () => import('../views/stock/stock-detail.tsx'),
          meta: { title: '库存详情' }
        },
        {
          path: 'list/edit/:id',
          name: 'stockEdit',
          component: () => import('../views/stock/stock-edit.tsx'),
          meta: { title: '库存编辑' }
        },
        {
          path: 'report',
          name: 'stockReport',
          component: () => import('../views/stock/stock-report.tsx'),
          meta: { title: '库存报表' }
        }
      ]
    }
  ]
})
