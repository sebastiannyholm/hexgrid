let lastGameUpdate = null;

function processGameUpdate(state) {
    console.log(state);
    lastGameUpdate = state;
}

function onGameOver() {
    console.log("game over");
}

function getCurrentState() {
    return lastGameUpdate;
}


export default {
    processGameUpdate,
    onGameOver,
    getCurrentState,
}