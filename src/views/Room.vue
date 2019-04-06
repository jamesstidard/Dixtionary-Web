<template>
  <div v-if="$apolloData.loading == 0" class="room">
    <h1>Room {{ room.name }}</h1>
    <Canvas></Canvas>
    <h2>Members</h2>
    <div v-for="member in room.members" :key="member.uuid">
      <font-awesome-icon
        v-if="member.uuid === room.owner.uuid"
        :icon="['fal', 'crown']" />
      {{ member.name }}
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import gql from 'graphql-tag'
import Canvas from '../components/Canvas.vue'

const ROOM_QUERY = gql`query room($uuid: String!) {
  rooms(uuids: [$uuid]) {
    uuid
    name
    password
    owner {
      uuid
    }
    members {
      uuid
      name
    }
  }
}`

const ROOM_INSERTED_SUBSCRIPTION = gql`subscription roomInserted {
  roomInserted {
    uuid
    name
    password
  }
}`

const ROOM_UPDATED_SUBSCRIPTION = gql`subscription roomUpdated {
  roomUpdated {
    uuid
    name
    password
  }
}`

const ROOM_DELETED_SUBSCRIPTION = gql`subscription roomDeleted {
  roomDeleted {
    uuid
  }
}`

export default {
  name: 'room',
  components: {
    Canvas,
  },
  props: [
    'uuid',
  ],
  data() {
    return {
      room: {},
    }
  },
  apollo: {
    room: {
      query: ROOM_QUERY,
      variables() {
        return {
          uuid: this.uuid
        }
      },
      deep: true,
      update(data) {
        return data.rooms[0]
      }
      // subscribeToMore: [
      //   {
      //     document: ROOM_INSERTED_SUBSCRIPTION,
      //     updateQuery: (previousResult, {subscriptionData: {data: {roomInserted: room}}}) => {
      //       const rooms = previousResult === undefined ? [] : previousResult.rooms
      //       return {rooms: [...rooms, room]}
      //     },
      //   },
      //   {
      //     document: ROOM_UPDATED_SUBSCRIPTION,
      //     updateQuery: (previousResult, {subscriptionData: {data: {roomUpdated: room}}}) => {
      //       const rooms = previousResult === undefined ? [] : previousResult.rooms
      //       const index = rooms.findIndex(r => r.uuid == room.uuid, rooms)
      //       if (index !== -1) {
      //         const newRoom = Object.assign({}, rooms[index], room)
      //         Vue.set(rooms, index, newRoom)
      //       } else {
      //         rooms.push(room)
      //       }
      //     },
      //   },
      //   {
      //     document: ROOM_DELETED_SUBSCRIPTION,
      //     updateQuery: (previousResult, {subscriptionData: {data: {roomDeleted: room}}}) => {
      //       const rooms = previousResult === undefined ? [] : previousResult.rooms
      //       const index = rooms.findIndex(r => r.uuid == room.uuid, rooms)
      //       Vue.delete(rooms, index)
      //     },
      //   },
      // ]
    }
  },
}
</script>
