import io from "socket.io-client";
const ENDPOINT = "http://127.0.0.1:4001";
const socket = io(ENDPOINT, {
    autoConnect: false
});

function connect(callback) {
    socket.on('connect', () => callback(socket.id));
    socket.connect();
}

function disconnect(callback) {
    socket.on('disconnect', () => callback());
    socket.disconnect();
}

//---------------------

function joinGame(username) {
    socket.emit('join_game', username);
}

function subscribeToTurn(callback) {
    socket.on('your_turn', data => callback(data));
}

function takeTurn(content) {
    socket.emit('turn', content);
}

function subscribeToGameState(callback) {
    socket.on('game_state', newGameState => callback(newGameState));
}

function subscribeToGameOver(callback) {
    socket.on('game_over', winner => callback(winner));
}

export default {
    connect,
    disconnect,
    joinGame,
    subscribeToTurn,
    takeTurn,
    subscribeToGameState,
    subscribeToGameOver,
}