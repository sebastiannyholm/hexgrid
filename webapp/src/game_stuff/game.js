import Hexgrid from './hexgrid';
const Player = require("./player");
const utils = require('./utils');

class Game {
    constructor() {
        this.players = {};
    }

    setup() {
        this.hexgrid = new Hexgrid(Object.keys(this.players));

        // set initial player stats
        Object.values(this.players).forEach(player => {
            player.ownedHexagonCount = this.hexgrid.hexagons.filter(hex => hex.ownerId === player.id).length;
            player.totalResources = this.hexgrid.hexagons.reduce((acc, hex) => (
                hex.ownerId === player.id ? acc + hex.resources : acc
            ), 0);
        });
    }

    addPlayer(playerId, username, codeString) {
        if (this.hexgrid) throw new Error("Cannot add players to an ongoing game");
        if (Object.values(this.players).length >= utils.Constants.PlayerColors.length) throw new Error("Maximum players reached");

        this.players[playerId] = new Player(playerId, username, codeString, utils.Constants.PlayerColors[Object.values(this.players).length]);
    }

    removePlayer(playerId) {
        delete this.players[playerId];
    }

    handleTransaction(playerId, transaction) {
        if (this.players[playerId]) {
            this.players[playerId].setTransaction(transaction);
        }
    }

    getPlayerStats(playerId) {
        return {
            name: this.players[playerId].name,
            hexagons: this.players[playerId].ownedHexagonCount,
            resources: this.players[playerId].totalResources,
            roundsSurvived: this.players[playerId].roundsSurvived,
            exceptions: this.players[playerId].exceptions
        };
    }

    getCurrentState() {
        // deep copy objects, expensive but needed as react wont see an update to state otherwise
        // doesn't copy class functions, so beware if those are needed
        return {
            hexagons: JSON.parse(JSON.stringify(this.hexgrid.hexagons)),
            players: JSON.parse(JSON.stringify(this.players))
        }
    }

    /**
     * Returns true if all hexagons in the hexgrid have the same owner, otherwise false
     */
    isGameOver() {
        return this.hexgrid.hexagons.every(hexagon => this.hexgrid.hexagons[0].ownerId === hexagon.ownerId);
    }

    getWinner() {
        if (this.isGameOver()) {
            return Object.values(this.players).find(player => player.isAlive());
        }
        return "No winner yet";
    }

    update() {
        if (this.isGameOver()) return;

        var validPlayerTransactions = [];
        Object.values(this.players).forEach(player => {
            if (player.isAlive()) {
                try {
                    validPlayerTransactions.push(this.hexgrid.validatePlayerTransaction(player.id, player.transaction));

                } catch (e) {
                    console.log(e);
                    player.exceptions++;
                    return;
                }
            }
        });

        this.hexgrid.performTransactions(validPlayerTransactions);
        this.hexgrid.growPlayerCells();
        this._updatePlayerStats();
    }

    _updatePlayerStats() {
        Object.values(this.players).forEach(player => {
            if (player.isAlive()) {
                player.roundsSurvived++;
                player.ownedHexagonCount = this.hexgrid.hexagons.filter(hex => hex.ownerId === player.id).length;
                player.totalResources = this.hexgrid.hexagons.reduce((acc, hex) => (
                    hex.ownerId === player.id ? acc + hex.resources : acc
                ), 0);
            }
        });
    }

    getPlayerCells(playerId) {
        return this.hexgrid.getPlayerCells(playerId);
    }
}
export default Game;