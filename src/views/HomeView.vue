<template>
  <!-- <p>Current Player One Username: {{ playerOneName }}</p>
    <p>Current Player One Username: {{ playerTwoName }}</p>
    <div class="name-controls">
        <form action="" @submit.prevent="setName()">
          <button type="button">Change</button>
          <p>Current Player One Username: {{ playerOneName }}</p>
          <input type="text" v-model="playerTwoName">
        </form>
      </div> -->

  <!-- Refactor the true and false for setNewName, very inflexible -->
  <!-- goal is to have the input and p all aligned on top of each other with position
        then when they click the change button, z index changes, to bring input to the top
        the button changes to Set Name, clicking on that will bring the paragraph to the top -->
  <!-- maybe that's too fancy, just a regular input will be good enough , I'll save the 
          above idea for another time lmao-->

  <div id="home-view">
    <nav>
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>
    </nav>
    <div class="names">
      <div class="name-display">
        <form method="post" @submit.prevent="setName">
          <input type="text" v-model="playerOneName" name="player-one-name" 
            placeholder="Name" autocomplete="off"
            class="name-input">
            <input type="submit" value="" class="name-submit">
        </form>
      </div>

      <!-- <RouterLink to="/game">Go to Game</RouterLink> -->
      <!-- <RouterView></RouterView> -->
    </div>
  </div>

</template>

<script>
import router from "@/router/router";
import { PLAYER_ONE_STORAGE_KEY } 
from "../constants.mjs";
import { URL } from "@/socket";

// import { sendName } from "@/network.mjs";

export default {
  data() {
    return {
      playerOneName: "",
      newName: false,
      newPlayerOneName: false,
    };
  },
  methods: {
     setName() {
      const loginUrl = URL + "/login"; 

      fetch(loginUrl, {
        method: "POST", 
        mode: "cors",
        headers: {
          "Content-Type": "text/plain", 
        },
        body: this.playerOneName,
      })
      .then(response => response.text())
      .then(data => {
        console.log("response from server " + data);

        if(data === "good name") {
          router.push("/game"); 
          console.log("good name"); 
        } else {
          console.log("bad name"); 
        }
      })
      .catch(error => {
        console.log("error when posting login error msg: " + error.message);
      });
    }
  },
  mounted() {
    const previousPlayerOneName = sessionStorage.getItem(PLAYER_ONE_STORAGE_KEY);
    // const previousPlayerTwoName = sessionStorage.getItem(PLAYER_TWO_STORAGE_KEY);

    if (previousPlayerOneName !== null) {
      this.playerOneName = previousPlayerOneName;
    }
  }, 
  unmounted() {
    sessionStorage.setItem(PLAYER_ONE_STORAGE_KEY, this.playerOneName);
  }
}

</script>

<style scoped>
#home-view {
  height: 100%;
}

.names {
  height: 80%;
  display: grid;
  grid-template-rows: repeat(1, 1fr);
  grid-template-columns: repeat(1, 1fr);
  place-items: center;
}

.name-display {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;
  width: 50%;
  height: 30%;
}

.name-input {
  text-align: center;
  width: 100%;
  height: 60%;
  font-size: 5vw;
}

.name-submit {
  display: none;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}
</style>