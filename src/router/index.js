import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/home', component: Home }
]

const router = new VueRouter({
  routes
})
// 挂载路由导航守卫 除了登录页 均需登录之后才能访问
router.beforeEach((to, from, next) => {
  /* 
  to 表示将要访问的路径
  from从哪个路径来
  next 是一个函数，表示放行
  */
  if (to.path === '/login') return next()
  const token = window.sessionStorage.getItem('token')
  if (!token) return next('/login')
  next()
})

export default router
