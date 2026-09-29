<template>
  <view>
    <nut-flex-box :item-num="flexConfig.length" :item-config="flexConfig" class="container">
    <template #item-1>
      <div style="height:100%;background: var(--nut-button-primary-background-color, linear-gradient(135deg, var(--nut-primary-color, var(--nut-primary-color, #165dff)) 0%, var(--nut-primary-color, var(--nut-primary-color, #165dff)) 100%));">
        <div class="page-title">物资采购-统计类名称</div>
      </div>
    </template>
    <template #item-2>
        <nut-flex-box :isRow="isRow" :item-num="flexConfig1.length" :item-config="flexConfig1" style="width:100%;height:100%">
          <template #item-1>
            <div class="page-select" @click="dataFilter">
              统计周期 <RectDown></RectDown>
            </div>
          </template>
          <template #item-2>
            <div class="page-select" @click="materialFilter">
              材料筛选 <RectDown></RectDown>
            </div>
          </template>
          <template #item-3>
            <div class="page-select" @click="cityFilter">
              自定义筛选 <RectDown></RectDown>
            </div>
          </template>
        </nut-flex-box>
    </template>
    <template #item-3>
      <nut-box border style="background: var(--nut-button-primary-background-color, linear-gradient(135deg, var(--nut-primary-color, var(--nut-primary-color, #165dff)) 0%, var(--nut-primary-color, var(--nut-primary-color, #165dff)) 100%));">
        <Card></Card>
      </nut-box>
    </template>
    <template #item-4>
        <List></List>
    </template>
  </nut-flex-box>
  <nut-calendar
    v-model:visible="showTop"
    :default-value="date"
    type="range"
    start-date="2019-12-22"
    end-date="2021-01-08"
    @close="showTop = false"
    @choose="choose"
    @select="select"
  >
  </nut-calendar>
  <nut-popup v-model:visible="show" round position="bottom">
    <nut-picker v-model="val"  :columns="columns" title="材料选择" @confirm="confirm" @cancel="cancel"/>
  </nut-popup>
  <nut-popup v-model:visible="showCity" round position="bottom">
    <nut-picker v-model="cityValue" :columns="cityColumns" title="城市选择" @confirm="cityConfirm" @cancel="cityCancel"/>
  </nut-popup>
  </view>
</template>

<script setup lang="ts">

import './index.less'

import Card from '../card/card.vue'
import List from '../list/list.vue'
import { $http } from "@yearrow/vue3-portal-app-framework-library";
import { RectDown } from '@nutui/icons-vue'

import { onMounted, reactive, ref } from 'vue'

const showTop = ref(false)

const show = ref(false)

const isRow = ref(true)

const showCity = ref(false)

const cityValue = ref(['Beijing', 'Daxing', 'Jinghai'])

const cityColumns = ref([
  {
    text: '江苏',
    value: 'Jiangsu',
    children: [
      {
        text: '南京',
        value: 'Nanjing',
        children: [
          { text: '栖霞区', value: 'Qixia' },
          { text: '鼓楼区', value: 'Gulou' }
        ]
      },
      {
        text: '苏州',
        value: 'Suzhou',
        children: [
          { text: '姑苏区', value: 'Gusu' },
          { text: '吴江区', value: 'Wujiang' }
        ]
      }
    ]
  },
  {
    text: '北京',
    value: 'Beijing',
    children: [
      {
        text: '大兴',
        value: 'Daxing',
        children: [
          { text: '经海路', value: 'Jinghai' },
          { text: '科创路', value: 'Kechuang' }
        ]
      },
      {
        text: '海淀',
        value: 'Haidian',
        children: [
          { text: '中关村', value: 'Zhongguancun' },
          { text: '苏州桥', value: 'Suzhouqiao' }
        ]
      }
    ]
  }
])

const val = ref()

const flexConfig = reactive([
  {
    tag: 'item-1',
    isFixed: true,
    size: '40px',
    paddingSize: 'large',
    clearPadding: ['bottom','left','top','right']
  },
  {
    tag: 'item-2',
    isFixed: true,
    size: '40px',
    paddingSize: 'large',
    clearPadding: ['bottom','left','top','right']
  },
  {
    tag: 'item-3',
    isFixed: true,
    size: '210px',
    paddingSize: 'large',
    clearPadding: []
  },
  {
    tag: 'item-4',
    isFixed: false,
    size: '',
    paddingSize: 'large',
    clearPadding: ['top']
  }
])

const flexConfig1 = reactive([
  {
    tag: 'item-1',
    isFixed: true,
    size: '33.3%',
    paddingSize: 'large',
    clearPadding: ['bottom','left','top','right']
  },
  {
    tag: 'item-2',
    isFixed: true,
    size: '33.3%',
    paddingSize: 'large',
    clearPadding: ['bottom','left','top','right']
  },
  {
    tag: 'item-3',
    isFixed: true,
    size: '33.3%',
    paddingSize: 'large',
    clearPadding: ['bottom','left','top','right']
  }
])

const columns = ref([
  { text: '钢筋', value: '2232' },
  { text: '混凝土', value: '3243' },
  { text: '外加剂', value: '223' },
  { text: '水', value: '11' },
  { text: 'C20', value: '232' },
  { text: 'Hp1022', value: '232' },
  { text: 'C30', value: '232' }
])

const dataFilter = () => {
  showTop.value = true
}

onMounted(() => {
  $http.get('user-mobile-portal').then((data: any) => {
    console.log(data)
  })
})

const date = ref(['2019-12-23', '2019-12-26'])

const choose = (param) => {
  date.value = [param[0][3], param[1][3]]
}

const select = (param) => {
  console.log(param)
}

const materialFilter = () => {
  show.value = true
}

const confirm = ({ selectedValue, selectedOptions }) => {
  console.log(selectedValue[0], selectedOptions[0])
  show.value = false
}

const cityConfirm = ({ selectedValue, selectedOptions }) => {
  console.log(selectedValue[0], selectedOptions[0])
  showCity.value = false
}

const cancel = () => {
  show.value = false
}

const cityCancel = () => {
  showCity.value = false
}

const cityFilter = () => {
  showCity.value = true
}

</script>
