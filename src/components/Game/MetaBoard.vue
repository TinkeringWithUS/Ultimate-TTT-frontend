<template>
  <!-- Player 1 clock -->
  <div>
    <!-- <div class="clock-container" id="first-clock" :class="{ activeClock: isPlayerTurn }">
			<player-timer :start-time-seconds="startTimeSeconds" :is-enabled="playerOneTurn" :owner="playerOne"
				:reset-signal="resetSignal" @time-loss="handleTimeLoss($event)">
			</player-timer>
		</div> -->
    <div class="meta-board">
      <GameBoard v-for="gameState of metaGameState" :key="gameState.id" @tile-placed="placeTile($event, true)"
        @game-over="setBoardStatus($event)" @draw="setBoardStatus($event)" :opponent-player-symbol="opponentSymbol"
        :opponent-move="opponentMove" :client-player-symbol="playerSymbol" :reset-signal="resetSignal"
        :is-enabled="gameState.isEnabled" :board-id="gameState.id" class="game-board">
      </GameBoard>
    </div>
    <!-- Player 2 clock -->
    <!-- <div class="clock-container" id="second-clock" :class="{ activeClock: !playerOne }">
			<player-timer :start-time-seconds="startTimeSeconds" :is-enabled="!playerOneTurn" :owner="playerTwo"
				:reset-signal="resetSignal" @time-loss="handleTimeLoss($event)">
			</player-timer>
		</div> -->
  </div>
</template>

<script>
import GameBoard from './GameBoard.vue';
// import PlayerTimer from './PlayerTimer.vue';

import { sendMove, state, socket, initializeClient, processNewMove } from "../../socket.js";

import {
  NUM_BOARDS, CONTINUE, DRAW, PLAYER_ONE_STORAGE_KEY, PLAYER_START_TIME, RESET,
  // WAIT_FOR_OTHER_PLAYER, RESETTED
} from "../../../../../utils/constants.mjs";
// import { sendMove, receiveMove } from '@/socket';

const startTimeSeconds = PLAYER_START_TIME;

export default {
  components: {
    GameBoard,
    // PlayerTimer,
  },
  emits: [
    "game-over",
    "resetted",
    "draw",
  ],
  props: {
    playerOne: { required: true, type: String },
    playerTwo: { required: true, type: String },
    resetSignal: { default: false, type: Boolean },
  },
  data() {
    let metaGameState = [];
    let endGameStates = [DRAW, this.playerOne, this.playerTwo];

    for (let i = 0; i < NUM_BOARDS; i++) {
      metaGameState.push({
        id: i,
        isEnabled: true,
        status: CONTINUE, // playerOne/two win, draw, continue
      });
    }
    let opponentMove = {
      tileId: -1,
      boardId: -1,
    };
    return {
      metaGameState,
      endGameStates,
      startTimeSeconds,
      opponentMove,
      opponentKey: "",
      opponentSymbol: "",
      isPlayerTurn: false,
      playerStorageKey: "",
      playerSymbol: "",
      boardsInPlay: NUM_BOARDS,
      serverGameState: state,
      currentGameState: null,
      nextBoardToPlay: -1,
    }
  },
  methods: {
    // sets enable status, sends move if isNativePlacement, 
    placeTile({ tileId, boardId }, isNativePlacement) {
      this.nextBoardToPlay = Number(tileId);

      let nextBoard = this.metaGameState[this.nextBoardToPlay];

      // this is wack, excess computation, but it looks nice lol
      // if next board to play has ended already, enable all, else, set enable status
      // of next board
      this.setAllBoardEnableStatus(true);
      console.log("meta board. nextboard status: " + nextBoard.status);
      if (!this.endGameStates.includes(nextBoard.status)) {
        for (let board = 0; board < this.metaGameState.length; board++) {
          this.metaGameState[board].isEnabled = this.nextBoardToPlay === board;
        }
      }

      console.log("Sending move");
      if (isNativePlacement) {
        sendMove(this.playerStorageKey, tileId, boardId);
        this.isPlayerTurn = false;
      }

      // just played, other players turn, can't move until we receive new info
      if (!this.isPlayerTurn && isNativePlacement) {
        this.setAllBoardEnableStatus(false);
      }
    },
    setBoardStatus(boardInfo) {
      let board = Number(boardInfo.boardId);
      this.metaGameState[board].status = boardInfo.status;
      this.boardsInPlay--;

      const potentialEndState = this.getWinner(this.boardsInPlay);
      if (this.endGameStates.includes(potentialEndState)) {
        // debugger; // eslint-disable-line no-debugger
        this.setAllBoardEnableStatus(false);
        this.setEndGameStatus(potentialEndState);
      }
    },
    getWinner(boardsInPlay) {
      if (boardsInPlay === 0) {
        return DRAW;
      }

      let winningCombinations = [
        [0, 1, 2], // row wins
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6], // column wins
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8], // diagonal wins
        [2, 4, 6]
      ];

      for (const combo of winningCombinations) {
        let isWinning = false;
        let originalOwner = this.metaGameState[combo[0]].status;
        for (let comboIndex = 0; comboIndex < combo.length; comboIndex++) {
          let currentOwner = this.metaGameState[combo[comboIndex]].status;
          isWinning = currentOwner === originalOwner;
          if (!isWinning) {
            break;
          }
        }
        if (isWinning) {
          return originalOwner;
        }
      }
      return null;
    },
    handleTimeLoss(timerOwner) {
      if (timerOwner === this.playerOne) {
        this.setEndGameStatus(this.playerTwo); // player 2's win
      } else if (timerOwner === this.playerTwo) {
        this.setEndGameStatus(this.playerOne); // player 1's win
      }
      this.setAllBoardEnableStatus(false);
    },
    setEndGameStatus(newStatus) {
      this.currentGameState = newStatus;
    },
    setAllBoardEnableStatus(enableStatus) {
      for (const boardState of this.metaGameState) {
        boardState.isEnabled = enableStatus;
      }
    }
  },
  watch: {
    currentGameState: function (newEndState) {
      if (newEndState !== null) {
        const eventToEmit = newEndState === DRAW ? DRAW : "game-over";
        this.$emit(eventToEmit, newEndState);
      }
    },
    resetSignal: function (newReset) {
      if (newReset) {
        // debugger; // eslint-disable-line no-debugger
        for (const board of this.metaGameState) {
          board.status = CONTINUE;
          board.isEnabled = true;
        }
        this.playerOneTurn = this.playerStorageKey === PLAYER_ONE_STORAGE_KEY;
        this.boardsInPlay = NUM_BOARDS;
        this.nextBoardToPlay = -1;
        socket.emit(RESET);
        this.setEndGameStatus(null);
        this.$emit("resetted");
      }
    },
  },
  mounted() {
    initializeClient(this);
    processNewMove(this);
  },
}

</script>

<style scoped>
.game-board {
  border: solid;
  border-color: paleturquoise;
}

.meta-board {
  /* width: 60rem;
	height: 60rem; */
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
}

#second-clock {
  display: flex;
  justify-content: right;
}
</style>