<template>
  <div class="order-page">
    <div class="order-header">
      <div class="order-header-icon" @click="goBack">
        <RectLeft></RectLeft>
      </div>
      <div class="order-header-title">订单列表（缓存演示）</div>
      <div class="order-header-action" @click="goAdd">新增</div>
    </div>

    <div class="order-stats">
      <span>列表请求：{{ requestStats.listCount }} 次</span>
      <span>当前滚动：{{ currentScrollTop }} px</span>
      <span>已加载：{{ orderList.length }} / {{ total }} 条</span>
    </div>

    <div ref="scrollRef" class="order-scroll" @scroll.passive="handleScroll">
      <div
        v-for="item in orderList"
        :key="item.id"
        class="order-card"
        @click="goDetail(item.id)"
      >
        <div class="order-card-row">
          <div class="order-card-code">{{ item.orderCode }}</div>
          <div :class="['order-card-status', `order-card-status-${item.status}`]">{{ item.status }}</div>
        </div>
        <div class="order-card-row">
          <div class="order-card-name">{{ item.materialName }}</div>
          <div class="order-card-num">{{ item.num }} {{ item.unit }}</div>
        </div>
        <div class="order-card-row">
          <div class="order-card-date">{{ item.createDate }}</div>
          <div class="order-card-btn" @click.stop="goEdit(item.id)">编辑</div>
        </div>
      </div>

      <div v-if="isLoading" class="order-tip">加载中...</div>
      <div v-else-if="orderList.length < total" class="order-tip" @click="loadMore">加载更多</div>
      <div v-else class="order-tip">没有更多了</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { RectLeft } from '@nutui/icons-vue'
import { useListKeepAlive } from '../../utils/list-keep-alive'
import { fetchOrderPage, requestStats } from './order-mock'
import type { OrderItem } from './order-mock'

defineOptions({ name: 'OrderList' })

/** 列表缓存标识：新增/编辑页返回时通过它指定是否刷新 */
const LIST_KEY = 'order-list'

const router = useRouter()

const scrollRef = ref<HTMLElement | null>(null)
const orderList = ref<OrderItem[]>([])
const total = ref(0)
const pageNum = ref(1)
const isLoading = ref(false)
const currentScrollTop = ref(0)

/** 重置分页并重新请求（首次进入、以及"新增返回需要刷新"时触发） */
const fetchList = async () => {
  isLoading.value = true
  try {
    const { list, total: sum } = await fetchOrderPage(1)
    pageNum.value = 1
    orderList.value = list
    total.value = sum
  } finally {
    isLoading.value = false
  }
}

const loadMore = async () => {
  if (isLoading.value || orderList.value.length >= total.value) {
    return
  }
  isLoading.value = true
  try {
    const { list } = await fetchOrderPage(pageNum.value + 1)
    pageNum.value += 1
    orderList.value = orderList.value.concat(list)
  } finally {
    isLoading.value = false
  }
}

const handleScroll = () => {
  currentScrollTop.value = Math.round(scrollRef.value?.scrollTop ?? 0)
}

/**
 * 缓存控制（核心）：
 * - 离开页面时记录 .order-scroll 滚动位置
 * - 返回时无刷新标记 -> 恢复位置（详情/编辑返回场景）
 * - 返回时有刷新标记 -> 重新请求并回到顶部（新增保存返回场景）
 */
useListKeepAlive({
  listKey: LIST_KEY,
  getScrollEl: () => scrollRef.value,
  onRefresh: async () => {
    await fetchList()
    // 程序置 0 不触发 scroll 事件，手动同步显示
    currentScrollTop.value = 0
  }
})

fetchList()

const goBack = () => {
  router.back()
}

const goAdd = () => {
  router.push({ path: '/order-add' })
}

const goDetail = (id: number) => {
  router.push({ path: `/order-detail/${id}` })
}

const goEdit = (id: number) => {
  router.push({ path: `/order-edit/${id}` })
}
</script>

<style scoped lang="less">
.order-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--nut-bg-color-page, #f5f6f7);
}

.order-header {
  display: flex;
  align-items: center;
  height: 44px;
  padding: 0 12px;
  flex-shrink: 0;
  color: #fff;
  background: var(--nut-primary-color, #165dff);

  .order-header-icon {
    font-size: 18px;
    width: 32px;
  }

  .order-header-title {
    flex: 1;
    font-size: 16px;
    font-weight: 700;
  }

  .order-header-action {
    font-size: 14px;
    padding: 4px 10px;
    border: 1px solid rgba(255, 255, 255, 0.7);
    border-radius: 14px;
  }
}

.order-stats {
  display: flex;
  justify-content: space-around;
  flex-shrink: 0;
  padding: 6px 12px;
  font-size: 12px;
  color: var(--nut-help-color, #999);
  background: #fff;
  border-bottom: 1px solid #eee;
}

.order-scroll {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 12px;
}

.order-card {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;

  .order-card-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    line-height: 22px;

    & + .order-card-row {
      margin-top: 4px;
    }
  }

  .order-card-code {
    font-size: 15px;
    font-weight: 700;
    color: var(--nut-title-color, #1a1a1a);
  }

  .order-card-status {
    font-size: 12px;

    &.order-card-status-已签收 {
      color: var(--nut-primary-color, #165dff);
    }

    &.order-card-status-运输中 {
      color: var(--nut-warning-color, #f90);
    }

    &.order-card-status-待过磅 {
      color: var(--nut-danger-color, #fa2c19);
    }
  }

  .order-card-name {
    font-size: 14px;
    color: var(--nut-title-color2, #666);
  }

  .order-card-num {
    font-size: 14px;
    color: var(--nut-title-color, #1a1a1a);
  }

  .order-card-date {
    font-size: 12px;
    color: var(--nut-help-color, #999);
  }

  .order-card-btn {
    font-size: 12px;
    color: var(--nut-primary-color, #165dff);
    padding: 2px 10px;
    border: 1px solid var(--nut-primary-color, #165dff);
    border-radius: 12px;
  }
}

.order-tip {
  text-align: center;
  font-size: 13px;
  color: var(--nut-help-color, #999);
  padding: 8px 0 16px;
}
</style>
