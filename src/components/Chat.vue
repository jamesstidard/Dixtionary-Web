<template>
  <div class="chat">
    <div v-for="msg in messages" :key="msg.uuid">
      {{ msg.body }}
    </div>
    <input placeholder="chit-chat here" v-model="draft">
    <button @click="send">Send</button>
  </div>
</template>

<script>
import gql from 'graphql-tag'

const MESSAGE_INSERTED_SUBSCRIPTION = gql`
subscription messageInserted($room: String!) {
  messageInserted(room: $room) {
    uuid
    time
    body
    author
  }
}`

const INSERT_MESSAGE = gql`
mutation insertMessage($room: String!, $body: String!) {
  insertMessage(room: $room, body: $body) {
    uuid
    time
    body
    author
  }
}`

export default {
  name: 'home',
  props: ['room'],
  data() {
    return {
      messages: [],
      draft: '',
    }
  },
  methods: {
    async send() {
      try {
        const resp = await this.$apollo.mutate({
          mutation: INSERT_MESSAGE,
          variables: {
            room: this.room,
            body: this.draft,
          },
        })
      }
      catch (error) {
        // Error
        console.error(error)
      }
    },
  },
  apollo: {
    $subscribe: {
      messages: {
        query: MESSAGE_INSERTED_SUBSCRIPTION,
        variables() {
          return {
            room: this.room,
          }
        },
        result({data}) {
          this.messages.push(data.messageInserted)
        },
      },
    },
  }
}
</script>
