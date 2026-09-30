<template>
  <router-view v-slot="{ Component }">
    <page-cache :include="cacheRoutes">
      <component :is="Component" :key="rootKey"></component>
    </page-cache>
  </router-view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { PageCache } from './components/page-cache'

/**
 * 需要长期缓存的路由（path 维度），任意方式到达优先从缓存恢复。
 * 注意：嵌套路由（如 /stock）的叶子页面不在此列——顶层渲染的是布局组件，
 * 叶子页面由布局内的嵌套 PageCache 缓存。
 */
const cacheRoutes = ['/order-list']

const route = useRoute()

/**
 * 顶层路由组件的 key：
 * - 单级路由：fullPath（同组件不同参数不复用实例，保持既有语义）
 * - 嵌套路由：matched[0].path（布局维度稳定）——若用 fullPath，三级页面切换
 *   时 key 变化会导致布局卸载重建，布局内的嵌套 PageCache 随之销毁，
 *   叶子页面缓存全部丢失
 */
const rootKey = computed(() =>
  route.matched.length > 1 ? route.matched[0].path : route.fullPath
)
</script>
