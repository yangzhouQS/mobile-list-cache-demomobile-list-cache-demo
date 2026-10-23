import { createApp } from 'vue'
import NutUI from '@nutui/nutui'
import '@nutui/nutui/dist/style.css'
import App from './app.vue'
import { router } from './router'
import './styles/global.css'

const app = createApp(App)

app.use(router)
app.use(NutUI)

app.mount('#app')
