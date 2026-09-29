<template>
  <router-view v-slot="{ Component }">
    <page-cache :include="cacheRoutes">
      <component :is="Component" :key="$route.fullPath"></component>
    </page-cache>
  </router-view>
</template>

<script setup lang="ts">
import { PageCache } from './components/page-cache'

/** 需要长期缓存的路由（path 维度），任意方式到达优先从缓存恢复 */
const cacheRoutes = ['/order-list']
</script>
