<template>
  <i class="icon" :class="{ connected: connected }"></i>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'StatusIcon',
  props: {
    connected: {
      type: Boolean,
      default: false,
    },
  },
});
</script>

<style lang="scss" scoped>
.icon {
  display: inline-block;
  height: 8px;
  width: 8px;
  border-radius: 50%;
  background-color: #e38968;
  margin-right: 6px;

  &.connected {
    background-color: #86bb71;
  }
}
</style>
