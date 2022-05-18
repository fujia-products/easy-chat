<template>
  <div class="user" @click="handleSelect" :class="{ selected: selected }">
    <div class="desc">
      <div class="name">
        {{ user?.username }} {{ user?.self ? '(yourself)' : '' }}
      </div>
      <div class="status">
        <status-icon :connected="user?.connected" />{{ status }}
      </div>
    </div>
    <div v-if="user?.hasNewMessages" class="new-messages">!</div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import StatusIcon from './StatusIcon.vue';

export default defineComponent({
  name: 'UserItem',
  components: {
    StatusIcon,
  },
  props: {
    user: Object,
    selected: Boolean,
  },
  computed: {
    status(): 'online' | 'offline' {
      return this.user?.connected ? 'online' : 'offline';
    },
  },
  methods: {
    handleSelect() {
      this.$emit('select');
    },
  },
});
</script>

<style lang="scss" scoped>
.selected {
  background-color: #1164a3;
}
.user {
  padding: 10px;
}
.desc {
  display: inline-block;

  .status {
    color: #92959e;
  }
}
.new-messages {
  color: white;
  background-color: red;
  width: 20px;
  border-radius: 5px;
  text-align: center;
  float: right;
  margin-top: 10px;
}
</style>
