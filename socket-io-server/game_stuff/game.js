const Hexgrid = require("./hexgrid");
const Player = require("./player");
const utils = require('./utils');

class Game {
    constructor() {
        this.sockets = {};
        this.players = {};
    }

    setup() {
        this.hexgrid = new Hexgrid(Object.keys(this.players));
        this._updatePlayerStats();
    }

    addPlayer(socket, username) {
        if (this.hexgrid) throw new Error("Cannot add players to an ongoing game");
        if (Object.values(this.players).length >= utils.Constants.PlayerColors.length) throw new Error("Maximum players reached");

        this.sockets[socket.id] = socket;
        this.players[socket.id] = new Player(socket.id, username, utils.Constants.PlayerColors[Object.values(this.players).length]);
    }

    removePlayer(socket) {
        delete this.sockets[socket.id];
        delete this.players[socket.id];
    }

    handleTransaction(socket, transaction) {
        if (this.players[socket.id]) {
            this.players[socket.id].setTransaction(transaction);
        }
    }

    getPlayerStats(socket) {
        return {
            name: this.players[socket.id].name,
            hexagons: this.players[socket.id].ownedHexagonCount,
            resources: this.players[socket.id].totalResources,
            roundsSurvived: this.players[socket.id].roundsSurvived,
            exceptions: this.players[socket.id].exceptions
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
            player.roundsSurvived++;
            player.ownedHexagonCount = this.hexgrid.hexagons.filter(hex => hex.ownerId === player.id).length;
            player.totalResources = this.hexgrid.hexagons.reduce((acc, hex) => (
                hex.ownerId === player.id ? acc + hex.resources : acc
            ), 0);
        });
    }

    getPlayerCells(socket) {
        return this.hexgrid.getPlayerCells(socket.id);
    }
}

module.exports = Game;