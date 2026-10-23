import { defineConfig } from 'vitest/config'

// 注：单测全部为 TS 内联组件，不导入 .vue 文件，无需 vue 插件
// （plugin-vue v6 基于 vite8/rolldown 类型，与 vitest 内置 vite7 类型不兼容）
export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['tests/unit/**/*.spec.ts'],
    css: false
  }
})
