<template>
  <view>
    <nut-flex-box :item-num="flexConfig.length" :item-config="flexConfig" class="details">
      <template #item-1>
        <div style="height:100%;background: var(--nut-button-primary-background-color, linear-gradient(135deg, var(--nut-primary-color, var(--nut-primary-color, #165dff)) 0%, var(--nut-primary-color, var(--nut-primary-color, #165dff)) 100%));display:flex">
          <div class="page-icon">
            <RectLeft @click="goBack"></RectLeft>
          </div>
          <div class="page-title">明细详情</div>
        </div>
      </template>
      <template #item-2>
         <div style="height:100%;background: var(--nut-button-primary-background-color, linear-gradient(135deg, var(--nut-primary-color, var(--nut-primary-color, #165dff)) 0%, var(--nut-primary-color, var(--nut-primary-color, #165dff)) 100%));">
          <nut-box paddingSize="small">
            <nut-row>
              <nut-col :span="24">
                <nut-flex-line :left-padding="true" :right-padding="true" :right-clear-padding="['left','top','bottom']" :left-clear-padding="['left','top','bottom','right']" left-width="80px">
                  <div class="font-style">组织机构</div>
                  <template #right>
                      <nut-ellipsis direction="end" :content="itemDetails.orgName" class="font-style"></nut-ellipsis>
                  </template>
                </nut-flex-line>
              </nut-col>
            </nut-row>
            <nut-row>
              <nut-col :span="24">
                <nut-flex-line :left-padding="true" :right-padding="true" :right-clear-padding="['left','top','bottom']" :left-clear-padding="['left','top','bottom','right']" left-width="80px">
                  <div class="font-style">关联单据</div>
                  <template #right>
                      <nut-ellipsis direction="end" :content="itemDetails.orderCode" class="font-style"></nut-ellipsis>
                  </template>
                </nut-flex-line>
              </nut-col>
            </nut-row>
            <nut-row>
              <nut-col :span="24">
                <nut-flex-line :left-padding="true" :right-padding="true" :right-clear-padding="['left','top','bottom']" :left-clear-padding="['left','top','bottom','right']" left-width="80px">
                  <div class="font-style">用料单位</div>
                  <template #right>
                      <nut-ellipsis direction="end" :content="itemDetails.teamName" class="font-style"></nut-ellipsis>
                  </template>
                </nut-flex-line>
              </nut-col>
            </nut-row>
             <nut-row>
              <nut-col :span="24">
                <nut-flex-line :left-padding="true" :right-padding="true" :right-clear-padding="['left','top','bottom']" :left-clear-padding="['left','top','bottom','right']" left-width="80px">
                  <div class="font-style">使用部位</div>
                  <template #right>
                      <nut-ellipsis direction="end" :content="itemDetails.ghName" class="font-style"></nut-ellipsis>
                  </template>
                </nut-flex-line>
              </nut-col>
            </nut-row>
             <nut-row>
              <nut-col :span="24">
                <nut-flex-line :left-padding="true" :right-padding="true" :right-clear-padding="['left','top','bottom']" :left-clear-padding="['left','top','bottom','right']" left-width="80px">
                  <div class="font-style">出库时间</div>
                  <template #right>
                      <nut-ellipsis direction="end" :content="itemDetails.exitDate" class="font-style"></nut-ellipsis>
                  </template>
                </nut-flex-line>
              </nut-col>
            </nut-row>
          </nut-box>
        </div>
      </template>
      <template #item-3>
        <nut-tabs v-model="value" class="details-tab">
          <nut-tab-pane title="单据详情" pane-key="1" class="tab-item"><MaterialDetails></MaterialDetails></nut-tab-pane>
          <nut-tab-pane title="材料信息" pane-key="2" class="tab-item"><div></div></nut-tab-pane>
          <nut-tab-pane title="其他信息" pane-key="3" class="tab-item"><div></div></nut-tab-pane>
        </nut-tabs>
      </template>
    </nut-flex-box>
  </view>
</template>

<script setup lang="ts">
import {reactive, ref} from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
import { RectLeft } from '@nutui/icons-vue'
// import { router } from '@/web-content/router'
import MaterialDetails from './material-details.vue'

const isRow = ref( true )

const value = ref('1')

const itemDetails = ref({
  orgName:'梁渊博普通测试项目部',
  orderCode:'GKSQD-2024060005',
  teamName:'梁渊博测试1#拌合站',
  ghName:'K62+967左幅层层圭大桥|桩基|0-0',
  exitDate:'2024-06-14 16:14:00'
})

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
    size: '150',
    paddingSize: 'large',
    clearPadding: ['bottom','left','top','right']
  },
  {
    tag: 'item-3',
    isFixed: false,
    paddingSize: 'large',
    clearPadding: ['bottom','left','top','right']
  },
])

const goBack = () => {
  router.push({
    path:'/'
  })
}

</script>

<style scoped lang="less">
.details {
  height: 100%;
  width: 100%;
  background: var(--nut-bg-color-page);
  .page-title {
      font-size: var(--nut-font-size-4);
      line-height: 2;
      color:  var(--nut-help-color);
      font-weight: 700;
      width: 68%;
      // text-align: center;
  }
  .page-icon {
    font-size: var(--nut-font-size-4);
    line-height: 2;
    color: var(--nut-title-color);
    width: 45%;
    margin-left: 10px;
  }
  .font-style {
    font-size: var(--nut-font-size-base);
    line-height: var(--nut-line-height-base);
    color: var(--nut-help-color);
  }
  .details-tab {
    width: 100%;
    .tab-item{
      width: 100%;
      height: 600px;
      padding: var(--nut-padding-large);
    }
  }
}

</style>
