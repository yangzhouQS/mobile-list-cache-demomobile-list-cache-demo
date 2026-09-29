<template>
  <view class="card">
    <nut-flex-box :item-num="flexConfig.length" :item-config="flexConfig">
      <template #item-1>
        <div class="card-title">采购量(吨)</div>
        <div class="card-num1">10,546.45</div>
      </template>
      <template #item-2>
        <nut-flex-box :isRow="isRow" :item-num="flexConfig1.length" :item-config="flexConfig1">
          <template #item-1>
            <div class="card-title">收料车次(次)</div>
            <div class="card-num2">8464</div>
          </template>
          <template #item-2>
            <div class="card-title">过磅数量(吨)</div>
            <div class="card-num2">10,000.45</div>
          </template>
          <template #item-3>
            <div class="card-title">过磅率(%)</div>
            <div class="card-num2">80.45</div>
          </template>
        </nut-flex-box>
      </template>
    </nut-flex-box>
  </view>
</template>

<script setup lang="ts">
import {reactive, ref} from 'vue'

const isRow = ref(true)

const flexConfig = reactive([
  {
    tag: 'item-1',
    isFixed: true,
    size: '50%',
    paddingSize: 'small',
    clearPadding: ['left', 'top', 'right']
  },
  {
    tag: 'item-2',
    isFixed: true,
    size: '50%',
    paddingSize: 'small',
    clearPadding: ['left', 'bottom', 'top', 'right']
  }
])
const flexConfig1 = reactive([
  {
    tag: 'item-1',
    isFixed: true,
    size: '35%',
    paddingSize: 'small',
    clearPadding: ['left', 'bottom', 'top']
  },
  {
    tag: 'item-2',
    isFixed: true,
    size: '35%',
    paddingSize: 'small',
    clearPadding: ['left', 'bottom', 'top']
  },
  {
    tag: 'item-3',
    isFixed: true,
    size: '30 %',
    paddingSize: 'small',
    clearPadding: ['left', 'bottom', 'top']
  }
])
</script>

<style scoped lang="less">
.card {
  height: 100%;
  width: 100%;

  .card-title {
    font-size: var(--nut-font-size-base);
    line-height: var(--nut-line-height-base);
    color: var(--nut-help-color);
    text-align: left;
  }

  .card-num1 {
    font-size: var(--nut-font-size-4);
    line-height: var(--nut-line-height-base);
    color: var(--nut-help-color);
    font-weight: 700;
    text-align: left;
  }

  .card-num2 {
    font-size: var(--nut-font-size-large);
    line-height: var(--nut-line-height-base);
    color: var(--nut-help-color);
    font-weight: 700;
    text-align: left;
  }
}

</style>
