/// <reference types="vitest" />
import { defineConfig } from "vite";
import autoprefixer from "autoprefixer";
import path from "path";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  plugins: [vue(), vueJsx()],
  css: {
    preprocessorOptions: {
      scss: {
        // example : additionalData: `@import "./src/design/styles/variables";`
        // dont need include file extend .scss
        additionalData: `@import "./src/styles/variables-yearrow.scss";`
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
    target: "es2015",
    outDir: "dist",
    cssCodeSplit: false,
    cssTarget: ["chrome61"],
    rollupOptions: {
      external: ["vue", "vue-router", "axios", "@nutui/nutui", "@cs/assembox-mobile"],
      output: {
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
    }
  } /*,
  test: {
    globals: true,
    environment: "happy-dom",
    coverage: {
      all: false,
      provider: "v8"
    },
    include: ["src/!**!/!*.(test|spec).(ts|tsx)"],
    reporters: ["default", "html"]
  }*/
});
