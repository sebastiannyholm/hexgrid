const io = require("socket.io")();
const Game = require("./game_stuff/game")
const port = process.env.PORT || 4001;

let clients = {};
// -------
let gameCountdownTimeout;
let roundTimeout;
let roundCount = 0;
const TIMEOUT_ROUND = 3000;
const TIMEOUT_GAME_START = 10000;

let game = new Game();
let gameStates = [];
let tookTurn = [];

// START GAME

function startGame() {
	console.log("Setting up game");
	game.setup();
	console.log("Game started");
	lastUpdate = new Date().getTime();
	nextRound();
}

function startGameCountdown() {
	console.log("Game starting in", TIMEOUT_GAME_START, "millis");
	gameCountdownTimeout = setTimeout(() => {
		startGame();
	}, TIMEOUT_GAME_START);
}

function nextRound() {
	requestPlayerTurns();

	// console.log("Concluding round in", TIMEOUT_ROUND, "millis");
	roundTimeout = setTimeout(() => {
		concludeRound();
	}, TIMEOUT_ROUND);
}

function requestPlayerTurns() {
	// console.log("Requesting player turns");
	Object.values(game.sockets).forEach(socket => {
		socket.emit('your_turn', game.getPlayerCells(socket));
	});
}

function concludeRound() {
	roundCount++;
	if (roundCount % 100 === 0) console.log("round", roundCount);
	game.update();

	// gameStates.push(game.getCurrentState())

	// TODO: store state in array of states and only emit state in a controlled manner(server tick rate)
	Object.values(clients).forEach(socket => {
		socket.emit('game_state', {
			hexagons: game.hexgrid.hexagons,
			players: game.players
		});
	});


	if (game.isGameOver() || roundCount >= 1000) {
		console.log("Game over after", roundCount, "rounds. Winner is", game.getWinner());
		io.sockets.emit('game_over', game.getWinner());
		resetGame();

		// let updateInterval = setInterval(() => {
		// 	if (gameStates.length === 0) {
		// 		clearInterval(updateInterval);
		// 		resetGame();
		// 	} else {
		// 		Object.values(clients).forEach(socket => {
		// 			socket.emit('game_state', gameStates.splice(0, 1)[0]);
		// 		});
		// 	}
		// }, 300);
	} else {
		nextRound();
	}
}

function resetGame() {
	console.log("Reset game");
	roundCount = 0;
	game = new Game()
	gameCountdownTimeout = null;
}

io.on('connection', function (socket) {
	console.log('A client connected ' + socket.id);
	clients[socket.id] = socket;

	socket.on('turn', function (transaction) {
		game.handleTransaction(socket, transaction);

		if (!tookTurn.includes(socket)) {
			tookTurn.push(socket);
		} else {
			console.log("Player", socket.id, "already took turn");
		}

		// clear round timeout and conclude round immediately if all players submitted their turn 
		if (tookTurn.length === Object.keys(game.players).length) {
			tookTurn = [];
			clearTimeout(roundTimeout);
			concludeRound();
		}

	})

	socket.on('join_game', function (username) {
		try {
			game.addPlayer(socket, username);
		} catch (e) {
			console.log("addPlayer error:", e);
		}
		if (!gameCountdownTimeout) {
			startGameCountdown();
		}
	});

	socket.on('disconnect', function () {
		console.log('A player disconnected');
		delete clients[socket.id];
		game.removePlayer(socket);
	});

});

io.listen(port);
console.log("Listening on port " + port);