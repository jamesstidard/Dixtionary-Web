<style scoped>
.container {
  height: 100%;
  width: 100%;

  display: flex;
  flex-direction: column;
}

.section {
  margin-left: 8px;
  margin-right: 8px;

  flex-grow: 1;

  display: flex;
  flex-direction: column;

  /* for Firefox */
  min-height: 0;
}

.scrollable-content {
  text-align: left;

  flex-grow: 1;

  overflow: auto;

  /* for Firefox */
  min-height: 0;
}

.input {
  height: 32px;
}

.input input {
  /* width: 100%; */
  height: 100%;

  font-size: 16px;

  padding-left: 8px;
  padding-right: 8px;
  padding-top: 0px;
  padding-bottom: 0px;
  border: 0;
}
</style>


<template>
  <div class="container">
    <div class="section">
      <div class="content">
        <h2>Chat</h2>
      </div>

      <div ref="stream" class="scrollable-content content">
        <div v-for="msg in messages" :key="msg.uuid">{{ authorName(msg) }}: {{ msg.body }}</div>
      </div>

      <div class="input">
        <input placeholder="chit-chat here" v-model="draft" @keydown.enter="send">
      </div>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import gql from "graphql-tag";

const USERS_QUERY = gql`
  query userQuery($uuids: [String!]) {
    users(uuids: $uuids) {
      uuid
      name
    }
  }
`;

const USERS_UPDATE = gql`
  subscription userUpdated($uuids: [String!]) {
    userUpdated(uuids: $uuids) {
      uuid
      name
    }
  }
`;

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
  }
`;

const MESSAGE_INSERTED_SUBSCRIPTION = gql`
  subscription messageInserted($roomUuid: String!, $token: String!) {
    messageInserted(roomUuid: $roomUuid, token: $token) {
      uuid
      time
      author
      body
    }
  }
`;

const INSERT_MESSAGE = gql`
  mutation insertMessage($roomUuid: String!, $body: String!) {
    insertMessage(roomUuid: $roomUuid, body: $body) {
      uuid
    }
  }
`;

export default {
  name: "chat",
  props: ["room"],
  data() {
    return {
      messages: [],
      users: [],
      draft: ""
    };
  },
  mounted: function() {
    this.$nextTick(function() {
      this.$refs.stream.scrollTop = this.$refs.stream.scrollHeight;
    })
  },
  methods: {
    async send() {
      const backup = this.draft;
      this.draft = "";
      try {
        const resp = await this.$apollo.mutate({
          mutation: INSERT_MESSAGE,
          variables: {
            roomUuid: this.room.uuid,
            body: backup
          }
        });
      } catch (error) {
        // Error
        console.error(error);
        this.draft = backup;
      }
    },
    authorName(message) {
      const uuid = message.author.uuid;
      const index = this.users.findIndex(u => u.uuid == uuid, this.users);
      if (index === -1) {
        return "Anonymous";
      } else {
        return this.users[index].name;
      }
    }
  },
  computed: {
    unquieMembers() {
      return [
        ...new Set([
          ...this.messages.map(m => m.author.uuid),
          ...this.room.members.map(m => m.uuid)
        ])
      ].sort();
    }
  },
  watch: {
    messages: function() {
      this.$nextTick(function() {
        this.$refs.stream.scrollTop = this.$refs.stream.scrollHeight;
      })
    },
  },
  apollo: {
    messages: {
      query: MESSAGES_QUERY,
      variables() {
        return {
          roomUuid: this.room.uuid
        };
      },
      subscribeToMore: [
        {
          document: MESSAGE_INSERTED_SUBSCRIPTION,
          variables() {
            return {
              roomUuid: this.room.uuid,
              token: this.$store.state.token
            };
          },
          updateQuery: (
            previousResult,
            {
              subscriptionData: {
                data: { messageInserted: message }
              }
            }
          ) => {
            const messages =
              previousResult === undefined ? [] : previousResult.messages;
            message.author = { uuid: message.author, __typename: "User" };
            return { messages: [...messages, message] };
          }
        }
      ]
    },
    users: {
      query: USERS_QUERY,
      deep: true,
      variables() {
        return {
          uuids: this.unquieMembers
        };
      },
      subscribeToMore: [
        {
          document: USERS_UPDATE,
          deep: true,
          variables() {
            return {
              uuids: this.unquieMembers
            };
          },
          updateQuery: (
            previousResult,
            {
              subscriptionData: {
                data: { userUpdated: user }
              }
            }
          ) => {
            const users =
              previousResult === undefined ? [] : previousResult.users;
            const index = users.findIndex(u => u.uuid == user.uuid, users);
            if (index !== -1) {
              const newUser = Object.assign({}, users[index], user);
              Vue.set(users, index, newUser);
            } else {
              users.push(user);
            }
            return { users };
          }
        }
      ]
    }
  }
};
</script>
