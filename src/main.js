import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import sanitizeHTML from 'sanitize-html';

import './main.scss'
import '../node_modules/bootstrap/dist/js/bootstrap.bundle.js'
import '../node_modules/bootstrap-icons/font/bootstrap-icons.css'
import '../node_modules/sortablejs/Sortable.min.js'

const app = createApp(App)
app.config.globalProperties.$sanitize = sanitizeHTML;
app.config.productionTip = false;

app.use(router).mount('#app')
