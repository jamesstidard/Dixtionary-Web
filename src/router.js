import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import SignIn from './views/SignIn.vue'
import CreateRoom from './views/CreateRoom.vue'
import Room from './views/Room.vue'
import store from './store'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/sign-in',
      name: 'sign-in',
      component: SignIn,
    },
    {
      path: '/create-room',
      name: 'create-room',
      component: CreateRoom,
    },
    {
      path: '/room',
      name: 'room',
      component: Room,
    },
  ],
})

router.beforeEach((to, from, next) => {
  if (!['home', 'sign-in'].includes(to.name) && !store.state.token) {
    next({
      name: 'sign-in',
      params: {
        next: to.name,
      },
    })
  } else {
    next()
  }
})

export default router
