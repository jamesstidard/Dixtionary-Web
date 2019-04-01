<template>
  <div class="home">
    <div v-for="room in rooms" :key="room.uuid">
      {{ room.uuid }} {{ room.name }}
    </div>
  </div>
</template>

<script>
import gql from 'graphql-tag'

const ROOM_QUERY = gql`{
  rooms {
    uuid
    name
  }
}`

const ROOM_INSERTED_SUBSCRIPTION = gql`subscription roomInserted {
  roomInserted {
    uuid
    name
  }
}`

const ROOM_UPDATED_SUBSCRIPTION = gql`subscription roomUpdated {
  roomUpdated {
    uuid
    name
  }
}`

const ROOM_DELETED_SUBSCRIPTION = gql`subscription roomDeleted {
  roomDeleted {
    uuid
  }
}`

export default {
  name: 'home',
  apollo: {
    rooms: {
      query: ROOM_QUERY,
      subscribeToMore: [
        {
          document: ROOM_INSERTED_SUBSCRIPTION,
          updateQuery: (previousResult, {subscriptionData: {data: {roomInserted: room}}}) => {
            console.log("INSERTING", room, 'INTO', previousResult)
            const rooms = previousResult === undefined ? [] : previousResult.rooms
            return {rooms: [...rooms, room]}
          },
        },
        {
          document: ROOM_UPDATED_SUBSCRIPTION,
          updateQuery: (previousResult, {subscriptionData: {data: {roomUpdated: room}}}) => {
            console.log("UPDAING", room, 'IN', previousResult)
            const rooms = previousResult === undefined ? [] : previousResult.rooms
            const index = rooms.findIndex(r => r.uuid == room.uuid, rooms)
            if (index !== -1) {
              rooms[index] = {...rooms[index], ...room}
              return {rooms: rooms}
            } else {
              return {rooms: [...rooms, room]}
            }
          },
        },
        // {
        //   document: ROOM_DELETED_SUBSCRIPTION,
        //   updateQuery: (previousResult, {subscriptionData: {data: {roomInserted: room}}}) => {
        //     const rooms = previousResult === undefined ? [] : previousResult.rooms
        //     return {rooms: [...rooms, room]}
        //   },
        // },
      ]
    }
  },
}
</script>
