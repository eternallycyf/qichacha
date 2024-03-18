import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Antd from 'ant-design-vue'
import Vant from 'vant'
import 'ant-design-vue/dist/antd.css'
import 'vant/lib/index.css'

import './assets/main.css'

const app = createApp(App)

app.use(router)

app.use(store)

app.use(Antd)

app.use(Vant)

app.mount('#app')
