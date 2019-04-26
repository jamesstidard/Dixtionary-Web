<style scoped>
.scoreboard {
  padding-left: 8px;
  padding-right: 8px;
}

.line {
  text-align: left;
  display: flex;
  padding-top: 2px;
  padding-bottom: 2px;
}

.name {
  flex-grow: 1;
  padding-left: 8px;
  padding-right: 8px;
  text-overflow: ellipsis;
  overflow: hidden;
}

.score {
  padding-right: 4px;
}

div.me {
  font-weight: bold;
}
</style>


<template>
  <div class="scoreboard">
    <h2>Scoreboard</h2>
    <div
      v-for="member in unquieMembers"
      :key="member.uuid"
      class="line"
      :class="{
        me: me.uuid === member.uuid
      }">

      <div class="token">
        <font-awesome-icon
          v-if="member.uuid === room.owner.uuid"
          :icon="['fal', 'user-crown']" />
        <font-awesome-icon
          v-else
          :icon="['fal', 'user']" />
      </div>

      <div class="name">
        {{ member.name }}
      </div>

      <div class="score">
        {{ userScore(member) }}
      </div>

    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import gql from 'graphql-tag'

const USERS_QUERY = gql`
query userQuery($uuids: [String!]) {
  users(uuids: $uuids) {
    uuid
    name
  }
}`

const USERS_UPDATE = gql`
subscription userUpdated($uuids: [String!]) {
  userUpdated(uuids: $uuids) {
    uuid
    name
  }
}`

const SCORES_QUERY = gql`
query scoreQuery($gameUuid: String!) {
  scores(gameUuid: $gameUuid) {
    uuid
    user {
      uuid
    }
    value
  }
}`

const SCORES_UPDATE = gql`
subscription scoreUpdated($gameUuid: String!) {
  scoreInserted(gameUuid: $gameUuid) {
    uuid
    user
    value
  }
}`

export default {
  name: 'scoreboard',
  props: [
    'room',
  ],
  data() {
    return {
      users: [],
      scores: [],
    }
  },
  methods: {
    userScore: function(user) {
      const userScores = this.scores.filter(s => s.user.uuid === user.uuid)
      return userScores.reduce((a, s) => a+s.value, 0)
    },
  },
  computed: {
    me() {
      return this.$store.getters.me
    },
    unquieMembers() {
      const uuids = [...new Set(this.room.members.map(m => m.uuid))].sort()
      return this.users.filter(u => uuids.includes(u.uuid))
    }
  },
  apollo: {
    users: {
      query: USERS_QUERY,
      deep: true,
      variables() {
        return {
          uuids: [...new Set(this.room.members.map(m => m.uuid))].sort(),
        }
      },
      skip() {
        return !this.room.members
      },
      subscribeToMore: [
        {
          document: USERS_UPDATE,
          deep: true,
          variables() {
            return {
              uuids: [...new Set(this.room.members.map(m => m.uuid))].sort(),
            }
          },
          updateQuery: (previousResult, {subscriptionData: {data: {userUpdated: user}}}) => {
            const users = previousResult === undefined ? [] : previousResult.users
            const index = users.findIndex(u => u.uuid == user.uuid, users)
            if (index !== -1) {
              const newUser = Object.assign({}, users[index], user)
              Vue.set(users, index, newUser)
            } else {
              users.push(user)
            }
            return {users}
          },
        },
      ],
    },
    scores: {
      query: SCORES_QUERY,
      deep: true,
      variables() {
        return {
          gameUuid: this.room.game.uuid,
        }
      },
      skip() {
        return !this.room || !this.room.game
      },
      subscribeToMore: [
        {
          document: SCORES_UPDATE,
          deep: true,
          variables() {
            return {
              gameUuid: this.room.game.uuid,
            }
          },
          skip() {
            return !this.room || !this.room.game
          },
          updateQuery: (previousResult, {subscriptionData: {data: {scoreInserted: score}}}) => {
            const scores = previousResult === undefined ? [] : previousResult.scores
            const index = scores.findIndex(u => u.uuid == score.uuid, scores)
            score.user = {uuid: score.user, __typename: "User"}
            if (index !== -1) {
              const newScore = Object.assign({}, scores[index], score)
              Vue.set(scores, index, newScore)
            } else {
              scores.push(score)
            }
            return {scores}
          },
        },
      ],
    },
  }
}
</script>
