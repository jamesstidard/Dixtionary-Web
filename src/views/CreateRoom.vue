<template>
  <div class="create-room">
    <h1>Create Room</h1>
    <input placeholder="name" v-model="room.name">
    <input placeholder="password" v-model="room.password">
    <input placeholder="capacity" type="number" v-model="room.capacity">
    <button @click="back">Cancel</button>
    <button @click="createRoom">Create</button>
  </div>
</template>



<script>
import gql from 'graphql-tag'

const INSERT_ROOM = gql`
mutation insertRoom($name: String!, $capacity: Int!, $password: String) {
  insertRoom(name: $name, capacity: $capacity, password: $password) {
    uuid
  }
}`

export default {
  name: 'create-room',
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
    back () {
      window.history.length > 1
        ? this.$router.go(-1)
        : this.$router.push('/')
    },
    async createRoom () {
      try {
        const resp = await this.$apollo.mutate({
          mutation: INSERT_ROOM,
          variables: this.room,
        })
        const uuid =  resp.data.insertRoom.uuid
        this.$router.replace({name: 'room', params: {uuid}})
      }
      catch (error) {
        // Error
        console.error(error)
      }
    },
  },
}
</script>
