<template>
  <div class="order-page">
    <div class="order-header">
      <div class="order-header-icon" @click="goBack">
        <RectLeft></RectLeft>
      </div>
      <div class="order-header-title">新增订单</div>
      <div class="order-header-space"></div>
    </div>

    <div class="order-body">
      <div class="order-field" @click="goSelect('material')">
        <div class="order-field-label">材料名称</div>
        <div class="order-field-select">
          <span :class="formData.material ? 'order-field-value-active' : 'order-field-value'">
            {{ formData.material ? formData.material.name : '去选择' }}
          </span>
          <RectRight></RectRight>
        </div>
      </div>

      <div class="order-field" @click="goSelect('supplier')">
        <div class="order-field-label">供应商</div>
        <div class="order-field-select">
          <span :class="formData.supplier ? 'order-field-value-active' : 'order-field-value'">
            {{ formData.supplier ? formData.supplier.name : '去选择' }}
          </span>
          <RectRight></RectRight>
        </div>
      </div>

      <div class="order-field" @click="goSelect('staff')">
        <div class="order-field-label">领料工号</div>
        <div class="order-field-select">
          <span :class="formData.staff ? 'order-field-value-active' : 'order-field-value'">
            {{ formData.staff ? `${formData.staff.name}（${formData.staff.code}）` : '去选择' }}
          </span>
          <RectRight></RectRight>
        </div>
      </div>

      <div class="order-field">
        <div class="order-field-label">数量（吨）</div>
        <input v-model="formData.num" class="order-field-input" type="digit" placeholder="请输入数量" />
      </div>

      <div class="order-tip">
        从选择页返回本页：表单已填内容不丢失；
        头部返回取消新增：列表不刷新、保持原位置；
        保存返回：列表跳过缓存全新渲染（PageCache 硬刷新）
      </div>

      <nut-button block type="primary" :loading="isSaving" @click="handleSave">保存并返回</nut-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onActivated, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { RectLeft, RectRight } from '@nutui/icons-vue'
import { backToList } from '../../utils/list-keep-alive'
import {
  clearPendingSelection,
  ORDER_ADD_FORM_SNAPSHOT_KEY,
  setPendingSelection,
  takePendingSelection
} from '../../utils/selection-holder'
import { createOrder } from '../../api/order'
import type { OptionItem } from '../../api/order'

defineOptions({ name: 'OrderAdd' })

const router = useRouter()

const isSaving = ref(false)

const formData = reactive({
  material: null as OptionItem | null,
  supplier: null as OptionItem | null,
  staff: null as OptionItem | null,
  num: ''
})

interface AddFormSnapshot {
  material: OptionItem | null
  supplier: OptionItem | null
  staff: OptionItem | null
  num: string
}

/**
 * 消费选择页暂存的数据（缓存激活 / 重新挂载两种到达方式都覆盖）：
 * 先恢复"跳去选择页前"的表单快照（本页未缓存，返回即重新挂载、实例重建，
 * 不恢复快照则多轮选择时先前字段依次丢失），再叠加本轮选择页写入的新值
 */
const consumeSelections = () => {
  const snapshot = takePendingSelection<AddFormSnapshot>(ORDER_ADD_FORM_SNAPSHOT_KEY)
  if (snapshot) {
    formData.material = snapshot.material
    formData.supplier = snapshot.supplier
    formData.staff = snapshot.staff
    formData.num = snapshot.num
  }
  const material = takePendingSelection<OptionItem>('material')
  if (material) {
    formData.material = material
  }
  const supplier = takePendingSelection<OptionItem>('supplier')
  if (supplier) {
    formData.supplier = supplier
  }
  const staff = takePendingSelection<OptionItem>('staff')
  if (staff) {
    formData.staff = staff
  }
}

/**
 * 本页未加入 PageCache 缓存名单，从选择页返回时会重新挂载：
 * onMounted 消费选择结果；若加入缓存名单则由 onActivated 消费（缓存激活路径）
 */
onMounted(consumeSelections)
onActivated(consumeSelections)

const goSelect = (type: string) => {
  // 跳选择页前快照整个表单：返回重新挂载时由 consumeSelections 恢复
  setPendingSelection(ORDER_ADD_FORM_SNAPSHOT_KEY, { ...formData })
  router.push({ path: `/select/${type}` })
}

const handleSave = async () => {
  if (!formData.material) {
    return
  }
  isSaving.value = true
  try {
    await createOrder({
      materialName: formData.material.name,
      num: Number(formData.num) || 0,
      supplierName: formData.supplier?.name,
      staffCode: formData.staff?.code,
      staffName: formData.staff?.name
    })
    // 新增成功：返回列表并跳过页面缓存（全新渲染、回到顶部）
    backToList(router, { listKey: 'order-list', routePath: '/order-list', refresh: 'hard' })} finally {
    isSaving.value = false
  }
}

/** 取消新增：直接返回，不打刷新标记 -> 列表不刷新、保持进入前位置 */
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

  .order-field-input {
    width: 100%;
    height: 30px;
    border: none;
    outline: none;
    font-size: 15px;
    color: var(--nut-title-color, #1a1a1a);
  }

  .order-field-select {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 24px;
    color: var(--nut-help-color, #999);
  }

  .order-field-value-active {
    font-size: 15px;
    color: var(--nut-title-color, #1a1a1a);
  }

  .order-field-value {
    font-size: 14px;
    color: var(--nut-help-color, #999);
  }
}

.order-tip {
  font-size: 12px;
  color: var(--nut-help-color, #999);
  margin-bottom: 16px;
  line-height: 18px;
}
</style>
