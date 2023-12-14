<template>
  <div class="player-controls">
    <label for="player-one-symbol">Player One Custom Symbol</label>
    <input type="text" name="player-one-symbol" id="player-one-symbol" v-model="firstPlayer">
    <br>
    <label for="player-two-symbol">Player Two Custom Symbol</label>
    <input type="text" name="player-two-symbol" id="player-two-symbol" v-model="secondPlayer">
  </div>

  <div class="game">
    <div v-if="winner !== null" class="outcome-display">
      <p class="outcome-text">
        {{ outcomeText }}
      </p>
      <button type="button" @click="resetGame" class="reset-button">
        Play Again
      </button>
    </div>

    <p class="username">{{ playerOneName }}</p>

    <meta-board @game-over="gameOver($event)" @draw="handleDraw" @resetted="finishReset" :player-one="firstPlayer"
      :player-two="secondPlayer" :reset-signal="resetSignal" class="board">
    </meta-board>

    <p class="username">{{ playerTwoName }}</p>
  </div>

  <div class="history">
    <ul class="moves-list">

    </ul>
  </div>

  <connect-display></connect-display>
</template>

<script>
import MetaBoard from '@/components/Game/MetaBoard.vue';
import ConnectDisplay from '@/components/connectDisplay.vue';

import { PLAYER_ONE_STORAGE_KEY, PLAYER_TWO_STORAGE_KEY } from "../../../../utils/constants.mjs"
import { connectSocket, disconnectSocket } from '@/socket';

const DEFAULT_FIRST_PLAYER = "X";
const DEFAULT_SECOND_PLAYER = "O";

// const URL = "http://localhost:8080";

export default {
  components: {
    MetaBoard,
    ConnectDisplay,
  },
  data() {
    return {
      winner: null,
      resetSignal: false,
      playerOneName: DEFAULT_FIRST_PLAYER,
      playerTwoName: DEFAULT_SECOND_PLAYER,
      firstPlayer: DEFAULT_FIRST_PLAYER,
      secondPlayer: DEFAULT_SECOND_PLAYER,
      numTiles: 9,
    }
  },
  methods: {
    gameOver(winningPlayer) {
      this.winner = winningPlayer;
      console.log("GAME OVER CALLLED " + winningPlayer);
    },
    handleDraw() {
      this.winner = "draw";
    },
    resetGame() {
      this.winner = null;
      this.resetSignal = true;
      this.firstPlayer = DEFAULT_FIRST_PLAYER;
      this.secondPlayer = DEFAULT_SECOND_PLAYER;
    },
    finishReset() {
      this.resetSignal = false;
    }
  },
  computed: {
    outcomeText() {
      let winnerNameDisplay = "";

      if (this.winner === this.firstPlayer) {
        winnerNameDisplay = this.playerOneName;
      } else {
        winnerNameDisplay = this.playerTwoName;
      }

      return `${winnerNameDisplay} has won!`;
    },
  },
  mounted() {
    if (PLAYER_ONE_STORAGE_KEY in sessionStorage) {
      this.playerOneName = sessionStorage.getItem(PLAYER_ONE_STORAGE_KEY);
    }
    if (PLAYER_TWO_STORAGE_KEY in sessionStorage) {
      this.playerTwoName = sessionStorage.getItem(PLAYER_TWO_STORAGE_KEY);
    }
    connectSocket();
  },
  unmounted() {
    disconnectSocket();
  }
}
</script>

<style scoped>
.game {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;
  flex-wrap: wrap;
  flex-direction: column;
  height: 100vh;
}

.board {
  width: fit-content;
  height: fit-content;
  align-self: center;
}

.outcome-display {
  display: flex;
  align-items: center;
  flex-wrap: row;
}

.player-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  flex-direction: column;
}

#player-one-symbol,
#player-two-symbol {
  text-align: center;
}

.reset-button {
  margin-left: 2rem;
}
</style>
