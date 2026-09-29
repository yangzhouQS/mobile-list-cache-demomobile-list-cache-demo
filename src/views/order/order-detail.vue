<template>
  <div class="order-page">
    <div class="order-header">
      <div class="order-header-icon" @click="goBack">
        <RectLeft></RectLeft>
      </div>
      <div class="order-header-title">订单详情</div>
      <div class="order-header-space"></div>
    </div>

    <div class="order-body">
      <div v-if="isLoading" class="order-tip">加载中...</div>
      <template v-else>
        <div class="order-info-row">
          <div class="order-info-label">单据编号</div>
          <div class="order-info-value">{{ orderInfo.orderCode }}</div>
        </div>
        <div class="order-info-row">
          <div class="order-info-label">材料名称</div>
          <div class="order-info-value">{{ orderInfo.materialName }}</div>
        </div>
        <div class="order-info-row">
          <div class="order-info-label">数量</div>
          <div class="order-info-value">{{ orderInfo.num }} {{ orderInfo.unit }}</div>
        </div>
        <div class="order-info-row">
          <div class="order-info-label">状态</div>
          <div class="order-info-value">{{ orderInfo.status }}</div>
        </div>
        <div class="order-info-row">
          <div class="order-info-label">出库时间</div>
          <div class="order-info-value">{{ orderInfo.createDate }}</div>
        </div>
        <div class="order-tip">返回列表后保持进入前的位置，不重新请求</div>
        <nut-button block type="primary" @click="goBack">back 返回列表</nut-button>
        <div class="order-nav-row">
          <nut-button size="small" @click="goBackByPush">push 到列表</nut-button>
          <nut-button size="small" @click="goBackByReplace">replace 到列表</nut-button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { RectLeft } from '@nutui/icons-vue'
import { fetchOrderDetail } from './order-mock'
import type { OrderItem } from './order-mock'

defineOptions({ name: 'OrderDetail' })

const route = useRoute()
const router = useRouter()

const isLoading = ref(true)
const orderInfo = ref<OrderItem>({
  id: 0,
  orderCode: '',
  materialName: '',
  num: 0,
  unit: '吨',
  status: '',
  createDate: ''
})

onMounted(async () => {
  const id = Number(route.params.id)
  orderInfo.value = await fetchOrderDetail(id)
  isLoading.value = false
})

const goBack = () => {
  router.back()
}

/** 演示：任意跳转方式到达列表，均从缓存恢复 */
const goBackByPush = () => {
  router.push({ path: '/order-list' })
}

const goBackByReplace = () => {
  router.replace({ path: '/order-list' })
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

  .order-header-space {
    width: 32px;
  }
}

.order-body {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.order-info-row {
  display: flex;
  background: #fff;
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 8px;

  .order-info-label {
    width: 90px;
    font-size: 14px;
    color: var(--nut-title-color2, #666);
    flex-shrink: 0;
  }

  .order-info-value {
    flex: 1;
    font-size: 14px;
    color: var(--nut-title-color, #1a1a1a);
    text-align: right;
  }
}

.order-tip {
  font-size: 12px;
  color: var(--nut-help-color, #999);
  text-align: center;
  margin: 12px 0;
}

.order-nav-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 12px;
}
</style>
