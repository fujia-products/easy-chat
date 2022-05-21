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
    <div v-if="user?.hasNewMessages" class="new-messages"></div>
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
  display: flex;
  align-items: center;
  padding: 14px;
}
.desc {
  text-align: left;
  display: inline-block;
  flex: auto;

  .status {
    color: #92959e;
  }
}
.new-messages {
  width: 8px;
  height: 8px;
  background-color: red;
  border-radius: 4px;
  /* animation: blink 2s ease-in-out infinite; */
}

@keyframes blink {
  0% {
    opacity: 1;
  }

  100% {
    opacity: 0.8;
  }
}
</style>
