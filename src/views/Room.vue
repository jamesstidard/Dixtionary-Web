<template>
  <div v-if="$apolloData.loading == 0" class="room">
    <h1>{{ room.name }}</h1>

    <div class="tabletop">
      <div class="main">
        <Canvas>
        </Canvas>
      </div>
      <div class="aside">
        <h2>Scoreboard</h2>
        <Scoreboard
          v-bind:room="room">
        </Scoreboard>

        <h2>Chat</h2>
        <Chat
          v-bind:room="room">
        </Chat>
      </div>
    </div>

  </div>
</template>

<script>
import Vue from 'vue'
import gql from 'graphql-tag'
import Canvas from '../components/Canvas.vue'
import Chat from '../components/Chat.vue'
import Scoreboard from '../components/Scoreboard.vue'

const ROOM_QUERY = gql`
query room($uuid: String!) {
  rooms(uuids: [$uuid]) {
    uuid
    name
    password
    game {
      uuid
    }
    owner {
      uuid
    }
    members {
      uuid
    }
  }
}`

const JOIN_ROOM = gql`
subscription join($uuid: String!, $token: String!) {
  joinRoom(uuid: $uuid, token: $token)
}`

const ROOM_UPDATED_SUBSCRIPTION = gql`
subscription roomUpdated($uuid: String!) {
  roomUpdated(uuids: [$uuid]) {
    uuid
    name
    password
    owner
    members
    game
  }
}`

const ROOM_DELETED_SUBSCRIPTION = gql`
subscription roomDeleted($uuid: String!) {
  roomDeleted(uuids: [$uuid]) {
    uuid
  }
}`

export default {
  name: 'room',
  components: {
    Canvas,
    Chat,
    Scoreboard,
  },
  props: [
    'uuid',
  ],
  data() {
    return {
      joined: false,
      room: {},
    }
  },
  apollo: {
    $subscribe: {
      joined: {
        query: JOIN_ROOM,
        variables() {
          return {
            uuid: this.uuid,
            token: this.$store.state.token,
          }
        },
        result({data}) {
          this.joined = data.joinRoom
        },
        skip () {
          return this.$apolloData.loading !== 0
        }
      },
    },
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
      },
      subscribeToMore: [
        {
          document: ROOM_UPDATED_SUBSCRIPTION,
          variables() {
            return {
              uuid: this.uuid
            }
          },
          updateQuery: (previousResult, {subscriptionData: {data: {roomUpdated: room}}}) => {
            const rooms = previousResult === undefined ? [] : previousResult.rooms
            const index = rooms.findIndex(r => r.uuid == room.uuid, rooms)
            room.members = room.members.map(uuid => ({uuid, __typename: "User"}))
            room.owner = {uuid: room.owner, __typename: "User"}
            room.game = room.game ? {uuid: room.game, __typename: "Game"} : null
            if (index !== -1) {
              const newRoom = Object.assign({}, rooms[index], room)
              Vue.set(rooms, index, newRoom)
            } else {
              rooms.push(room)
            }
            return {rooms}
          },
        },
        {
          document: ROOM_DELETED_SUBSCRIPTION,
          variables() {
            return {
              uuid: this.uuid
            }
          },
          updateQuery: (previousResult, {subscriptionData: {data: {roomDeleted: room}}}) => {
            this.$router.push('/')
          },
        },
      ]
    }
  },
}
</script>

<style scoped>
.tabletop {
  display: flex;
  align-items: stretch;
  flex-wrap: wrap;
}

.main {
  flex-grow: 9;
  min-width: 350px;
}

.aside {
  flex-grow: 1;
  min-width: 350px;
}

</style>
