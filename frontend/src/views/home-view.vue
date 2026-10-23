<template>
  <div class="home-page">
    <div class="home-title">移动端列表缓存演示</div>
    <div class="home-sub">vue3 + vue-router + PageCache（路由级长期缓存）</div>

    <div class="home-scenarios">
      <div class="home-scenario">
        <div class="home-scenario-title">场景一：列表缓存</div>
        <div class="home-scenario-desc">滚动列表到任意位置，进入详情/编辑后返回，列表不重新请求，恢复到进入前的滚动位置</div>
      </div>
      <div class="home-scenario">
        <div class="home-scenario-title">场景二：新增后自动刷新</div>
        <div class="home-scenario-desc">新增单据保存后返回列表，列表重新请求数据并回到顶部</div>
      </div>
      <div class="home-scenario">
        <div class="home-scenario-title">场景三：编辑返回策略可配置</div>
        <div class="home-scenario-desc">编辑页默认返回保持位置；可通过开关指定保存后刷新列表</div>
      </div>
      <div class="home-scenario">
        <div class="home-scenario-title">场景四：三级路由 + TSX</div>
        <div class="home-scenario-desc">库存模块为嵌套路由（布局 + 二级列表 + 三级详情/编辑），全部页面用 TSX 开发，列表由布局内嵌套 PageCache 缓存</div>
      </div>
    </div>

    <nut-button block type="primary" size="large" @click="goOrderList">进入订单列表</nut-button>
    <nut-button block size="large" class="home-gap" @click="goStockList">进入库存模块（三级路由 TSX）</nut-button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

defineOptions({ name: 'HomeView' })

const router = useRouter()

const goOrderList = () => {
  router.push({ path: '/order-list' })
}

const goStockList = () => {
  router.push({ path: '/stock/list' })
}
</script>

<style scoped lang="less">
.home-page {
  height: 100%;
  padding: 24px 16px;
  background: #f5f6f7;
  display: flex;
  flex-direction: column;

  .home-title {
    font-size: 20px;
    font-weight: 700;
    color: #1a1a1a;
    text-align: center;
  }

  .home-sub {
    font-size: 13px;
    color: #999;
    text-align: center;
    margin: 6px 0 20px;
  }

  .home-scenarios {
    flex: 1;
  }

  .home-gap {
    margin-top: 12px;
  }

  .home-scenario {
    background: #fff;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 12px;

    .home-scenario-title {
      font-size: 15px;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 4px;
    }

    .home-scenario-desc {
      font-size: 13px;
      color: #666;
      line-height: 20px;
    }
  }
}
</style>
