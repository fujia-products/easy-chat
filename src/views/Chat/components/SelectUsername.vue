<template>
  <div class="container">
    <form @submit.prevent="handleSubmit">
      <input
        type="text"
        class="input"
        v-model="username"
        placeholder="please enter your name..."
      />
      <button class="button" :disabled="!isValid">确认</button>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'SelectUsername',
  data() {
    return {
      username: '',
    };
  },
  computed: {
    isValid(): boolean {
      return this.username.length > 2;
    },
  },
  methods: {
    handleSubmit() {
      this.$emit('inputName', this.username);
    },
  },
});
</script>

<style lang="scss" scoped>
.container {
  width: 300px;
  margin: 200px auto 0;
}
</style>
