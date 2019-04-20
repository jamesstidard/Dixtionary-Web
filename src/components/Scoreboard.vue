<template>
  <div class="scoreboard">
    <div v-for="member in unquieMembers" :key="member.uuid" :class="{me: me.uuid === member.uuid}">
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

export default {
  name: 'scoreboard',
  props: [
    'room',
  ],
  data() {
    return {
      users: [],
    }
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
        return !this.room.members || this.room.members.length === 0
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
  }
}
</script>


<style scoped>
div.me {
  font-weight: bold;
}
</style>
