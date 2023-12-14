<template>
  <div class="board-container">
    <div class="game-board" :class="{ active: isEnabled }">
      <game-tile v-for="tile in GameBoard" :key="tile.id" :ownerSymbol="tile.owner" :id="tile.id"
        @place-tile="placeTile(tile.id, true)">
      </game-tile>
    </div>
    <div v-if="winner !== null" class="end-display">
      {{ winner }}
    </div>
  </div>
</template>

<script>
import GameTile from './GameTile.vue';

import { NUM_TILES_PER_BOARD } from "../../../../../utils/constants.mjs";

const DRAW = "D";

export default {
  components: {
    GameTile,
  },
  emits: [
    "tile-placed",
    "game-over",
    "resetted",
  ],
  props: {
    // firstPlayer: { required: true, type: Object }, 
    // secondPlayer: { required: true, type: Object }
    clientPlayerSymbol: { required: true, type: String }, // move id comes from event handler
    opponentPlayerSymbol: { required: true, type: String },
    opponentMove: { required: true, type: Object },
    isEnabled: { default: false, type: Boolean },
    boardId: { required: true, type: Number },
    resetSignal: { default: false, type: Boolean },
  },
  data() {
    let GameBoard = [];
    for (let i = 0; i < NUM_TILES_PER_BOARD; i++) {
      GameBoard.push({ owner: String(i), id: String(i) });
    }

    return {
      GameBoard,
      DRAW: DRAW,
      winner: null,
      tilesPlaced: 0,
    }
  },
  methods: {
    resetBoard() {
      for (const tile of this.GameBoard) {
        tile.owner = tile.id;
      }
      this.tilesPlaced = 0;
      this.winner = null;
    },
    placeTile(tileId, nativeTilePlace) {
      console.log("game board tile id: " + tileId);
      let selectedTile = this.GameBoard[tileId];

      if (selectedTile.owner !== selectedTile.id || this.winner !== null || (!this.isEnabled && nativeTilePlace)) {
        console.log("failed to place tile. winner: " + this.winner + " is enabled: " + this.isEnabled +
          " and owner: " + selectedTile.owner);
        return;
      }

      this.tilesPlaced++;
      selectedTile.owner = nativeTilePlace ? this.clientPlayerSymbol : this.opponentPlayerSymbol;

      if (nativeTilePlace) {
        this.$emit("tile-placed", { tileId: tileId, boardId: this.boardId });
      }

      this.winner = this.getWinner();

      if (this.winner !== null) {
        this.$emit("game-over", { status: this.winner, boardId: this.boardId });
      }
    },
    getWinner() {
      if (this.tilesPlaced === NUM_TILES_PER_BOARD) {
        return DRAW;
      }

      // 2 things to deal with when placing tiles. need to listen to click place tile
      // and send it to the server. and need to place tile when we receive tile from
      // server. server should send: playerSymbol, playerKey, and client should place
      // tile if it follows ultimate ttt rules. 
      // algorithm only works if every tile id isn't all the same, that's
      // why this breaks when all tile owners are "" or equivalent. Easy plan,
      // number them under the hood, but don't show the players the coordinates
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
        let originalOwner = this.GameBoard[combo[0]].owner;
        for (let comboIndex = 0; comboIndex < combo.length; comboIndex++) {
          let currentOwner = this.GameBoard[combo[comboIndex]].owner;
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
  },
  watch: {
    resetSignal: function (newReset) {
      if (newReset) {
        this.resetBoard();
        this.$emit("resetted");
      }
    },
    opponentMove: function (newOpponentMove) {
      // this has already been pre processed by server
      // guaranteed to be valid move
      console.log("new opponent move: " + JSON.stringify(newOpponentMove));
      const { tileId, boardId } = newOpponentMove;
      if (boardId !== this.boardId) {
        return;
      }
      this.placeTile(Number(tileId), false);
    }
  },
}

</script>

<style scoped>
.active {
  border: solid red;
}

.end-display {
  position: absolute;
  display: flex;
  justify-content: center;
  align-self: center;
  width: 9rem;
  height: 9rem;
  background-color: rgba(255, 255, 255, 0.8);
  text-align: center;
  font-size: 8rem;
  color: red;
}

.game-board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  margin: 0px 0px 0px 0px;
  width: 9rem;
  height: 9rem;
  position: relative;
}

.board-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0px 0px 0px 0px;
}
</style>