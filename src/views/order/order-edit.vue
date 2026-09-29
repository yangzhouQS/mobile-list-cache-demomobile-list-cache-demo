<template>
  <div class="order-page">
    <div class="order-header">
      <div class="order-header-icon" @click="goBack">
        <RectLeft></RectLeft>
      </div>
      <div class="order-header-title">编辑订单</div>
      <div class="order-header-space"></div>
    </div>

    <div class="order-body">
      <div class="order-field">
        <div class="order-field-label">单据编号</div>
        <div class="order-field-value">{{ orderInfo.orderCode }}</div>
      </div>
      <div class="order-field">
        <div class="order-field-label">材料名称</div>
        <input v-model="formData.materialName" class="order-field-input" placeholder="请输入材料名称" />
      </div>
      <div class="order-field">
        <div class="order-field-label">数量（吨）</div>
        <input v-model="formData.num" class="order-field-input" type="digit" placeholder="请输入数量" />
      </div>

      <div class="order-switch-row">
        <div class="order-switch-label">保存后刷新列表</div>
        <nut-switch v-model="isRefreshOnBack"></nut-switch>
      </div>
      <div class="order-tip">
        默认关闭：返回列表保持进入前的位置；开启后保存返回时列表重新请求
      </div>

      <nut-button block type="primary" :loading="isSaving" @click="handleSave">保存并返回</nut-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { RectLeft } from '@nutui/icons-vue'
import { backToList } from '../../utils/list-keep-alive'
import { fetchOrderDetail } from './order-mock'
import type { OrderItem } from './order-mock'

defineOptions({ name: 'OrderEdit' })

const route = useRoute()
const router = useRouter()

const isSaving = ref(false)

/** 演示"返回列表是否刷新"可配置：编辑默认保持位置不刷新 */
const isRefreshOnBack = ref(false)

const orderInfo = ref<OrderItem>({
  id: 0,
  orderCode: '',
  materialName: '',
  num: 0,
  unit: '吨',
  status: '',
  createDate: ''
})

const formData = reactive({
  materialName: '',
  num: ''
})

onMounted(async () => {
  const id = Number(route.params.id)
  orderInfo.value = await fetchOrderDetail(id)
  formData.materialName = orderInfo.value.materialName
  formData.num = String(orderInfo.value.num)
})

const handleSave = async () => {
  if (!formData.materialName) {
    return
  }
  isSaving.value = true
  try {
    // TODO: 调用保存接口
    await new Promise((resolve) => setTimeout(resolve, 500))
    backToList(router, { listKey: 'order-list', refresh: isRefreshOnBack.value })
  } finally {
    isSaving.value = false
  }
}

const goBack = () => {
  router.back()
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

.order-field {
  background: #fff;
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 12px;

  .order-field-label {
    font-size: 13px;
    color: var(--nut-title-color2, #666);
    margin-bottom: 6px;
  }

  .order-field-value {
    font-size: 14px;
    color: var(--nut-help-color, #999);
  }

  .order-field-input {
    width: 100%;
    height: 30px;
    border: none;
    outline: none;
    font-size: 15px;
    color: var(--nut-title-color, #1a1a1a);
  }
}

.order-switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;

  .order-switch-label {
    font-size: 14px;
    color: var(--nut-title-color, #1a1a1a);
  }
}

.order-tip {
  font-size: 12px;
  color: var(--nut-help-color, #999);
  margin-bottom: 16px;
}
</style>
