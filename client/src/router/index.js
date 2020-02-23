import Vue from 'vue'
import VueRouter from 'vue-router'

const AuthError = () => import('@/components/auth/AuthError')
const DashboardHome = () => import('@/components/dashboard/Home')
const Login = () => import('@/components/auth/Login')

Vue.use(VueRouter)

export default new VueRouter({
  mode: 'history',
  routes: getRoutes().map(r => ({
    path: r.path,
    component: r.component,
    props: r.props
  })),

  // scrollBehavior (to, from, savedPosition) {
  //   return { x: 0, y: 0 }
  // }
})

export function getRoutes() {
  return [
    {
      path: '/login',
      component: Login,
      title: 'Login/Create Account',
      subTitle: 'xrppay'
    },
    {
      path: '/autherror/:error',
      component: AuthError,
      props: true,
      title: 'Login/Create Account',
      subTitle: 'xrppay'
    },
    {
      path: '/*',
      component: DashboardHome,
      title: 'xrppay',
      subTitle: 'xrppay'
    }
  ]
}
