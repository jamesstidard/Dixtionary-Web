<style lang="stylus" scoped>

.create-room
  display flex
  align-items center
  flex-flow column

.forum
  display: flex
  align-items: center
  flex-flow: column
  max-width 400px

h1
  padding-top: 32px
  padding-bottom: 32px

.inputs
  display flex
  flex-flow row
  flex-wrap wrap


.inputs > *
  width 100%
  display flex
  align-items center


.inputs > * > label
  width 33%
  padding 8px
  text-align right


.inputs > * > input
  width 66%
  padding 8px


.actions
  display flex
  justify-content flex-end
  padding-top: 32px
  width 100%

.actions > button
  margin-left 4px
  margin-right 4px


</style>


<template lang="pug">

div.create-room
  span.forum
    span.header
      h1 Create Room

    span.inputs
      span
        label Name:
        input(v-model="room.name" v-focus)

      span
        label Capacity:
        input(type="number" min=2 max=8 step=1 v-model="room.capacity")

      span
        label Invite Only:
        toggle(v-model="room.inviteOnly")

    span.actions
      button(
        @click="back"
        @shortkey="back"
        v-shortkey.focus.once="['esc']"
      ) Cancel
      button.primary(
        @click="createRoom"
        @shortkey="createRoom"
        v-shortkey.focus.once="['enter']"
        :disabled="!valid"
      ) Create

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
  computed: {
    valid() {
      return Boolean(this.room.name)
    }
  },
  methods: {
    back () {
      window.history.length > 1
        ? this.$router.go(-1)
        : this.$router.push('/')
    },
    async createRoom () {
      if (!this.valid) {return}

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
