<template>
  <div v-if="!$apolloData.queries.room.loading" class="room">
    <div
      class="header">
      <h1>{{ room.name }}</h1>
      <h2
        v-if="currentRound && currentTurn">
        Round: {{ rounds.length }},
        Turn: {{ currentRound.turns.length }},
        Timeout: {{ currentTurn.remaining }}
        <span v-if="currentTurn.choice">{{currentTurn.choice}}</span>
      </h2>
    </div>

    <span
      class="chooser"
      v-if="
        currentTurn &&
        currentTurn.choice === null &&
        currentTurn.artist.uuid === me.uuid"
    >
      Choose:
      <button
        v-for="choice in currentTurn.choices"
        :key="choice"
        @click="choose(currentTurn.uuid, choice)"
      >
        {{choice}}
      </button>
    </span>

    <div class="tabletop">
      <div class="main">
        <Canvas
          v-if="currentTurn && currentTurn.choice && currentTurn.artist.uuid == me.uuid"
          v-bind:turn="currentTurn">
        </Canvas>
        <Preview
          v-else-if="currentTurn"
          v-bind:artwork="currentTurn.artwork">
        </Preview>
        <div
          v-else-if="game && game.complete">
          Game Over.
        </div>
        <div
          v-else-if="room.members.length === 1">
          Waiting for other players...
        </div>
      </div>
      <div class="aside">
        <span class="scoreboard">
          <Scoreboard
            v-bind:room="room">
          </Scoreboard>
        </span>
        <span class="chat">
          <Chat
            v-bind:room="room">
          </Chat>
        </span>
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
import Preview from '../components/Preview.vue'

const ROOM_QUERY = gql`
query room($uuid: String!) {
  rooms(uuids: [$uuid]) {
    uuid
    name
    inviteOnly
    inviteCode
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
subscription join($uuid: String!, $token: String!, $inviteCode: String) {
  joinRoom(uuid: $uuid, token: $token, inviteCode: $inviteCode)
}`

const ROOM_UPDATED_SUBSCRIPTION = gql`
subscription roomUpdated($uuid: String!) {
  roomUpdated(uuids: [$uuid]) {
    uuid
    name
    inviteOnly
    inviteCode
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

const GAME_QUERY = gql`
query games($uuid: String!) {
  games(uuids: [$uuid]) {
    uuid
    complete
    rounds {
      uuid
    }
  }
}`


const GAME_UPDATED_SUBSCRIPTION = gql`
subscription gameUpdated($uuid: String!) {
  gameUpdated(uuids: [$uuid]) {
    uuid
    complete
    rounds
  }
}`


const GAME_DELETED_SUBSCRIPTION = gql`
subscription gameDeleted($uuid: String!) {
  gameDeleted(uuids: [$uuid]) {
    uuid
  }
}`


const ROUND_QUERY = gql`
query rounds($uuids: [String!]) {
  rounds(uuids: $uuids) {
    uuid
    turns {
      uuid
    }
  }
}`


const ROUND_UPDATED_SUBSCRIPTION = gql`
subscription roundUpdated($uuid: [String!]) {
  roundUpdated(uuids: $uuid) {
    uuid
    turns
  }
}`


const ROUND_DELETED_SUBSCRIPTION = gql`
subscription roundDeleted($uuid: [String!]) {
  roundDeleted(uuids: $uuid) {
    uuid
  }
}`


const TURN_QUERY = gql`
query turns($uuids: [String!]) {
  turns(uuids: $uuids) {
    uuid
    choices
    choice
    artist {
      uuid
    }
    remaining
    artwork
  }
}`


const UPDATE_TURN = gql`
mutation updateTurns($uuid: String!, $choice: String) {
  updateTurn(uuid: $uuid, choice: $choice) {
    uuid
  }
}`


const TURN_UPDATED_SUBSCRIPTION = gql`
subscription turnUpdated($token: String!, $uuids: [String!]) {
  turnUpdated(token: $token, uuids: $uuids) {
    uuid
    choices
    choice
    artist
    remaining
    artwork
  }
}`

const TURN_DELETED_SUBSCRIPTION = gql`
subscription turnDeleted($uuid: [String!]) {
  turnDeleted(uuids: $uuid) {
    uuid
  }
}`


export default {
  name: 'room',
  components: {
    Canvas,
    Chat,
    Scoreboard,
    Preview,
  },
  props: [
    'uuid',
  ],
  data() {
    return {
      joined: false,
      room: {},
      games: [],
      rounds: [],
      turns: [],
    }
  },
  methods: {
    async choose(uuid, choice) {
      try {
        const resp = await this.$apollo.mutate({
          mutation: UPDATE_TURN,
          variables: {
            uuid,
            choice
          },
        })
      }
      catch (error) {
        // Error
        console.error(error)
      }
    }
  },
  computed: {
    me() {
      return this.$store.getters.me
    },
    currentRound: function() {
      if (this.rounds.length === 0) { return null }
      return this.rounds[this.rounds.length-1]
    },
    currentTurn: function() {
      if (this.turns.length  === 0) { return null }
      return this.turns[this.turns.length-1]
    },
    game: function() {
      if (
        this.room &&
        this.room.game &&
        this.games.length === 1 &&
        this.games[0].uuid === this.room.game.uuid) {
        return this.games[0]
      } else {
        return null
      }
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
            inviteCode: this.$route.query.inviteCode,
          }
        },
        result({data}) {
          this.joined = data.joinRoom
        },
        skip () {
          return this.$apolloData.queries.room.loading
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
      error(error) {
        this.$router.push('/')
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
            const index = rooms.findIndex(r => r.uuid === room.uuid, rooms)
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
    },
    games: {
      query: GAME_QUERY,
      deep: true,
      variables() {
        return {
          uuid: this.room.game.uuid
        }
      },
      skip() {
        return !this.room || !this.room.game
      },
      subscribeToMore: [
        {
          document: GAME_UPDATED_SUBSCRIPTION,
          deep: true,
          variables() {
            return {
              uuid: this.room.game.uuid,
            }
          },
          skip() {
            return !this.room || !this.room.game
          },
          updateQuery: (previousResult, {subscriptionData: {data: {gameUpdated: game}}}) => {
            const games = previousResult === undefined ? [] : previousResult.games
            const index = games.findIndex(r => r.uuid === game.uuid, games)
            game.rounds = game.rounds.map(uuid => ({uuid, __typename: "Round"}))
            if (index !== -1) {
              const newGame = Object.assign({}, games[index], game)
              Vue.set(games, index, newGame)
            } else {
              games.push(game)
            }
            return {games}
          },
        },
        {
          document: GAME_DELETED_SUBSCRIPTION,
          deep: true,
          variables() {
            return {
              uuid: this.room.game.uuid,
            }
          },
          skip() {
            return !this.room || !this.room.game
          },
          updateQuery: (previousResult, {subscriptionData: {data: {gameDeleted: game}}}) => {
            const games = previousResult === undefined ? [] : previousResult.games
            const index = games.findIndex(r => r.uuid === game.uuid, games)
            if (index !== -1) {
              games.splice(index, 1)
            }
            return {games}
          },
        },
      ],
    },
    rounds: {
      query: ROUND_QUERY,
      deep: true,
      variables() {
        return {
          uuids: this.game.rounds.map(r => r.uuid)
        }
      },
      skip() {
        return !this.game
      },
      update(data) {
        return data.rounds
      },
      subscribeToMore: [
        {
          document: ROUND_UPDATED_SUBSCRIPTION,
          deep: true,
          variables() {
            return {
              uuids: this.game.rounds.map(r => r.uuid)
            }
          },
          skip() {
            return !this.game
          },
          updateQuery: (previousResult, {subscriptionData: {data: {roundUpdated: round}}}) => {
            const rounds = previousResult === undefined ? [] : previousResult.rounds
            const index = rounds.findIndex(r => r.uuid === round.uuid, rounds)
            round.turns = round.turns.map(uuid => ({uuid, __typename: "Turn"}))
            if (index !== -1) {
              const newRound = Object.assign({}, rounds[index], round)
              Vue.set(rounds, index, newRound)
            } else {
              rounds.push(round)
            }
            return {rounds}
          },
        },
        {
          document: ROUND_DELETED_SUBSCRIPTION,
          deep: true,
          variables() {
            return {
              uuids: this.game.rounds.map(r => r.uuid)
            }
          },
          skip() {
            return !this.game
          },
          updateQuery: (previousResult, {subscriptionData: {data: {roundDeleted: round}}}) => {
            const rounds = previousResult === undefined ? [] : previousResult.rounds
            const index = rounds.findIndex(r => r.uuid === round.uuid, rounds)
            if (index !== -1) {
              rounds.splice(index, 1)
            }
            return {rounds}
          },
        },
      ],
    },
    turns: {
      query: TURN_QUERY,
      deep: true,
      variables() {
        return {
          uuids: this.rounds.map(r => r.turns.map(t => t.uuid)).flat()
        }
      },
      subscribeToMore: [
        {
          document: TURN_UPDATED_SUBSCRIPTION,
          deep: true,
          variables() {
            return {
              uuids: this.rounds.map(r => r.turns.map(t => t.uuid)).flat(),
              token: this.$store.state.token,
            }
          },
          updateQuery: (previousResult, {subscriptionData: {data: {turnUpdated: turn}}}) => {
            const turns = previousResult === undefined ? [] : previousResult.turns
            const index = turns.findIndex(r => r.uuid === turn.uuid, turns)
            turn.artist = {uuid: turn.artist, __typename: "User"}
            if (index !== -1) {
              const newturn = Object.assign({}, turns[index], turn)
              Vue.set(turns, index, newturn)
            } else {
              turns.push(turn)
            }
            return {turns}
          },
        },
        {
          document: TURN_DELETED_SUBSCRIPTION,
          variables() {
            return {
              uuids: this.rounds.map(r => r.turns.map(t => t.uuid)).flat()
            }
          },
          updateQuery: (previousResult, {subscriptionData: {data: {turnDeleted: turn}}}) => {
            const turns = previousResult === undefined ? [] : previousResult.turns
            const index = turns.findIndex(r => r.uuid === turn.uuid, turns)
            if (index !== -1) {
              turns.splice(index, 1)
            }
            return {turns}
          },
        },
      ],
    },
  },
}
</script>

<style scoped>
.room {
  display: flex;
  align-items: stretch;
  flex-flow: column;
  height: 100vh;
}

.header {
  width: 100%;
  flex-basis: content;
}

.chooser {
  position: absolute;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: stretch;
  flex-flow: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.8);
}

.chooser button {
  font-size: 16px;
  min-width: 100px;
}

.tabletop {
  width: 100%;
  display: flex;
  flex-grow: 1;
  align-items: stretch;
}

.main {
  flex-grow: 1;
  padding: 8px;
}

.aside {
  flex-grow: 0;
  display: flex;
  align-items: stretch;
  flex-flow: column;
  max-width: 33vw;
}

.scoreboard {
  flex: 1;
  height: 0;
}

.chat {
  flex: 1;
  height: 0;
}

</style>
