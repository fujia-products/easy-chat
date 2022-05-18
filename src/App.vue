<template>
  <nav>
    <router-link to="/">Home</router-link> |
    <router-link to="/chat">Chat</router-link>
  </nav>
  <router-view />
</template>

<style lang="scss">
html,
body {
  margin: 0;
  padding: 0;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

nav {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 64px;
  background-color: aliceblue;

  a {
    margin: 0 12px;
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
