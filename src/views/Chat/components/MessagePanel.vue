<template>
  <div class="container">
    <div class="header">
      <status-icon :connected="user?.connected" />{{ user?.username }}
    </div>
    <ul class="messages" v-if="user?.messages">
      <li
        v-for="(message, index) in user.messages"
        :key="index"
        :class="{ message: true, 'from-self': message.fromSelf }"
      >
        <div v-if="displaySender(message, index)" class="sender">
          {{ message.fromSelf ? 'Me' : user?.username }}
        </div>
        <p
          :class="{
            'message-content': true,
            'message-only': !displaySender(message, index),
          }"
        >
          {{ message.content }}
        </p>
      </li>
    </ul>
    <form @submit.prevent="handleSubmit" class="form">
      <input
        v-model="message"
        placeholder="please enter your message..."
        class="input-box"
      />
      <button :disabled="!isValid" class="send-button">发送</button>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import StatusIcon from './StatusIcon.vue';

export default defineComponent({
  name: 'MessagePanel',
  components: {
    StatusIcon,
  },
  props: {
    user: Object,
  },
  data() {
    return {
      message: '',
    };
  },
  computed: {
    isValid(): boolean {
      return this.message.length > 0;
    },
  },
  methods: {
    handleSubmit() {
      this.$emit('inputMsg', this.message);
      this.message = '';
    },
    displaySender(msg: string, index: number) {
      return (
        index === 0 ||
        this.user?.messages[index - 1].fromSelf !==
          this.user?.messages[index].fromSelf
      );
    },
  },
});
</script>

<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;
  position: relative;
  margin-left: 260px;
}
.header {
  line-height: 40px;
  padding: 10px 20px;
  border-bottom: 1px solid #dddddd;
}
.messages {
  flex: 1;
  margin: 0;
  padding: 20px;
}
.message {
  display: flex;
  align-items: center;
  padding: 8px;
  list-style: none;

  &-content {
    flex: 1;
    text-align: left;
    padding: 8px;
    margin: 0;
    margin-left: 14px;
    border-radius: 8px;
    background: #f5f5f5;
  }

  &-only {
    margin-left: 48px;
  }

  .sender {
    width: 36px;
    height: 36px;
    line-height: 36px;
    text-align: center;
    border-radius: 50%;
    overflow: hidden;
    background-color: coral;
    font-weight: bold;
  }
}

.from-self {
  .sender {
    order: 2;
  }

  .message-content {
    margin-left: 0;
    margin-right: 14px;
  }

  .message-only {
    margin-left: 0;
    margin-right: 48px;
  }
}

.form {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  padding: 10px;
  background-color: #f9f9f9;
}
.input-box {
  flex: 1;
  resize: none;
  padding: 0 12px;
  height: 36px;
  border-radius: 24px;
  border: 1px solid #ddd;
}
.send-button {
  height: 36px;
  padding: 0 16px;
  margin-left: 12px;
}
</style>
