import React, { useState, useEffect } from 'react';
import './Game.css';
import WithSidebar from './Sidebar';
import { withRouter } from "react-router";

import Constants from '../constants.js'
import Scoreboard from './Scoreboard';
import Hexgrid from './Hexgrid';
import Loader from './Loader';
import Modal from './Modal';
import socketAPI from '../socket_api';



function GameLive(props) {
    const [hexgridOrientation, setHexgridOrientation] = useState(Constants.HexgridOrientation.POINTY);
    const [gameState, setGameState] = useState(null);
    const [socketId, setSocketId] = useState(null);
    const [winner, setWinner] = useState(null);

    // componentDidMount
    useEffect(() => {

        socketAPI.subscribeToGameState((currentState) => {
            setGameState(currentState);
        });

        socketAPI.subscribeToGameOver((winner) => {
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

    function connect() {
        socketAPI.connect((socketId) => {
            console.log("Connected to server on socket", socketId);
            setSocketId(socketId);
        });
    }

    function disconnect() {
        socketAPI.disconnect(() => {
            console.log("Disconnected from server");
            setSocketId(null);
        });
    }

    function joinGame() {
        console.log("Joining game");
        socketAPI.joinGame("UUUSER");
    }


    const gameSidebarElements = [
        <span key={0} className="sidebar-item interactable" disabled={!socketId} onClick={connect}>Connect to server (temp)</span>,
        <span key={2} className="sidebar-item interactable" disabled={!socketId} onClick={joinGame}>Join game</span>,
        <span key={1} className="sidebar-item interactable" disabled={socketId} onClick={disconnect}>Disconnect from server (temp)</span>,
        <span key={7} className="sidebar-item interactable" onClick={onSwitchHexgridOrientation}>Switch orientation</span>,
    ];

    function onSwitchHexgridOrientation() {
        setHexgridOrientation(hexgridOrientation === Constants.HexgridOrientation.FLAT ? Constants.HexgridOrientation.POINTY : Constants.HexgridOrientation.FLAT);
    }

    return (
        <WithSidebar
            sidebarElements={gameSidebarElements}
            content={gameState ? <div className="game" onClick={winner ? () => setWinner(null) : null}>
                <Hexgrid hexagons={gameState.hexagons} players={gameState.players} orientation={hexgridOrientation} />

                <div id="scoreboard-wrapper">
                    <Scoreboard rows={getPlayerData(gameState.players)} />
                </div>
                {winner ? <Modal headerText="Winner" bodyText={winner.name} footerText="Congratulations" /> : null}
            </div> : <Loader>Waiting for game to start...</Loader>}
        />
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

function getPlayerData(playerMap) {

    let playerData = Object.values(playerMap).map(player => ({
        color: player.ownedHexagonCount > 0 ? player.color : { bg: "grey", fg: "#404040" },
        data: {
            name: player.name,
            hexagons: player.ownedHexagonCount,
            resources: player.totalResources,
            roundsSurvived: player.roundsSurvived,
            exceptions: player.exceptions,
        }
    }))

    playerData.sort(function (p1, p2) {
        if (p1.data.hexagons === p2.data.hexagons) {
            if (p1.data.resources === p2.data.resources) {
                if (p1.data.roundsSurvived === p2.data.roundsSurvived)
                    return p1.data.exceptions - p2.data.exceptions;     	// sort by number of exceptions (lower = better)
                return p2.data.roundsSurvived - p1.data.roundsSurvived;	// sort by rounds survived if equal resources
            } else return p2.data.resources - p1.data.resources;			// sort by resouces if controlling equal hexagons
        } else return p2.data.hexagons - p1.data.hexagons;		        // sort by hexagon count predominantly
    });

    return playerData;
}

export default withRouter(GameLive);