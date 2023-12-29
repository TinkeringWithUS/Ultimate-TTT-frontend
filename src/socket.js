import { PLAYER_ONE_STORAGE_KEY, PLAYER_TWO_STORAGE_KEY, NUM_TILES_PER_BOARD, INITIALIZE, NEW_MOVE }
  from "@/constants.mjs";

import { reactive } from "vue";
import { io } from "../node_modules/socket.io/client-dist/socket.io.js";

// export const URL = "http://localhost:3000";
export const URL = window.location; 

export const state = reactive({
  isConnected: false,
  errorMessage: null,
  nextMove: {
    player: PLAYER_ONE_STORAGE_KEY,
    tileId: -1,
    gameStatus: null
  },
});

/**
 * so two clients join, both clients will be initialized 
 * with their respective statuses as players (e.g. one will be player one
 * and the other will be player two (socket.emit("initialize")))
 * 
 * then the client as player one will play their move (handling client side
 * logic will be talked about later)
 * when p1 plays their move, receive and send this to gameModel, 
 * where it will update the model, and sent the new move to the other player, 
 * then the other player will play their move, send thier stuff etc.
 * 
 * for client side logic, client will play their move, set all enable status to 
 * false, wait for a new move, once new moves arrives, update next board id with 
 * tile id, allow player to play their move, send back to server 
 * (player key, tileId of Move) then the cycle repeats. 
 */

const socketOptions = {
  autoConnect: false,
};

// local development 
// export const socket = io(URL, socketOptions);

// production 
export const socket = io(window.location, socketOptions);

export function connectSocket() {
  socket.connect();
  console.log("Calling connect Socket. connexion status: " + state.isConnected);
  return state.isConnected;
}

export function disconnectSocket() {
  socket.disconnect();
  console.log("Disconnecting socket");
  state.isConnected = false;
  return state.isConnected;
}

export function sendMove(playerKey, tileId, boardId) {
  if (state.isConnected || (!state.isConnected && connectSocket())) {
    socket.emit(playerKey, { tileId: tileId, boardId: boardId });
    return true;
  }
  return false;
}

export function initializeClient(metaBoardContext) {
  socket.on(INITIALIZE, initialData => {
    // roomId
    const { playerKey, playerSymbol, opponentSymbol, roomId } = initialData;
    console.log("initial data: " + initialData + " stringified: " +
      JSON.stringify(initialData));
    metaBoardContext.playerStorageKey = playerKey;
    metaBoardContext.playerSymbol = playerSymbol;
    if (metaBoardContext.playerStorageKey === PLAYER_ONE_STORAGE_KEY) {
      metaBoardContext.opponentKey = PLAYER_TWO_STORAGE_KEY;
    } else {
      metaBoardContext.opponentKey = PLAYER_ONE_STORAGE_KEY;
    }
    metaBoardContext.opponentSymbol = String(opponentSymbol);
    metaBoardContext.isPlayerTurn =
      metaBoardContext.playerStorageKey === PLAYER_ONE_STORAGE_KEY;
    metaBoardContext.setAllBoardEnableStatus(
      metaBoardContext.playerStorageKey === PLAYER_ONE_STORAGE_KEY);
    console.log("this player's storage key: " + 
      metaBoardContext.playerStorageKey + " opponent symbol: " + opponentSymbol);

    // roomId, useful for reconnecting back to game 
    localStorage.setItem("player key", playerKey);
    localStorage.setItem("game room", roomId);
  });
}

export function processNewMove(metaBoardContext) {
  socket.on(NEW_MOVE, moveInfo => {
    console.log("client New move received. moveInfo id: " + moveInfo.moveId);

    const { moveId, boardId, gameStatus } = moveInfo;
    metaBoardContext.nextBoardToPlay = moveId;
    // this.placeTile(moveId);
    // there should be a more elegant way of doing this, save for later
    // if nextboardtoplay 
    metaBoardContext.metaGameState[moveId].isEnabled = true;
    // board will play this move (it's a prop)
    metaBoardContext.opponentMove = { tileId: moveId, boardId: boardId }; 
    metaBoardContext.isPlayerTurn = true;

    metaBoardContext.placeTile({ tileId: moveId, boardId: boardId }, false);

    // game over
    if (gameStatus !== null) {
      metaBoardContext.setEndGameStatus(gameStatus);
      metaBoardContext.setAllBoardEnableStatus(false);
    }
  });
}

socket.on("connect_error", error => {
  state.isConnected = false;
  console.log("failed to connect");
  state.errorMessage = 
      `error name: ${error.name}. error message: ${error.message}`;
});

socket.on("connect", () => {
  state.isConnected = true;
  console.log("client is connected. connexion status: " + state.isConnected);

  if (localStorage.getItem("game room") != null) {
    // need to move this socket back into the active game 
    // replay all the moves from the server side 
    // theoretically, the player storage key shouldn't have changed
    // but very flaky 
    const previousPlayerSide = localStorage.getItem("player key");
    const rejoinInfo = {
      playerKey: previousPlayerSide, gameId: localStorage.getItem("game room")
    };
    socket.emit("rejoin", rejoinInfo);
    // socket.on("replay", )
    // to replay the moves, would require the metaboard 
    // so would need to do this on mounted 
  }
});

socket.on("disconnect", () => {
  state.isConnected = false;
  console.log("client has disconnected");

  if (localStorage.getItem("game room") != null) {
    localStorage.removeItem("game room");
  }
});

export function setNextMoveInfo(boardInfo) {
  if (boardInfo.player !== PLAYER_ONE_STORAGE_KEY || 
      boardInfo.player !== PLAYER_TWO_STORAGE_KEY) {
    state.errorMessage = "NEXT PLAYER KEY DOESN'T EXIST";
    return;
  }

  state.nextMove.player = boardInfo.player;
  state.nextMove.gameStatus = boardInfo.gameStatus;

  if (0 <= boardInfo.moveId && boardInfo.moveId < NUM_TILES_PER_BOARD) {
    state.nextMove.tileId = boardInfo.moveId;
  } else {
    state.errorMessage = "TILE ID OUT OF BOUNDS";
  }

  state.errorMessage = null;
}