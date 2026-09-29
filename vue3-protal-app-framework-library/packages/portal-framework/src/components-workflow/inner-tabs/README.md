# Tabs 组件

简洁易用的移动端选项卡组件，使用 Vue3 TSX 语法编写。

## 功能特性

- ✅ 支持双向绑定 `v-model`
- ✅ 支持水平滚动
- ✅ 支持角标显示
- ✅ 支持禁用状态
- ✅ 支持自定义内容（字符串或函数）
- ✅ 支持自定义样式（颜色、字体大小等）
- ✅ 支持点击和切换事件
- ✅ 自动滚动到激活的 tab
- ✅ 平滑过渡动画
- ✅ 支持惰性渲染，提高性能

## 安装使用

```tsx
import { Tabs } from '@/components/tabs'
import type { TabPaneProps } from '@/components/tabs'
```

## 基础用法

```tsx
import { defineComponent, ref } from 'vue'
import { Tabs } from '@/components/tabs'
import type { TabPaneProps } from '@/components/tabs'

export default defineComponent({
  setup() {
    const activeIndex = ref(0)

    const tabs: TabPaneProps[] = [
      { title: '标签1', content: '内容1' },
      { title: '标签2', content: '内容2' },
      { title: '标签3', content: '内容3' }
    ]

    return () => (
      <Tabs
        v-model={activeIndex.value}
        list={tabs}
      />
    )
  }
})
```

## Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue | 当前激活的 tab 索引 | `number` | `0` |
| list | tab 列表 | `TabPaneProps[]` | `[]` |
| scrollable | 是否可滚动 | `boolean` | `true` |
| bottomLine | 是否显示底部边框 | `boolean` | `true` |
| activeColor | 激活时的颜色 | `string` | `#fa2c19` |
| inactiveColor | 未激活时的颜色 | `string` | `#979797` |
| fontSize | 字体大小 | `string` | `14px` |
| fontWeight | 是否加粗 | `boolean` | `true` |
| lazy | 是否惰性渲染（只渲染当前激活的 tab） | `boolean` | `false` |

## TabPaneProps

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| key | tab 的唯一标识 | `string \| number` | - |
| title | tab 的标题 | `string` | - |
| content | tab 的内容（字符串） | `string` | - |
| slot | tab 的内容（函数返回 VNode） | `() => any` | - |
| disabled | 是否禁用 | `boolean` | `false` |
| badge | 角标数字 | `number \| string` | - |

## Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | 当前激活的 tab 索引改变时触发 | `value: number` |
| change | tab 切换时触发 | `{ index, item }` |
| click | tab 点击时触发 | `{ index, item }` |

## 使用示例

### 带角标

```tsx
const tabs: TabPaneProps[] = [
  { title: '消息', content: '消息内容', badge: 5 },
  { title: '通知', content: '通知内容', badge: '99+' },
  { title: '我的', content: '我的内容' }
]

<Tabs v-model={activeIndex.value} list={tabs} />
```

### 禁用状态

```tsx
const tabs: TabPaneProps[] = [
  { title: '标签1', content: '内容1' },
  { title: '标签2', content: '内容2', disabled: true },
  { title: '标签3', content: '内容3' }
]

<Tabs v-model={activeIndex.value} list={tabs} />
```

### 自定义内容

```tsx
const tabs: TabPaneProps[] = [
  {
    title: '列表',
    slot: () => (
      <div>
        <div>列表项1</div>
        <div>列表项2</div>
        <div>列表项3</div>
      </div>
    )
  },
  {
    title: '卡片',
    slot: () => (
      <div style="display: flex; gap: 10px;">
        <div style="flex: 1; background: #f5f5f5; padding: 10px;">卡片1</div>
        <div style="flex: 1; background: #f5f5f5; padding: 10px;">卡片2</div>
      </div>
    )
  }
]

<Tabs v-model={activeIndex.value} list={tabs} />
```

### 自定义样式

```tsx
const tabs: TabPaneProps[] = [
  { title: '首页', content: '首页内容' },
  { title: '分类', content: '分类内容' },
  { title: '购物车', content: '购物车内容' },
  { title: '我的', content: '我的内容' }
]

<Tabs
  v-model={activeIndex.value}
  list={tabs}
  activeColor="#1989fa"
  inactiveColor="#646566"
  fontSize="13px"
  activeFontSize="15px"
  fontWeight={false}
/>
```

### 监听事件

```tsx
const handleChange = (params: any) => {
  console.log('Tab 切换:', params)
}

const handleClick = (params: any) => {
  console.log('Tab 点击:', params)
}

<Tabs
  v-model={activeIndex.value}
  list={tabs}
  onChange={handleChange}
  onClick={handleClick}
/>
```

### 不可滚动

```tsx
<Tabs
  v-model={activeIndex.value}
  list={tabs}
  scrollable={false}
/>
```

### 无底部边框

```tsx
<Tabs
  v-model={activeIndex.value}
  list={tabs}
  bottomLine={false}
/>
```

### 惰性渲染

```tsx
<Tabs
  v-model={activeIndex.value}
  list={tabs}
  lazy={true}
/>
```

当 `lazy` 为 `true` 时，组件只会渲染当前激活的 tab 内容，可以显著提高性能，特别是当 tab 内容包含复杂组件或大量数据时。已访问过的 tab 会被缓存，切换回来时不会重新渲染。

## 完整示例

查看 [`demo.tsx`](./demo.tsx) 文件获取更多使用示例。
