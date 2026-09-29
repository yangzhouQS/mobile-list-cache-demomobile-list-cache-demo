const path = require('path')
const resolvePath = relativePath => path.resolve(process.cwd(), relativePath)
module.exports = {
  global: {
    cwd: __dirname,
    clear: ['dist'],
    copy: {
      'src/controllers/bootstrap.yml': 'dist/bootstrap.yml',
      'src/controllers/.henhouserc': 'dist/.henhouserc',
      'src/web-content/assets': 'dist/web-content/assets',
      'node_modules/vue/dist': 'dist/web-content/lib/vue',
      'node_modules/vue-router/dist': 'dist/web-content/lib/vue-router',
      'node_modules/lodash/lodash.min.js': 'dist/web-content/lib/lodash/lodash.min.js',
      'node_modules/axios/dist/axios.min.js': 'dist/web-content/lib/axios/axios.min.js',
      "node_modules/dayjs/dayjs.min.js": "dist/web-content/lib/dayjs/dayjs.min.js",
      'node_modules/decimal.js/decimal.js': 'dist/web-content/lib/decimal.js',
      'node_modules/@cs/nutui-pro/dist/nutui-pro.umd.js': 'dist/web-content/lib/@cs/nutui-pro/dist/nutui-pro.umd.js',
      'node_modules/@cs/nutui-pro/dist/style.css': 'dist/web-content/lib/@cs/nutui-pro/dist/style.css',
      'node_modules/@cs/nutui-pro/dist/themes/style.css': 'dist/web-content/lib/@cs/nutui-pro/dist/themes/style.css',
      'node_modules/@nutui/nutui/dist/nutui.umd.js': 'dist/web-content/lib/@nutui/nutui/dist/nutui.umd.js',
      'node_modules/@nutui/nutui/dist/nutui.js': 'dist/web-content/lib/@nutui/nutui/dist/nutui.js',
      'node_modules/@nutui/icons-vue/dist/': 'dist/web-content/lib/@nutui/icons-vue/dist',
      'node_modules/@cs/assembox-mobile/lib/': 'dist/web-content/lib/@cs/assembox-mobile/lib',
      'node_modules/@yearrow/vue3-portal-app-framework-library/dist/': 'dist/web-content/lib/@yearrow/vue3-portal-app-framework-library/dist',
    },
    eslint: {
      lint: false,
      option: {
        fix: false,
        exclude: 'node_modules'
      }
    },
    browserVue3: {
      rootOutPath: 'dist/web-content/',
      packerConfig: {
        resolve: {
          alias: {
            // '@': resolvePath('src')
          },
          extensions: ['.js', '.ts', '.json', '.jsx', '.vue', '.tsx']
        },
        externals: {
          vue: 'Vue',
          axios: 'axios',
          'vue-router': 'VueRouter',
          '@nutui/nutui':'nutui',
          '@cs/nutui-pro':'NutuiPro',
          // '@yearrow/vue3-portal-app-framework-library': 'WebAppFramework'
        }
      }
    },
    node: {
      rootOutPath: 'dist/',
      packerConfig: {
        resolve: {
          extensions: ['.js', '.ts']
        }
      }
    }
  },
  entries: {
    server: {
      type: 'node',
      input: 'src/controllers/index.js',
      output: {
        fileName: 'app',
        filePath: ''
      }
    },
    homePage: {
      type: 'browserVue3',
      title: "APP",
      input: 'src/web-content/index.ts',
    }
  }
}
