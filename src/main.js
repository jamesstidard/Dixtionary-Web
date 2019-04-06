import Vue from 'vue'
import App from './App.vue'
import { createProvider } from './vue-apollo'
import router from './router'
import store from './store'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faLockAlt } from '@fortawesome/pro-light-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(faLockAlt)

Vue.component('font-awesome-icon', FontAwesomeIcon)

Vue.config.productionTip = false

new Vue({
  apolloProvider: createProvider(),
  store,
  router,
  render: h => h(App),
  created() {
    const token = localStorage.getItem('auth-token')
    if (token !== null && token !== undefined) {
      this.$store.commit('TOKEN_INSERTED', token)
    }
  },
}).$mount('#app')
