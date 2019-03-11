<template>
  <div class="hello">
    <input v-model="name" placeholder="name...">
    <button @click="login">sign in</button>
  </div>
</template>

<script>
import gql from 'graphql-tag'

export default {
  name: 'HelloWorld',
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
        // Update the cache with the result
        // The query will be updated with the optimistic response
        // and then with the real result of the mutation
        update: (store, { data: { Login } }) => {
          console.log(store, data)
          // Read the data from our cache for this query.
          // const data = store.readQuery({ query: TAGS_QUERY })
          // // Add our tag from the mutation to the end
          // data.tags.push(addTag)
          // // Write our data back to the cache.
          // store.writeQuery({ query: TAGS_QUERY, data })
        },
      }).then((data) => {
        // Result
        console.log(data)
      }).catch((error) => {
        // Error
        console.error(error)
      })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
