import React, { useState } from 'react';
import '../styles/PlayerSelect.css';
import WithSidebar from './Sidebar';
import { withRouter } from 'react-router';
import { Redirect } from 'react-router-dom';

import Constants from '../constants.js';

import AggressiveBot from '../stored_algorithms/algos/AggressiveBot';
import MediumBot from '../stored_algorithms/algos/MediumBot';
import DefaultBot from '../stored_algorithms/algos/DefaultBot';
import EasyBot from '../stored_algorithms/algos/EasyBot';
import twSupply from '../stored_algorithms/algos/twSupply';
import MakeItSafe from '../stored_algorithms/algos/MakeItSafe';

function getActivePlayers(availablePlayers) {
  var players = [];
  availablePlayers.forEach((player) => {
    for (let i = 0; i < player.count; i++) {
      players.push({
        name: player.name,
        codeString: player.codeString,
      });
    }
  });
  return players;
}

function getSelectedPlayerCount(availablePlayers) {
  var sum = 0;
  availablePlayers.forEach((player) => {
    sum += player.count;
  });
  return sum;
}

function Versus(props) {
  let playerName = props.location.state
    ? props.location.state.playerName
    : localStorage.getItem(Constants.LOCAL_STORAGE_PLAYER_NAME);
  if (!playerName) playerName = Constants.defaultPlayerName;

  let playerCode = props.location.state
    ? props.location.state.playerCode
    : localStorage.getItem(Constants.LOCAL_STORAGE_EDITOR_CODE);
  if (!playerCode) playerCode = Constants.defaultEditorCode;

  const players = [
    { name: playerName, codeString: playerCode, count: 1 },
    { name: DefaultBot.name, codeString: DefaultBot.turn.toString(), count: 0 },
    { name: MediumBot.name, codeString: MediumBot.turn.toString(), count: 0 },
    {
      name: AggressiveBot.name,
      codeString: AggressiveBot.turn.toString(),
      count: 0,
    },
    { name: EasyBot.name, codeString: EasyBot.turn.toString(), count: 0 },
    { name: twSupply.name, codeString: twSupply.turn.toString(), count: 0 },
    { name: MakeItSafe.name, codeString: MakeItSafe.turn.toString(), count: 0 },
  ];

  const [availablePlayers, setAvailablePlayers] = useState(players);
  const [redirect, setRedirect] = useState(null);

  function redirectGame() {
    // minimum of 1 player needed to start a game
    if (
      getSelectedPlayerCount(availablePlayers) >= 1 ||
      getSelectedPlayerCount(availablePlayers) > Constants.PLAYER_COLORS
    ) {
      setRedirect('/game');
      // could also set local storage players here
    } else {
      console.log('Minimum 1 player required to start a game');
    }
  }

  function updatePlayerCount(idx, newCount) {
    if (newCount >= 0) {
      availablePlayers[idx].count = newCount;
      const updatedPlayers = [...availablePlayers];
      setAvailablePlayers(updatedPlayers);
    }
  }

  function resetPlayerCounts() {
    setAvailablePlayers(players);
  }

  return redirect ? (
    <Redirect
      to={{
        pathname: redirect,
        state: {
          playerCodes: getActivePlayers(availablePlayers),
        },
      }}
    />
  ) : (
    <WithSidebar
      sidebarElements={[
        <span key={0} className="sidebar-item interactable" onClick={redirectGame}>
          Start game
        </span>,
      ]}
      content={
        <div className="content padding-border">
          <Header
            numUniquePlayers={availablePlayers.filter((player) => player.count > 0).length}
            numTotalPlayers={availablePlayers.reduce((acc, player) => acc + player.count, 0)}
            onResetCount={() => resetPlayerCounts()}
          />
          <div className="players">
            {availablePlayers.map((player, idx) => (
              <Player
                key={player.name}
                name={player.name}
                count={player.count}
                onCountChange={(newCount) => updatePlayerCount(idx, newCount)}
                onResetCount={() => updatePlayerCount(idx, 0)}
              />
            ))}
          </div>
        </div>
      }
    />
  );
}

const Player = ({ name, count, onCountChange, onResetCount }) => {
  return (
    <div className="player">
      <div className="player-name">
        <a className="remove-player" onClick={onResetCount}>
          ✖
        </a>
        {name}
      </div>
      <div className="player-counter">
        <Counter onChange={onCountChange} count={count} />
      </div>
    </div>
  );
};

const Counter = ({ onChange, count }) => {
  function handleWheelUpdate(event) {
    if (event.deltaY < 0) {
      onChange(count + 1); // scroll up = increment count
    } else if (event.deltaY > 0) {
      onChange(count - 1); // scroll down = decrement count
    }
  }

  return (
    <div className="counter">
      <button className="counter-action decrement" onClick={() => onChange(count - 1)}>
        -
      </button>
      <div className="counter-count" onWheel={handleWheelUpdate}>
        {count}
      </div>
      <button className="counter-action increment" onClick={() => onChange(count + 1)}>
        +
      </button>
    </div>
  );
};

const Header = ({ numUniquePlayers, numTotalPlayers, onResetCount }) => {
  return (
    <div className="header">
      <h1>Player selection</h1>
      <PlayerCount numUniquePlayers={numUniquePlayers} numTotalPlayers={numTotalPlayers} onResetCount={onResetCount} />
    </div>
  );
};

const PlayerCount = ({ numUniquePlayers, numTotalPlayers, onResetCount }) => {
  return (
    <div className="player-counter">
      <table className="counts">
        <tbody>
          <tr>
            <td>Unique Players:</td>
            <td>{numUniquePlayers}</td>
          </tr>
          <tr>
            <td>Total players:</td>
            <td>{numTotalPlayers}</td>
          </tr>
        </tbody>
      </table>
      <div className="reset">
        <button onClick={onResetCount}>Reset</button>
      </div>
    </div>
  );
};

export default withRouter(Versus);
