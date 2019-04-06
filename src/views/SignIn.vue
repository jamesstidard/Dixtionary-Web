<template>
  <div class="sign-in">
    <input v-model="name" placeholder="name">
    <button :disabled="!name" @click="login">sign in</button>
  </div>
</template>

<script>
import gql from 'graphql-tag'
import { onLogin} from '@/vue-apollo'
// import { onLogin } from 'src/vue-apollo'

const LOGIN = gql`mutation ($name: String!) {
  login(name: $name) {
    token
  }
}`

export default {
  name: 'sign-in',
  data() {
    return {
      name: '',
      error: '',
    }
  },
  methods: {
    async login() {
      try {
        const resp = await this.$apollo.mutate({
          mutation: LOGIN,
          variables: {
            name: this.name,
          },
        })
        const token =  resp.data.login.token
        await onLogin(this.$apolloProvider.defaultClient, token)
        this.$store.commit('TOKEN_INSERTED', token)
        if (this.$route.params.next !== undefined && this.$route.params.next !== null) {
          this.$router.replace({name: this.$route.params.next})
        } else {
          this.$router.replace('/')
        }
      }
      catch(error) {
        this.error = error
      }
    }
  }
}
</script>
