<style lang="stylus" scoped>

.create-room
  display: flex
  align-items: stretch
  flex-flow: column
  height: 100vh

h1
  padding-top: 32px
  padding-bottom: 32px


.actions
  padding-top: 32px

</style>


<template lang="pug">

div.create-room

  h1 Create Room

  span
    label Room Name:
    input(placeholder="name" v-model="room.name" v-focus)

  span
    label Capacity:
    input(placeholder="capacity" type="number" v-model="room.capacity")

  span
    label Invite Only:
    input(type="checkbox" v-model="room.inviteOnly")

  span.actions
    button(@click="back") Cancel
    button(@click="createRoom") Create

</template>



<script>
import gql from 'graphql-tag'

const INSERT_ROOM = gql`
mutation insertRoom($name: String!, $capacity: Int!, $inviteOnly: Boolean) {
  insertRoom(name: $name, capacity: $capacity, inviteOnly: $inviteOnly) {
    uuid
    inviteCode
  }
}`

export default {
  name: 'create-room',
  data() {
    return {
      room: {
        name: '',
        inviteOnly: false,
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
        const uuid = resp.data.insertRoom.uuid
        const next = {
          name: 'room',
          params: {uuid},
          query: {},
        }

        const inviteCode = resp.data.insertRoom.inviteCode
        if (inviteCode) {
          next.query['inviteCode'] = inviteCode
        }

        this.$router.replace(next)
      }
      catch (error) {
        // Error
        console.error(error)
      }
    },
  },
}
</script>
