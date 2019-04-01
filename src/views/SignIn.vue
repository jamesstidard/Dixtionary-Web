<template>
  <div class="sign-in">
    <input v-model="name" placeholder="name...">
    <button @click="login">sign in</button>
  </div>
</template>

<script>
import gql from 'graphql-tag'

export default {
  name: 'sign-in',
  apollo: {
    rooms: gql`{
      rooms{
        uuid,
        name
      }
    }`,
  },
  data() {
    return {
      name: '',
      error: '',
    }
  },
  methods: {
    login() {
      this.$apollo.mutate({
        mutation: gql`mutation ($name: String!) {
          login(name: $name) {
            token
          }
        }`,
        variables: {
          name: this.name,
        },
      }).then(({data: {login: {token}}}) => {
        this.$store.commit('TOKEN_INSERTED', token)
      }).catch((error) => {
        this.error = error
      })
    }
  }
}
</script>
