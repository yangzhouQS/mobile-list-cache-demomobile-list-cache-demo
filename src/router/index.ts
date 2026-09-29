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
    }
  ]
})
