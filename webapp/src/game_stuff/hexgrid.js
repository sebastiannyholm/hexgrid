const Cube = require('./cube');
const Hexagon = require('./hexagon');
const utils = require('./utils');

const { TransactionError } = require('./exceptions');

const NeighborWraparound = {
  NONE: 0,
  WRAP: 1,
};

function getCubesInGrid(rings) {
  var cubesInGrid = [new Cube(0, 0, 0)];

  for (let r = 0; r < rings + 1; r++) {
    var x = 0,
      y = -r,
      z = +r;

    for (let i = 0; i < r; i++) {
      x += 1;
      z -= 1;
      cubesInGrid.push(new Cube(x, y, z));
    }
    for (let i = 0; i < r; i++) {
      y += 1;
      z -= 1;
      cubesInGrid.push(new Cube(x, y, z));
    }
    for (let i = 0; i < r; i++) {
      x -= 1;
      y += 1;
      cubesInGrid.push(new Cube(x, y, z));
    }
    for (let i = 0; i < r; i++) {
      x -= 1;
      z += 1;
      cubesInGrid.push(new Cube(x, y, z));
    }
    for (let i = 0; i < r; i++) {
      y -= 1;
      z += 1;
      cubesInGrid.push(new Cube(x, y, z));
    }
    for (let i = 0; i < r; i++) {
      x += 1;
      y -= 1;
      cubesInGrid.push(new Cube(x, y, z));
    }
  }
  return cubesInGrid;
}

/**
 * Creates and returns an array of hexagons, with neighbor associations
 * @param {Number} ringsInGrid Hexgrid size in terms of number of rings
 */
function _createHexgrid(ringsInGrid, neighborWraparound = NeighborWraparound.WRAP) {
  // create cubes/hexagons of this many rings
  const cubesInGrid = getCubesInGrid(ringsInGrid);
  const cubeToHex = cubesInGrid.reduce((acc, cube) => ({ ...acc, [cube.toString()]: new Hexagon(cube) }), {});
  let hexagons = Object.values(cubeToHex);

  let mirrorCenter = new Cube(2 * ringsInGrid + 1, -ringsInGrid - 1, -ringsInGrid);
  let mirrorCenters = mirrorCenter.allRotations();

  hexagons.forEach((hexagon) => {
    hexagon.cube.neighbors.forEach((neighborCube) => {
      if (neighborWraparound === NeighborWraparound.WRAP) {
        let nearbyMirrorCenter = mirrorCenters.find((centerCube) => centerCube.dist(neighborCube) <= ringsInGrid);
        if (nearbyMirrorCenter) {
          let mirroredNeighborCube = neighborCube.subtract(nearbyMirrorCenter);
          neighborCube = mirroredNeighborCube;
        }
      }

      let neighborHex = cubeToHex[neighborCube.toString()];
      if (neighborHex) {
        hexagon.neighbors.push(neighborHex.id);
      }
    });
  });

  return cubeToHex;
}

class Hexgrid {
  constructor(playerIds, neighborWraparound = NeighborWraparound.WRAP) {
    let numRings = 6; // minimum grid size
    let playerRings = 1; // number of rings containing player cells
    let roomForPlayers = 1 + 6 * playerRings; // room for center + the capacity of the ring

    // increase rings by 4 until enough room for all players
    while (roomForPlayers < playerIds.length) {
      numRings += 4; // boundary ring, mining field ring, player ring (+2 mining field cells), other side of mining field ring
      playerRings++; // 4 more rings equate to one more player ring
      roomForPlayers += 6 * playerRings; // each ring of players increase capacity by six of previous ring of player
    }

    this.cubeToHex = _createHexgrid(numRings, neighborWraparound);
    this.hexagons = Object.values(this.cubeToHex);
    this.hexagonIdDict = this.hexagons.reduce((acc, hex) => ({ ...acc, [hex.id]: hex }), {});

    //// ------------------------------
    //// Assign players to hexagons
    //// ------------------------------

    let playerHexagon = this.cubeToHex[new Cube(0, 0, 0).toString()];
    playerHexagon.resources = 10;
    playerHexagon.ownerId = playerIds[0];

    // init mining field ranging from 0-100
    var miningField = Array.from({ length: 6 }, () => Math.floor(Math.random() * 100));

    // make mining field around center hexagon
    playerHexagon.neighbors.forEach((hexId, index) => {
      this.hexagonIdDict[hexId].resources = miningField[index];
    });

    // make a supercell beyond each player's mining field (a hexagon diagonal to the player cell)
    this.cubeToHex[playerHexagon.cube.diagonals[0].toString()].maxGrowth = 300;

    // rotations of 15/30 degree increments by doing two 60 degree rotations with different starting point
    var nextPlayerCube = new Cube(4, -4, 0);
    var playersAssigned = 1;

    // assign one hexagon according to restrictions for each other player
    for (let currentPlayerRing = 1; currentPlayerRing <= playerRings; currentPlayerRing++) {
      var playerCubes = [];
      let playerCube = nextPlayerCube;

      // each player ring beyond the first allows for a new player cube offset to rotate 60 degrees around the ring
      // each new offset is 4 hexagons away from the current offset (8 cube unit)
      // each offset beyond the first is effectively curring the degrees of rotation in half
      // e.g. 60 degree rotations with 1 offset  = 60 degrees
      //      60 degree rotations with 2 offsets = 30 degrees
      //      60 degree rotations with 3 offsets = 15 degrees
      for (let numPlayerOffset = currentPlayerRing - 1; numPlayerOffset >= 0; numPlayerOffset--) {
        // extend array - "..." notation fails for large arrays (> 100k entries), we should be okay
        playerCubes.push(...playerCube.allRotations());

        // update player offset after all rotations have been performed with current offset
        playerCube = playerCube.add(new Cube(-4, 0, 4));
      }

      for (let i = 0; i < playerCubes.length && playersAssigned < playerIds.length; i++) {
        let playerHexagon = this.cubeToHex[playerCubes[i].toString()];
        playerHexagon.resources = 10;
        playerHexagon.ownerId = playerIds[playersAssigned];
        playersAssigned++;

        // assign the neighbor hexagons resources equal to the mining field
        // shuffle mining field for each player
        utils.shuffleArray(miningField);

        playerHexagon.neighbors.forEach((hexId, index) => {
          this.hexagonIdDict[hexId].resources = miningField[index];
        });

        // make a supercell beyond each player's mining field (a hexagon diagonal to the player cell)
        this.cubeToHex[playerHexagon.cube.diagonals[0].toString()].maxGrowth = 300;
      }
      // move player offset to the next player ring
      nextPlayerCube = nextPlayerCube.add(new Cube(4, -4, 0));
    }
  }

  performTransactions(validPlayerTransactions) {
    validPlayerTransactions.forEach((validPlayerTransaction) => {
      // subtract resources being transferred
      this.hexagonIdDict[validPlayerTransaction.transaction.fromId].resources -=
        validPlayerTransaction.transaction.transferAmount;
    });

    validPlayerTransactions.forEach((validPlayerTransaction) => {
      // add resources being transfered
      this._addResources(
        validPlayerTransaction.playerId,
        validPlayerTransaction.transaction.toId,
        validPlayerTransaction.transaction.transferAmount,
      );
    });
  }

  _addResources(playerId, toHexId, amount) {
    let toHexagon = this.hexagonIdDict[toHexId];

    // increase resources if already owned
    if (toHexagon.ownerId === playerId) {
      toHexagon.resources += amount;
    } else {
      toHexagon.resources -= amount;
      // update owner if transferring enough resources to overtake
      if (toHexagon.resources < 0) {
        toHexagon.resources *= -1; // to get back to positive
        toHexagon.ownerId = playerId;
      } else if (toHexagon.resources === 0) {
        toHexagon.ownerId = utils.Constants.HexOwner.NONE; // no one owns the hexagon
      }
    }
  }

  validatePlayerTransaction(playerId, transaction) {
    const fromHexagon = this.hexagonIdDict[transaction.fromId];
    const toHexagon = this.hexagonIdDict[transaction.toId];

    if (!fromHexagon || !toHexagon) {
      throw new TransactionError('Invalid hexagons in transaction', transaction);
    }

    if (fromHexagon === toHexagon) throw new TransactionError('Cannot transfer to same cell', transaction);

    if (fromHexagon.ownerId === toHexagon.ownerId && !this._ownedPathExists(transaction.fromId, transaction.toId))
      throw new TransactionError('Hexagons are not connected', transaction);

    if (transaction.transferAmount < 0) throw new TransactionError('Cannot transfer negative amounts', transaction);
    else if (fromHexagon.resources < transaction.transferAmount)
      throw new TransactionError('Not enough resources to transfer', transaction);
    else if (fromHexagon.ownerId !== playerId)
      throw new TransactionError('Cannot transfer resources from cells you do not own', transaction);
    else if (fromHexagon.ownerId !== toHexagon.ownerId && !fromHexagon.neighbors.includes(toHexagon.id))
      throw new TransactionError('Cannot transfer to non-neighboring cells when attacking', transaction);
    else if (!Number.isInteger(transaction.transferAmount))
      throw new TransactionError('Transfer amount is not an integer', transaction);

    return {
      playerId: playerId,
      transaction: transaction,
    };
  }

  /**
   * Runs a DFS search for a path between the two hexagons, owned by the same player.
   * Returns true if such a path exists, otherwise false
   */
  _ownedPathExists(startHexId, endHexId) {
    var stack = [];
    var explored = new Set();

    stack.push(startHexId);

    while (stack.length > 0) {
      var currentHexId = stack.pop();
      explored.add(currentHexId);

      if (currentHexId === endHexId)
        // search concluded, path exists
        return true;

      this.hexagonIdDict[currentHexId].neighbors
        .filter(
          (neighborId) =>
            !explored.has(neighborId) &&
            this.hexagonIdDict[neighborId].ownerId === this.hexagonIdDict[endHexId].ownerId,
        )
        .forEach((neighborId) => {
          stack.push(neighborId);
        });
    }
    return false;
  }

  growPlayerCells() {
    this.hexagons.forEach((hexagon) => {
      if (hexagon.ownerId !== utils.Constants.HexOwner.NONE && hexagon.resources < hexagon.maxGrowth) {
        hexagon.resources++;
      }
    });
  }

  getPlayerCells(playerId) {
    // playerCell 	-> id, resources, maxGrowth, neighborCells
    // neighborCell -> id, resources, owner, maxGrowth

    var playerCells = [];
    this.hexagons.forEach((hexagon) => {
      if (hexagon.ownerId === playerId) {
        var neighborCells = [];

        hexagon.neighbors.forEach((hexId) => {
          let neighborHex = this.hexagonIdDict[hexId];

          let hexOwner = utils.Constants.HexOwner.NONE;
          if (neighborHex.ownerId === playerId) hexOwner = utils.Constants.HexOwner.OWN;
          else if (neighborHex.ownerId !== utils.Constants.HexOwner.NONE) hexOwner = utils.Constants.HexOwner.OTHER;

          neighborCells.push({
            id: neighborHex.id,
            resources: neighborHex.resources,
            owner: hexOwner,
            maxGrowth: neighborHex.maxGrowth,
          });
        });

        playerCells.push({
          id: hexagon.id,
          resources: hexagon.resources,
          // owner: HexOwner.OWN,
          maxGrowth: hexagon.maxGrowth,
          neighbors: neighborCells,
        });
      }
    });

    return playerCells;
  }
}

export default Hexgrid;
