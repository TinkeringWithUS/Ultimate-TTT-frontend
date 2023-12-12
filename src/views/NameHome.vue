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

    <div class="name-display">
        <input type="text" v-model="playerOneName" name="player-one-name" placeholder="player one name" 
            class="name-input">
    </div>

    <div class="name-display">
        <input type="text" v-model="playerTwoName" name="player-two-name" placeholder="player two name"
            class="name-input" />
    </div>



    <!-- <div class="name-controls">
        <form action="" @submit.prevent="setName()">
            <div class="">
                <button type="button">Change</button>
                <p>Current Player Two Username: {{ playerTwoName }}</p>
                <input type="text" v-model="playerOneName">
            </div>
        </form>
    </div> -->

    <!-- overlay  -->

    <!-- 
    <form action="" v-if="newName" @submit.prevent="setName()">
        <p>Player One Username: {{ playerOneName }} <input type="text" v-model="playerOneName" /></p>
        <button type="submit">
            Submit
        </button>
    </form>
    
    <form action="" v-if="newName" @submit.prevent="setName()">
        <p>Player Two Username: {{ playerTwoName }} <input type="text" v-model="playerTwoName" /></p>
        <button type="submit">
            Submit
        </button>
    </form> -->

    <RouterLink to="/game">Go to Game</RouterLink>
</template>

<script>
import { PLAYER_ONE_STORAGE_KEY, PLAYER_TWO_STORAGE_KEY } from "../../../../utils/constants.mjs";

export default {
    data() {
        return {
            playerOneName: "",
            playerTwoName: "",
            newName: false,
            newPlayerOneName: false,
            newPlayerTwoName: false,
        };
    },
    methods: {
        // setName(isPlayerOne) {
        //     if (isPlayerOne) {
        //         this.newPlayerOneName = true;
        //         sessionStorage.setItem("player one", this.playerOneName);
        //         console.log("session storage, player one: " + sessionStorage.getItem("player one"));
        //     } else {
        //         this.newPlayerTwoName = true;
        //         sessionStorage.setItem("player two", this.playerTwoName);
        //         console.log("session storage, player two: " + sessionStorage.getItem("player two"));
        //     }
        // }
    },
    mounted() {
        const previousPlayerOneName = sessionStorage.getItem(PLAYER_ONE_STORAGE_KEY);
        const previousPlayerTwoName = sessionStorage.getItem(PLAYER_TWO_STORAGE_KEY);

        if (previousPlayerOneName !== null) {
            this.playerOneName = previousPlayerOneName;
        }
        if (previousPlayerTwoName !== null) {
            this.playerTwoName = previousPlayerTwoName;
        }
    },
    unmounted() {
        sessionStorage.setItem(PLAYER_ONE_STORAGE_KEY, this.playerOneName);
        sessionStorage.setItem(PLAYER_TWO_STORAGE_KEY, this.playerTwoName);
    }
}

</script>

<style scoped>
.name-input {
    text-align: center;

}
.name-display {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: row;
}
</style>