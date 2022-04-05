import React, { useState, useEffect } from 'react';
import '../styles/Game.css';
import WithSidebar from './Sidebar';
import { withRouter } from 'react-router';

import Constants from '../constants.js';
import Scoreboard from './Scoreboard';
import { default as HexgridComponent } from './Hexgrid';
import Loader from './Loader';
import utils from '../game_stuff/utils';
import Game from '../game_stuff/game';
import Modal from './Modal';
import { TooManyPlayersException } from '../game_stuff/exceptions';

let game;

const GAME_INTERVAL_TIMEOUT_MILLIS = 50;

function getPlayerData(playerMap) {
  let playerData = Object.values(playerMap).map((player) => ({
    color: player.isAlive() ? player.color : { bg: 'grey', fg: '#404040' },
    data: {
      name: player.name,
      hexagons: player.ownedHexagonCount,
      resources: player.totalResources,
      roundsSurvived: player.roundsSurvived,
      exceptions: player.exceptions,
    },
  }));

  playerData.sort(function (p1, p2) {
    if (p1.data.hexagons === p2.data.hexagons) {
      if (p1.data.resources === p2.data.resources) {
        if (p1.data.roundsSurvived === p2.data.roundsSurvived) return p1.data.exceptions - p2.data.exceptions; // sort by number of exceptions (lower = better)
        return p2.data.roundsSurvived - p1.data.roundsSurvived; // sort by rounds survived if equal resources
      } else return p2.data.resources - p1.data.resources; // sort by resouces if controlling equal hexagons
    } else return p2.data.hexagons - p1.data.hexagons; // sort by hexagon count predominantly
  });

  return playerData;
}

function GameOffline(props) {
  const [hexgridOrientation, setHexgridOrientation] = useState(Constants.HexgridOrientation.POINTY);
  const [gameInterval, setGameInterval] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [winner, setWinner] = useState(null);

  // componentDidMount
  useEffect(() => {
    newGame();
    return () => clearInterval(gameInterval);
  }, []);

  function newGame() {
    game = new Game();
    console.log(props);
    if (props.location.state && props.location.state.playerCodes) {
      props.location.state.playerCodes.forEach((player) => {
        try {
          game.addPlayer(utils.generateGUID(), player.name, player.codeString);
        } catch (TooManyPlayersException) {
          console.log('Too many players - cannot add more players to game');
        }
      });
    }
    game.setup();
    setGameState(game.getCurrentState());
    console.log(game);
  }

  const gameSidebarElements = [
    <span key={0} className="sidebar-item interactable" onClick={onPlay}>
      Play
    </span>,
    <span key={1} className="sidebar-item interactable" onClick={onStop}>
      Stop
    </span>,
    <span key={2} className="sidebar-item interactable" onClick={onNextStep}>
      Next step
    </span>,
    // <span key={3} className="sidebar-item interactable" onClick={onPrevStep}>Prev step</span>,
    // <span key={4} className="sidebar-item interactable" onClick={onSpeedUp}>Speed up</span>,
    // <span key={5} className="sidebar-item interactable" onClick={onSpeedDown}>Speed down</span>,
    <span key={6} className="sidebar-item interactable" onClick={onRestart}>
      Restart
    </span>,
    <span key={7} className="sidebar-item interactable" onClick={onSwitchHexgridOrientation}>
      Switch orientation
    </span>,
  ];

  function onNextStep() {
    if (game && !game.isGameOver()) {
      Object.values(game.players).forEach((player) => {
        if (player.isAlive()) {
          try {
            let transaction = player.turn(game.getPlayerCells(player.id));
            game.handleTransaction(player.id, transaction);
          } catch (e) {
            console.log(e);
            player.exceptions++;
          }
        }
      });

      game.update();
      setGameState(game.getCurrentState());
    }
  }

  function onPlay() {
    if (!gameInterval) {
      let interval = setInterval(() => {
        onNextStep();
        if (game && game.isGameOver()) {
          clearInterval(interval);
          setGameInterval(null);
          setWinner(game.getWinner());
        }
      }, GAME_INTERVAL_TIMEOUT_MILLIS);

      setGameInterval(interval);
    }
  }

  function onStop() {
    clearInterval(gameInterval);
    setGameInterval(null);
  }

  function onRestart() {
    newGame();
  }

  function onSwitchHexgridOrientation() {
    setHexgridOrientation(
      hexgridOrientation === Constants.HexgridOrientation.FLAT
        ? Constants.HexgridOrientation.POINTY
        : Constants.HexgridOrientation.FLAT,
    );
  }

  return (
    <WithSidebar
      sidebarElements={gameSidebarElements}
      content={
        gameState ? (
          <div className="game" onClick={winner ? () => setWinner(null) : null}>
            {game && game.players && <Scoreboard rows={getPlayerData(game.players)} />}
            <HexgridComponent
              hexagons={gameState.hexagons}
              players={gameState.players}
              orientation={hexgridOrientation}
            />
            {winner ? <Modal headerText="Winner" bodyText={winner.name} footerText="Congratulations" /> : null}
          </div>
        ) : (
          <Loader>Loading game...</Loader>
        )
      }
    />
  );
}

export default withRouter(GameOffline);
