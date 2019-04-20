<template>
  <div class="scoreboard">
    <div v-for="member in unquieMembers" :key="member.uuid">
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
      messages: [],
      users: [],
      draft: '',
    }
  },
  methods: {
    authorName(message) {
      const uuid = message.author.uuid
      const index = this.users.findIndex(u => u.uuid == uuid, this.users)
      if (index === -1) {
        return 'Anonymous'
      } else {
        return this.users[index].name
      }
    }
  },
  computed: {
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
          uuids: this.unquieMembers,
        }
      },
      subscribeToMore: [
        {
          document: USERS_UPDATE,
          deep: true,
          variables() {
            return {
              uuids: this.unquieMembers,
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
