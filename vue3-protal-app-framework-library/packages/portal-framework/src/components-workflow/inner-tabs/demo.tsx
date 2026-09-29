import { defineComponent, ref, reactive } from "vue";
import { InnerTabs } from "./inner-tabs";
import type { TabPaneProps } from "./types";

/**
 * Tabs 组件使用示例
 */
export const TabsDemo = defineComponent({
  name: "TabsDemo",
  setup() {
    const activeIndex = ref(0);
    const state = reactive({
      val1: 1,
      val2: 2,
      val3: 3
    });

    // 基础用法
    const basicTabs: TabPaneProps[] = [
      { title: "标签1", content: "内容1" },
      { title: "标签2", content: "内容2" },
      { title: "标签3", content: "内容3" }
    ];

    // 带角标
    const badgeTabs: TabPaneProps[] = [
      { title: "消息", content: "消息内容", badge: 5 },
      { title: "通知", content: "通知内容", badge: "99+" },
      { title: "我的", content: "我的内容" }
    ];

    // 禁用状态
    const disabledTabs: TabPaneProps[] = [
      { title: "标签1测试的传递", content: "内容1" },
      { title: "标签2", content: "内容2", disabled: true },
      { title: "标签3", content: "内容3" }
    ];

    // 自定义内容
    const customTabs: TabPaneProps[] = [
      {
        title: "列表",
        slot: () => (
          <div>
            <div>列表项1</div>
            <div>列表项2</div>
            <div>列表项3</div>
            <input type="text" v-model={state.val1} />
          </div>
        )
      },
      {
        title: "卡片",
        slot: () => (
          <div style="display: flex; gap: 10px;">
            <input type="text" v-model={state.val2} />
            <div style="flex: 1; background: #f5f5f5; padding: 10px;">卡片1</div>
            <div style="flex: 1; background: #f5f5f5; padding: 10px;">卡片2</div>
          </div>
        )
      },
      {
        title: "表单",
        slot: () => (
          <div>
            <input type="text" v-model={state.val3} />
            <div style="margin-bottom: 10px;">
              <label>用户名：</label>
              <input type="text" placeholder="请输入用户名" />
            </div>
            <div>
              <label>密码：</label>
              <input type="password" placeholder="请输入密码" />
            </div>
          </div>
        )
      }
    ];

    // 自定义样式
    const customStyleTabs: TabPaneProps[] = [
      { title: "首页", content: "首页内容" },
      { title: "分类", content: "分类内容" },
      { title: "购物车", content: "购物车内容" },
      { title: "我的", content: "我的内容" }
    ];

    const handleChange = (params: any) => {
      console.log("Tab 切换:", params);
    };

    const handleClick = (params: any) => {
      console.log("Tab 点击:", params);
    };

    return () => (
      <div style="padding: 16px;">
        {/* 基础用法 */}
        <div style="margin-bottom: 32px;">
          <h3>基础用法</h3>
          <InnerTabs v-model={activeIndex.value} list={basicTabs} onChange={handleChange} onClick={handleClick} />
        </div>

        {/* 带角标 */}
        <div style="margin-bottom: 32px;">
          <h3>带角标</h3>
          <InnerTabs v-model={activeIndex.value} list={badgeTabs} />
        </div>

        {/* 禁用状态 */}
        <div style="margin-bottom: 32px;">
          <h3>禁用状态</h3>
          <InnerTabs v-model={activeIndex.value} list={disabledTabs} />
        </div>

        {/* 自定义内容 */}
        <div style="margin-bottom: 32px;">
          <h3>自定义内容</h3>
          <InnerTabs v-model={activeIndex.value} list={customTabs} />
        </div>

        {/* 自定义样式 */}
        <div style="margin-bottom: 32px;">
          <h3>自定义样式</h3>
          <InnerTabs
            v-model={activeIndex.value}
            list={customStyleTabs}
            activeColor="#1989fa"
            inactiveColor="#646566"
            fontSize="13px"
            fontWeight={false}
          />
        </div>

        {/* 不可滚动 */}
        <div style="margin-bottom: 32px;">
          <h3>不可滚动</h3>
          <InnerTabs v-model={activeIndex.value} list={basicTabs} scrollable={false} />
        </div>

        {/* 无底部边框 */}
        <div style="margin-bottom: 32px;">
          <h3>无底部边框</h3>
          <InnerTabs v-model={activeIndex.value} list={basicTabs} bottomLine={false} />
        </div>
      </div>
    );
  }
});

export default TabsDemo;
