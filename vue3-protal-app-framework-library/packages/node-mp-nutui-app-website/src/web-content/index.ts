import App from './app.vue'
import './styles'
import { CreateAppFramework } from '@yearrow/vue3-portal-app-framework-library'
import '@yearrow/vue3-portal-app-framework-library/dist/style.css'

import { IconFont } from '@nutui/icons-vue'
import '@nutui/icons-vue/dist/style_iconfont.css'
import { VuePageStackPlugin } from 'vue-page-stack'
import { routes } from './router'

const app = new CreateAppFramework({
  routes,
  rootComponent: App
})

app.use(IconFont)
app.use(VuePageStackPlugin, { router: app.router })

app.mount('#app')

