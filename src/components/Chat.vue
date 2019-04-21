<template>
  <div class="chat">
    <h2>Chat</h2>

    <div class="stream">
      <div v-for="msg in messages" :key="msg.uuid">
        {{ authorName(msg) }}: {{ msg.body }}
      </div>
    </div>

    <div class="input">
      <input placeholder="chit-chat here" v-model="draft" @keydown.enter="send">
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

const MESSAGES_QUERY = gql`
query messageQuery($roomUuid: String!) {
  messages(roomUuid: $roomUuid) {
    uuid
    time
    author {
      uuid
    }
    body
  }
}`

const MESSAGE_INSERTED_SUBSCRIPTION = gql`
subscription messageInserted($roomUuid: String!, $token: String!) {
  messageInserted(roomUuid: $roomUuid, token: $token) {
    uuid
    time
    author
    body
  }
}`

const INSERT_MESSAGE = gql`
mutation insertMessage($roomUuid: String!, $body: String!) {
  insertMessage(roomUuid: $roomUuid, body: $body) {
    uuid
  }
}`

export default {
  name: 'chat',
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
    async send() {
      const backup = this.draft
      this.draft = ''
      try {
        const resp = await this.$apollo.mutate({
          mutation: INSERT_MESSAGE,
          variables: {
            roomUuid: this.room.uuid,
            body: backup,
          },
        })
      }
      catch (error) {
        // Error
        console.error(error)
        this.draft = backup
      }
    },
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
      return [...new Set([...this.messages.map(m => m.author.uuid), ...this.room.members.map(m => m.uuid)])].sort()
    }
  },
  apollo: {
    messages: {
      query: MESSAGES_QUERY,
      variables() {
        return {
          roomUuid: this.room.uuid,
        }
      },
      subscribeToMore: [
        {
          document: MESSAGE_INSERTED_SUBSCRIPTION,
          variables() {
            return {
              roomUuid: this.room.uuid,
              token: this.$store.state.token,
            }
          },
          updateQuery: (previousResult, {subscriptionData: {data: {messageInserted: message}}}) => {
            const messages = previousResult === undefined ? [] : previousResult.messages
            message.author = {uuid: message.author, __typename: "User"}
            return {messages: [...messages, message]}
          },
        },
      ],
    },
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

<style scoped>
.chat {
  width: 100%;
  height: 100%;

  display: flex;
  align-items: stretch;
  flex-flow: column;
}

.stream {
  flex-grow: 1;
  overflow: scroll;
  overflow-y: scroll;
}
</style>
