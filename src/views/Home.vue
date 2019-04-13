<template>
  <div class="home">
    <button @click="createRoom">Create Room</button>

    <div v-for="room in rooms" :key="room.uuid" @click="join(room)">
      {{ room.name }} <font-awesome-icon v-if="room.password" :icon="['fal', 'lock-alt']" />
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import gql from 'graphql-tag'

const ROOM_QUERY = gql`
query selectRoom {
  rooms {
    uuid
    name
    password
  }
}`

const ROOM_INSERTED_SUBSCRIPTION = gql`
subscription roomInserted {
  roomInserted {
    uuid
    name
    password
  }
}`

const ROOM_UPDATED_SUBSCRIPTION = gql`
subscription roomUpdated {
  roomUpdated {
    uuid
    name
    password
  }
}`

const ROOM_DELETED_SUBSCRIPTION = gql`
subscription roomDeleted {
  roomDeleted {
    uuid
  }
}`

export default {
  name: 'home',
  data() {
    return {
      rooms: [],
    }
  },
  methods: {
    createRoom () {
      this.$router.push('/create-room')
    },
    join(room) {
      this.$router.push({name: 'room', params: {uuid: room.uuid}})
    },
  },
  apollo: {
    rooms: {
      query: ROOM_QUERY,
      subscribeToMore: [
        {
          document: ROOM_INSERTED_SUBSCRIPTION,
          updateQuery: (previousResult, {subscriptionData: {data: {roomInserted: room}}}) => {
            const rooms = previousResult === undefined ? [] : previousResult.rooms
            return {rooms: [...rooms, room]}
          },
        },
        {
          document: ROOM_UPDATED_SUBSCRIPTION,
          updateQuery: (previousResult, {subscriptionData: {data: {roomUpdated: room}}}) => {
            const rooms = previousResult === undefined ? [] : previousResult.rooms
            const index = rooms.findIndex(r => r.uuid == room.uuid, rooms)
            if (index !== -1) {
              const newRoom = Object.assign({}, rooms[index], room)
              Vue.set(rooms, index, newRoom)
            } else {
              rooms.push(room)
            }
          },
        },
        {
          document: ROOM_DELETED_SUBSCRIPTION,
          updateQuery: (previousResult, {subscriptionData: {data: {roomDeleted: room}}}) => {
            const rooms = previousResult === undefined ? [] : previousResult.rooms
            const index = rooms.findIndex(r => r.uuid == room.uuid, rooms)
            Vue.delete(rooms, index)
          },
        },
      ]
    }
  },
}
</script>
