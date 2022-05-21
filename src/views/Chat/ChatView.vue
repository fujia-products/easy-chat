<template>
  <select-username
    v-if="!usernameAlreadySelected"
    @inputName="onUsernameSelection"
  />
  <chat-box v-else />
</template>

<script lang="ts">
import { defineComponent } from '@vue/runtime-core';

import SelectUsername from './components/SelectUsername.vue';
import ChatBox from './components/ChatBox.vue';
import socket from './socket';

export default defineComponent({
  name: 'ChatView',
  components: {
    SelectUsername,
    ChatBox,
  },
  data() {
    return {
      usernameAlreadySelected: false,
    };
  },
  created() {
    const sessionID = localStorage.getItem('sessionID');

    if (sessionID) {
      this.usernameAlreadySelected = true;
      socket.auth = {
        sessionID,
      };
      socket.connect();
    }

    socket.on('session', ({ sessionID, userID }) => {
      // attach the session ID to the next reconnection attempts
      socket.auth = {
        sessionID,
      };
      // store it in the localStorage
      localStorage.setItem('sessionID', sessionID);
      // save the ID of the user
      socket.userID = userID;
    });

    socket.on('connect_error', (err) => {
      if (err.message === 'invalid username') {
        this.usernameAlreadySelected = false;
      }
    });
  },
  unmounted() {
    socket.off('connect_error');
  },
  methods: {
    onUsernameSelection(username: string) {
      this.usernameAlreadySelected = true;
      socket.auth = {
        username,
      };
      socket.connect();
    },
  },
});
</script>
