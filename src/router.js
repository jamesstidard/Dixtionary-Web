import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import SignIn from './views/SignIn.vue'
import CreateRoom from './views/CreateRoom.vue'
import Room from './views/Room.vue'
import store from './store'
import Chat from './components/Chat.vue'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/test',
      name: 'test',
      component: Chat,
    },
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
      path: '/room/:uuid',
      name: 'room',
      component: Room,
      props: true,
    },
  ],
})

router.beforeEach((to, from, next) => {
  if (!['home', 'sign-in', 'api'].includes(to.name) && !store.state.token) {
    next({
      name: 'sign-in',
      params: {
        next: {
          name: to.name,
          params: to.params,
          query: to.query
        },
      },
    })
  } else {
    next()
  }
})

export default router
