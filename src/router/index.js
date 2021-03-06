import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Users from '../components/Users.vue'
import Roles from '../components/rights/Roles.vue'
import Rights from '../components/rights/Rights.vue'
import Goods from '../components/goods/Goods.vue'
import Params from '../components/goods/Params.vue'
import Categories from '../components/goods/Categories.vue'
import Add from '../components/goods/Add.vue'
import Orders from '../components/orders/Orders.vue'
import Repots from '../components/reports/Repots.vue'
Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home', component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: Users },
      { path: '/roles', component: Roles },
      { path: '/rights', component: Rights },
      {
        path: '/goods', component: Goods
      },
      { path: '/params', component: Params },
      { path: '/categories', component: Categories },
      { path: '/orders', component: Orders },
      { path: '/reports', component: Repots },
      { path: '/goods/add', component: Add }
    ]
  }
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
