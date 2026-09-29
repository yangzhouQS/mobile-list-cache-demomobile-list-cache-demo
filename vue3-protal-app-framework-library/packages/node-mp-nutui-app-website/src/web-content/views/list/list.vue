<template>
  <view class="demo-list">
    <nut-list :list-data="data">
      <template #default="{ item  }">
        <nut-panel :title="item.materialName" :show-header="true" border height="40%" style="margin-bottom:16px">
          <template #tool>
            <nut-flex-line :left-padding="true" :right-padding="true" left-width="100px">
              <template #right>
                <nut-space @click="getDetails">
                  <div style="color:#8a8f97">查看明细</div>
                  <MoreS></MoreS>
                </nut-space>
              </template>
            </nut-flex-line>
          </template>
          <nut-flex-box :isRow="isRow" :item-num="flexConfig.length" :item-config="flexConfig">
            <template #item-1>
              <div class="card-num2">{{ item.carNum }}</div>
              <div class="card-title">收料车次(次)</div>
            </template>
            <template #item-2>
              <div class="card-num2">{{ item.buyNum }}</div>
              <div class="card-title">采购数量(吨)</div>
            </template>
            <template #item-3>
              <div class="card-num2">{{ item.rate }}</div>
              <div class="card-title">过磅率(%)</div>
            </template>
          </nut-flex-box>
        </nut-panel>
      </template>
    </nut-list>
  </view>
</template>

<script setup lang="ts">
import {ref, onMounted, reactive} from 'vue'
import {MoreS} from '@nutui/icons-vue'
// import { router } from '@/web-content/router'
import { useRouter } from 'vue-router'
const router = useRouter()

const isRow = ref(true)

const data = ref([
  {
    materialName: '河沙-中粗-吨',
    carNum: 546,
    buyNum: 46.45,
    rate: 16.45
  },
  {
    materialName: '河沙-细-吨',
    carNum: 546,
    buyNum: 46.45,
    rate: 16.45
  },
  {
    materialName: '河沙-细-吨',
    carNum: 546,
    buyNum: 46.45,
    rate: 16.45
  },
  {
    materialName: '机制沙-细-吨',
    carNum: 546,
    buyNum: 46.45,
    rate: 16.45
  },
  {
    materialName: '机制沙-细-吨',
    carNum: 546,
    buyNum: 46.45,
    rate: 16.45
  },
  {
    materialName: '机制沙-细-吨',
    carNum: 546,
    buyNum: 46.45,
    rate: 16.45
  },
  {
    materialName: '河沙-中粗-吨',
    carNum: 546,
    buyNum: 46.45,
    rate: 16.45
  },
  {
    materialName: '河沙粗-吨',
    carNum: 546,
    buyNum: 46.45,
    rate: 16.45
  },
  {
    materialName: '河沙-吨',
    carNum: 546,
    buyNum: 46.45,
    rate: 16.45
  },
])

const flexConfig = reactive([
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
    size: '30%',
    paddingSize: 'small',
    clearPadding: ['left', 'bottom', 'top']
  }
])

onMounted(() => {
  // data.value = data.value.map((_: number, index: number) => index + 1)
})

const getDetails = () => {
  router.push({
    path:'/details',
    query: {
      title: '详情'
    }
  })
}

</script>

<style scoped lang="less">
.demo-list .list-item {
}

.card-title {
  font-size: var(--nut-font-size-base);
  line-height: var(--nut-line-height-base);
  color: var(--nut-title-color2);
  text-align: center;
}

.card-num2 {
  font-size: var(--nut-font-size-large);
  line-height: var(--nut-line-height-base);
  font-weight: 700;
  color: var(--nut-title-color);
  text-align: center;
}
</style>
