<template>
  <view class="card">
    <nut-flex-box :item-num="flexConfig.length" :item-config="flexConfig">
      <template #item-1>
        <nut-panel border background>

        </nut-panel>
      </template>
      <template #item-2>
        <nut-panel border background>

        </nut-panel>
      </template>
    </nut-flex-box>
  </view>
</template>

<script setup lang="ts">
import {reactive, ref} from 'vue'

const flexConfig = reactive([
  {
    tag: 'item-1',
    isFixed: true,
    size: '200px',
    paddingSize: 'small',
    clearPadding: ['left', 'top', 'right']
  },
  {
    tag: 'item-2',
    isFixed: true,
    size: '200px',
    paddingSize: 'small',
    clearPadding: ['left', 'bottom', 'top', 'right']
  }
])
</script>

<style scoped lang="less">


</style>