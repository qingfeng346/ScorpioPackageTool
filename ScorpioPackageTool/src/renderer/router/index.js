import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'main-page',
      component: require('@/components/IndexPage').default
    },
    {
      path: '/test',
      name: 'test-page',
      component: require('@/components/Test/TestPage').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
