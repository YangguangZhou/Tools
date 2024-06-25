import { createRouter, createWebHistory } from 'vue-router';
import Home from '../App.vue';
import Admin from '../Admin.vue'; // 确保导入Admin组件

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/admin',
    name: 'Admin',
    component: Admin
  }
];

const router = createRouter({
  routes
});

export default router;
