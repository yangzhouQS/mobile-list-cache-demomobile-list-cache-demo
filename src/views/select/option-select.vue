<template>
  <div class="select-page">
    <div class="select-header">
      <div class="select-header-icon" @click="goBack">
        <RectLeft></RectLeft>
      </div>
      <div class="select-header-title">{{ title }}</div>
      <div class="select-header-space"></div>
    </div>

    <div class="select-body">
      <div v-if="isLoading" class="select-tip">加载中...</div>
      <div
        v-for="option in optionList"
        :key="option.code"
        class="select-option"
        @click="handleSelect(option)"
      >
        <div class="select-option-name">{{ option.name }}</div>
        <div class="select-option-code">{{ option.code }}</div>
      </div>
      <div v-if="!isLoading && optionList.length === 0" class="select-tip">无可选项</div>
      <div class="select-abandon" @click="abandonAll">放弃新增，返回列表</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { RectLeft } from '@nutui/icons-vue'
import { setPendingSelection } from '../../utils/selection-holder'
import { fetchSelectOptions, SELECT_TYPE_TITLE_MAP } from '../order/order-mock'
import type { OptionItem } from '../order/order-mock'

defineOptions({ name: 'OptionSelect' })

const route = useRoute()
const router = useRouter()

const type = computed(() => String(route.params.type))
const title = computed(() => SELECT_TYPE_TITLE_MAP[type.value] ?? '选择')

const isLoading = ref(true)
const optionList = ref<OptionItem[]>([])

onMounted(async () => {
  optionList.value = await fetchSelectOptions(type.value)
  isLoading.value = false
})

/** 选中后暂存数据并返回上一页（出栈），表单页 onActivated 中消费 */
const handleSelect = (option: OptionItem) => {
  setPendingSelection(type.value, option)
  router.back()
}

/**
 * 跨层放弃：从选择页直接回到列表（越过新增页）。
 * router.go(-2) 一次出栈两层，vue-page-stack 按栈深度正确恢复列表缓存；
 * 未打刷新标记 -> 列表不刷新、保持位置
 */
const abandonAll = () => {
  router.go(-2)
}

const goBack = () => {
  router.back()
}
</script>

<style scoped lang="less">
.select-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--nut-bg-color-page, #f5f6f7);
}

.select-header {
  display: flex;
  align-items: center;
  height: 44px;
  padding: 0 12px;
  flex-shrink: 0;
  color: #fff;
  background: var(--nut-primary-color, #165dff);

  .select-header-icon {
    font-size: 18px;
    width: 32px;
  }

  .select-header-title {
    flex: 1;
    font-size: 16px;
    font-weight: 700;
  }

  .select-header-space {
    width: 32px;
  }
}

.select-body {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.select-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-radius: 8px;
  padding: 14px 12px;
  margin-bottom: 10px;

  .select-option-name {
    font-size: 15px;
    color: var(--nut-title-color, #1a1a1a);
  }

  .select-option-code {
    font-size: 12px;
    color: var(--nut-help-color, #999);
  }
}

.select-tip {
  text-align: center;
  font-size: 13px;
  color: var(--nut-help-color, #999);
  padding: 16px 0;
}

.select-abandon {
  text-align: center;
  font-size: 13px;
  color: var(--nut-danger-color, #fa2c19);
  padding: 12px 0;
}
</style>
