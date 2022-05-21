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
  display: flex;
  justify-content: center;
  align-items: center;
  width: 480px;
  height: 300px;
  border: 1px dashed #ddd;
  border-radius: 8px;
  margin: 100px auto 0;

  .input {
    width: 156px;
    height: 32px;
    padding: 0 8px;
    border: none;
    border-bottom: 1px solid #aaa;

    &:focus {
      border-color: #42b983;
      outline: none;
    }
  }

  .button {
    height: 32px;
    padding: 0 16px;
    margin-left: 16px;
  }
}
</style>
