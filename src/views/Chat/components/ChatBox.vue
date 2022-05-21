<template>
  <section class="container">
    <div class="left-panel">
      <user-item
        v-for="user in users"
        :key="user.userID"
        :user="user"
        :selected="selectedUser === user"
        @select="handleSelectUser(user)"
      />
    </div>
    <message-panel
      v-if="selectedUser"
      :user="selectedUser"
      @inputMsg="onMessage"
    />
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import socket from '../socket';
import MessagePanel from './MessagePanel.vue';
import UserItem from './UserItem.vue';

interface IUser {
  userID?: string;
  self?: boolean;
  connected?: boolean;
  messages?: any[];
  username: string;
  hasNewMessages?: boolean;
  [index: string]: unknown;
}

export default defineComponent({
  name: 'ChatBox',
  components: {
    MessagePanel,
    UserItem,
  },
  data() {
    return {
      selectedUser: null,
      users: [],
    } as {
      selectedUser: IUser | null;
      users: IUser[];
    };
  },
  methods: {
    onMessage(content: string) {
      if (this.selectedUser) {
        socket.emit('privateMessage', {
          content,
          to: this.selectedUser.userID,
        });

        this.selectedUser?.messages?.push({
          content,
          fromSelf: true,
        });
      }
    },
    handleSelectUser(user: IUser) {
      this.selectedUser = user;
      user.hasNewMessages = false;
    },
  },
  created() {
    socket.on('connect', () => {
      this.users.forEach((user) => {
        if (user.self) {
          user.connected = true;
        }
      });
    });

    socket.on('disconnect', () => {
      this.users.forEach((user) => {
        if (user.self) {
          user.connected = false;
        }
      });
    });

    const initReactiveProperties = (user: IUser) => {
      // user.connected = true;
      // user.messages = [];
      user.hasNewMessages = false;
    };

    socket.on('users', (users: IUser[]) => {
      users.forEach((user) => {
        user.messages?.forEach((message) => {
          message.fromSelf = message.from === socket.userID;
        });
        for (let i = 0; i < this.users.length; i++) {
          const existingUser = this.users[i];

          if (existingUser.userID === user.userID) {
            existingUser.connected = user.connected;
            existingUser.messages = user.messages;
            return;
          }
        }

        // user.self = user.userID === socket.id;
        user.self = user.userID === socket.userID;

        initReactiveProperties(user);
        this.users.push(user);
      });

      // put the current user first, and sort by username
      this.users = users.sort((a, b) => {
        if (a.self) return -1;
        if (b.self) return 1;
        if (a.username < b.username) return -1;
        return a.username > b.username ? 1 : 0;
      });
    });

    socket.on('userConnected', (user) => {
      for (let i = 0; i < this.users.length; i++) {
        const existingUser = this.users[i];

        if (existingUser.userID === user.userID) {
          existingUser.connected = true;
          return;
        }
      }

      initReactiveProperties(user);
      this.users.push(user);
    });

    socket.on('userDisconnected', (id) => {
      for (let i = 0; i < this.users.length; i++) {
        const user = this.users[i];
        if (user.userID === id) {
          user.connected = false;
          break;
        }
      }
    });

    socket.on('privateMessage', ({ content, from, to }) => {
      for (let i = 0; i < this.users.length; i++) {
        const user = this.users[i];

        const fromSelf = socket.userID === from;

        if (user.userID === (fromSelf ? to : from)) {
          user?.messages?.push({
            content,
            fromSelf,
          });
          if (user !== this.selectedUser) {
            user.hasNewMessages = true;
          }
          break;
        }
      }
    });
  },
  unmounted() {
    socket.off('connect');
    socket.off('disconnect');
    socket.off('users');
    socket.off('userConnected');
    socket.off('userDisconnected');
    socket.off('privateMessage');
  },
});
</script>

<style lang="scss" scoped>
.container {
  height: calc(100vh - 64px);
}
.left-panel {
  position: fixed;
  left: 0;
  top: 64px;
  bottom: 0;
  width: 260px;
  overflow-x: hidden;
  background-color: #3f0e40;
  color: white;
}
.right-panel {
  margin-left: 260px;
}
</style>
