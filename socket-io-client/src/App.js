import React, { useState, useEffect } from "react";
import socketAPI from './api';



function App() {
	const [gameState, setGameState] = useState(null);
	const [winner, setWinner] = useState(null);


	useEffect(() => {
		socketAPI.subscribeToGameState((currentState) => {
			setGameState(currentState);
		})

		socketAPI.subscribeToGameOver((winner) => {
			console.log("Winner is ");
			console.log(winner);
			setWinner(winner);
		});


		// TODO: only do this once (despite many join game, only 1-1 relation between game and turn data sub)
		console.log("Subscribing to turn data");
		socketAPI.subscribeToTurn((playerCells) => {
			let transaction = calculateTransaction(playerCells);
			// console.log(playerCells)
			// console.log(transaction)
			socketAPI.takeTurn(transaction);
		});


	}, []);


	useEffect(() => {
	}, [gameState]);

	function joinGame() {
		console.log("Joining game");
		socketAPI.joinGame(Math.random() < 0.5 ? "User1" : "User2");
	}

	function connectToServer() {
		socketAPI.connect((socketId) => {
			console.log("Connected to server on socket", socketId);
		});
	}

	function disconnect() {
		socketAPI.disconnect(() => {
			console.log("Disconnected from server");
		});
	}

	return (
		<div>
			<button onClick={connectToServer}>Connect</button>
			<button onClick={disconnect}>Disconnect</button>
			<button onClick={joinGame}>Join Game</button>
			<span>{winner ? "Winner is " + winner : "Game is ongoing"}</span>
		</div>
	);
}

// required reference to execute code
const HexOwner = {
	NONE: 0, OWN: 1, OTHER: 2
}
function calculateTransaction(playerCells) {
	const codeString = localStorage.getItem('editorCode');
	const turnFunction = eval('(' + codeString + ')');
	const transaction = turnFunction(playerCells);
	return transaction;
}

export default App;
