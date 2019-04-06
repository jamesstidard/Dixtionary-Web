<template>
  <div class="create-room">
    <h1>Create Room</h1>
    <input placeholder="name" v-model="room.name">
    <input placeholder="password" v-model="room.password">
    <input placeholder="capacity" type="number" v-model="room.capacity">
    <button @click="goBack">Cancel</button>
    <button @click="createRoom">Create</button>
  </div>
</template>



<script>
import Vue from 'vue'
import gql from 'graphql-tag'

const INSERT_ROOM = gql`mutation insertRoom($name: String!, $capacity: Int!, $password: String) {
  insertRoom(name: $name, capacity: $capacity, password: $password) {
    uuid
  }
}`

export default {
  name: 'home',
  data() {
    return {
      room: {
        name: '',
        password: '',
        capacity: 8,
      },
    }
  },
  methods: {
    goBack () {
      window.history.length > 1
        ? this.$router.go(-1)
        : this.$router.push('/')
    },
    createRoom () {
      this.$apollo.mutate({
        mutation: INSERT_ROOM,
        variables: this.room,
      }).then((data) => {
        // Result
        this.$router.push('/room')
      }).catch((error) => {
        // Error
        console.error(error)
      })
    },
  },
}
</script>
