<template>
  <footer class="connected-display">{{ connectedMessage }}</footer>
</template>

<script>

import { state } from '@/socket';

export default {
  data() {
    return {
      isConnected: state.isConnected,
    }
  },
  computed: {
    connectedMessage() {
      let connectMsg = state.isConnected ? "Connected: ✔️" : "Disconnected ❌";
      console.log("connect display connected status: " + state.isConnected + " and msg: " + connectMsg);
      return connectMsg;
    }
  }
}

</script>

<style scoped>
/* footer{
    width: 5rem;
    height: 5rem;
} */

.connected-display {
  width: 10rem;
  height: 1rem;
  /* font-size: 0.7rem; */
}
</style>