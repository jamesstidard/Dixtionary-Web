<template>
  <div class="chat">
    <div v-for="msg in messages" :key="msg.uuid">
      {{ msg.body }}
    </div>
    <input placeholder="chit-chat here" v-model="draft" @keydown.enter="send">
    <button @click="send">Send</button>
  </div>
</template>

<script>
import gql from 'graphql-tag'

const MESSAGES_QUERY = gql`
query messageQuery($roomUuid: String!) {
  messages(roomUuid: $roomUuid) {
    uuid
    time
    body
  }
}`

const MESSAGE_INSERTED_SUBSCRIPTION = gql`
subscription messageInserted($roomUuid: String!) {
  messageInserted(roomUuid: $roomUuid) {
    uuid
    time
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
    'roomUuid',
  ],
  data() {
    return {
      messages: [],
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
            roomUuid: this.roomUuid,
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
  },
  apollo: {
    messages: {
      query: MESSAGES_QUERY,
      variables() {
        return {
          roomUuid: this.roomUuid,
        }
      },
      subscribeToMore: [
        {
          document: MESSAGE_INSERTED_SUBSCRIPTION,
          variables() {
            return {
              roomUuid: this.roomUuid,
            }
          },
          updateQuery: (previousResult, {subscriptionData: {data: {messageInserted: message}}}) => {
            const messages = previousResult === undefined ? [] : previousResult.messages
            return {messages: [...messages, message]}
          },
        },
      ],
    },
  }
}
</script>
