import Vue from 'vue'
import App from './App.vue'
import { createProvider } from './vue-apollo'
import router from './router'
import store from './store'
import focus from './directives/focus'
import toggle from './components/Toggle'

// import { library } from '@fortawesome/fontawesome-svg-core'
// import { faLockAlt, faCrown, faUserCrown, faUser } from '@fortawesome/pro-light-svg-icons'
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// library.add(faLockAlt, faCrown, faUserCrown, faUser)

// Vue.component('font-awesome-icon', FontAwesomeIcon)
Vue.use(require('vue-shortkey'))

Vue.component('toggle', toggle)
Vue.directive('focus', focus)

Vue.config.productionTip = false

new Vue({
  apolloProvider: createProvider(),
  store,
  router,
  render: h => h(App),
}).$mount('#app')
