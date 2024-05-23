import { createRouter, createWebHistory } from 'vue-router'
import Home from '../App.vue'
import adminDashboard from '../views/admin.vue'
import Login from '../views/login.vue'
import alumniDashboard from '../views/alumni.vue'
import yearbook from '../views/alumni-components/yearbook.vue'
import memento from '../views/alumni-components/memento.vue'
import contact from '../views/alumni-components/contact.vue'
import modDashboard from '../views/mod.vue'
import forgotPassword from '../views/forgot-password.vue'

const routes = [
  { path: '/', component: Home,  name: 'home', meta: { requiresAuth: true } },
  { path: '/adminDashboard', component: adminDashboard, name: 'adminDashboard' },
  { path: '/login', component: Login,  name: 'login' },
  { path: '/alumniDashboard', component: alumniDashboard, name: 'alumniDashboard' },
  { path: '/yearbook', component: yearbook, name: 'yearbook' },
  { path: '/memento', component: memento, name: 'memento' },
  { path: '/contact', component: contact, name: 'contact' },
  { path: '/modDashboard', component: modDashboard, name: 'modDashboard' },
  { path: '/forgotPassword', component: forgotPassword, name: 'forgotPassword' },
]

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated');
  if (to.matched.some(record => record.meta.requiresAuth) && !isAuthenticated) {
    next({ name: 'login' });
  } else {
    next();
  }
});

export default router