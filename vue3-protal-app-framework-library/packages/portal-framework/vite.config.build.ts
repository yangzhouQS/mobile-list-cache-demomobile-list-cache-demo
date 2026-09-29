import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import autoprefixer from "autoprefixer";
import pkg from "./package.json";
import { visualizer } from "rollup-plugin-visualizer";
import { optimizeLodashImports } from "@optimize-lodash/rollup-plugin";

const name = "@yearrow/vue3-portal-app-framework-library";
const banner = `/**
 * ${name} v${pkg.version}
 * (c) ${new Date().getFullYear()} ${pkg.author}
 * @license ${pkg.license}
 */
`;

export default defineConfig({
  define: {
    __VUE_PROD_DEVTOOLS__: JSON.stringify("false"),
    "process.env.NODE_ENV": JSON.stringify("production")
  },
  plugins: [vue(), vueJsx(), visualizer(), optimizeLodashImports()],
  resolve: {
    // alias: [{ find: '@', replacement: path.resolve(__dirname, './src') }]
  },
  css: {
    preprocessorOptions: {
      scss: {
        // example : additionalData: `@import "./src/design/styles/variables";`
        // dont need include file extend .scss
        // additionalData: `@import "@/packages/styles/variables.scss";`
        // additionalData: `@import "./src/styles/variables-yearrow.scss";`
      }
    },
    postcss: {
      plugins: [
        autoprefixer({
          overrideBrowserslist: ["> 0.5%", "last 2 versions", "ie > 11", "iOS >= 10", "Android >= 5"]
        })
      ]
    }
  },
  build: {
    minify: true,
    target: "es2018",
    sourcemap: true,
    rollupOptions: {
      // 请确保外部化那些你的库中不需要的依赖
      external: ["vue", "vue-router", "axios", "@nutui/nutui", "@cs/assembox-mobile"],
      output: {
        banner,
        // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {
          axios: "axios",
          vue: "Vue",
          "vue-router": "VueRouter",
          "@nutui/nutui": "nutui",
          "@cs/assembox-mobile": "AssemboxMobile"
        },
        exports: "named",
        plugins: []
      }
    },
    lib: {
      // vue3-web-framework-library
      name: "WebAppFramework",
      entry: "src/index.ts",
      fileName: type => {
        if (type === "iife") {
          return "web-app-framework.iife.js";
        }
        return type === "umd" ? "web-app-framework.umd.js" : "web-app-framework.js";
      },
      formats: ["umd", "es", "iife"]
    }
  }
});
