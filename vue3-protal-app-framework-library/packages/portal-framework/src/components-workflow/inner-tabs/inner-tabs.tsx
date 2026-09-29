import { defineComponent, nextTick, ref, watch } from "vue";
import { TabPaneProps } from "./types";
import "./tabs.less";

export const InnerTabs = defineComponent({
  name: "Tabs",
  props: {
    // 当前激活的 tab 索引
    modelValue: {
      type: Number,
      default: 0
    },
    // tab 列表
    list: {
      type: Array as () => TabPaneProps[],
      default: () => []
    },
    // 是否可滚动
    scrollable: {
      type: Boolean,
      default: true
    },
    // 是否显示底部边框
    bottomLine: {
      type: Boolean,
      default: true
    },
    // 激活时的颜色
    activeColor: {
      type: String,
      default: ""
    },
    // 未激活时的颜色
    inactiveColor: {
      type: String,
      default: "#979797"
    },
    // 字体大小（统一字体大小，避免抖动）
    fontSize: {
      type: String,
      default: "14px"
    },
    // 是否加粗
    fontWeight: {
      type: Boolean,
      default: true
    },
    // 是否惰性渲染（只渲染当前激活的 tab）
    lazy: {
      type: Boolean,
      default: true
    }
  },
  emits: ["update:modelValue", "change", "click"],
  setup(props, { emit }) {
    const activeIndex = ref(props.modelValue);
    const tabsRef = ref<HTMLElement | null>(null);
    const isAnimating = ref(false);
    // 记录已经渲染过的 tab 索引
    const renderedIndices = ref<Set<number>>(new Set([props.modelValue]));

    // 监听 modelValue 变化
    watch(
      () => props.modelValue,
      val => {
        activeIndex.value = val;
      }
    );

    // 处理 tab 点击
    const handleTabClick = (index: number, item: TabPaneProps) => {
      if (item.disabled || isAnimating.value) return;

      emit("click", { index, item });
      if (activeIndex.value !== index) {
        isAnimating.value = true;
        activeIndex.value = index;
        emit("update:modelValue", index);
        emit("change", { index, item });

        // 记录已渲染的 tab 索引
        if (props.lazy) {
          renderedIndices.value.add(index);
        }

        // 动画结束后重置状态
        setTimeout(() => {
          isAnimating.value = false;
        }, 300);
      }
    };

    // 滚动到激活的 tab
    const scrollToActiveTab = () => {
      if (!tabsRef.value) return;

      const tabs = tabsRef.value.children;
      const activeTab = tabs[activeIndex.value] as HTMLElement;
      if (!activeTab) return;

      const containerWidth = tabsRef.value.offsetWidth;
      const tabLeft = activeTab.offsetLeft;
      const tabWidth = activeTab.offsetWidth;

      // 使用 nextTick 确保 DOM 更新后再滚动
      nextTick(() => {
        if (tabsRef.value) {
          tabsRef.value.scrollTo({
            left: tabLeft - (containerWidth - tabWidth) / 2,
            behavior: "auto" // 改为 auto 避免平滑滚动导致的抖动
          });
        }
      });
    };

    // 监听 activeIndex 变化，滚动到激活的 tab
    watch(activeIndex, () => {
      scrollToActiveTab();
    });

    return () => {
      return (
        <div class="inner-tabs-container">
          {/* Tab 头部 */}
          <div
            class={[
              "inner-tabs-header",
              {
                "inner-tabs-header--scrollable": props.scrollable,
                "inner-tabs-header--bottom-line": props.bottomLine
              }
            ]}
            ref={tabsRef}
          >
            {props.list.map((item, index) => {
              const isActive = index === activeIndex.value;
              return (
                <div
                  key={item.key || index}
                  data-active-index={activeIndex.value}
                  data-index={index}
                  class={[
                    "inner-tabs-item",
                    {
                      "inner-tabs-item--active": isActive,
                      "inner-tabs-item--disabled": item.disabled
                    }
                  ]}
                  style={{
                    color: isActive ? props.activeColor : props.inactiveColor,
                    fontSize: props.fontSize, // 统一字体大小
                    fontWeight: isActive && props.fontWeight ? "bold" : "normal"
                  }}
                  onClick={() => handleTabClick(index, item)}
                >
                  {item.title}
                  {item.badge !== undefined && item.badge !== null && <span class="inner-tabs-item__badge">{item.badge}</span>}
                </div>
              );
            })}
          </div>

          {/* Tab 内容 */}
          <div class="inner-tabs-content">
            {props.list.map((item, index) => {
              const isActive = index === activeIndex.value;
              // 惰性渲染：只渲染当前激活的 tab 或已经渲染过的 tab
              const shouldRender = !props.lazy || renderedIndices.value.has(index);
              return (
                <div
                  key={item.key || index}
                  data-key={item.key || index}
                  class={[
                    "inner-tabs-pane",
                    {
                      "inner-tabs-pane--active": isActive
                    }
                  ]}
                  style={{
                    display: shouldRender ? (isActive ? "block" : "none") : "none"
                  }}
                >
                  {shouldRender && (item.content || item.slot?.())}
                </div>
              );
            })}
          </div>
        </div>
      );
    };
  }
});

export default InnerTabs;
