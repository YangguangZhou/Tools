import { createApp } from 'vue';
import App from './App.vue';
import router from './router'; // 确保导入路由配置

/* FontAwesome 图标 */
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';

/* 添加图标到库 */
library.add(fas, far, fab);

/* 创建并挂载应用 */
const app = createApp(App);
app.component('font-awesome-icon', FontAwesomeIcon);
app.use(router); // 使用路由
app.mount('#app');
