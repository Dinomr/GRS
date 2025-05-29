import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/views/Home.vue';
import AdminGames from '@/views/AdminGames.vue';
import Login from '@/views/Login.vue';
import Cart from '@/views/Cart.vue';
import Transactions from '@/views/Transactions.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/admin/games',
    name: 'AdminGames',
    component: AdminGames,
    meta: { requiresAdmin: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/cart',
    name: 'Cart',
    component: Cart,
    meta: { requiresAuth: true }
  },
  {
    path: '/transactions',
    name: 'Transactions',
    component: Transactions,
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Protección de rutas
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  if (to.matched.some(record => record.meta.requiresAdmin)) {
    if (!token || !user?.is_admin) {
      next('/login');
      return;
    }
  }

  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!token) {
      next('/login');
      return;
    }
  }

  next();
});

export default router;