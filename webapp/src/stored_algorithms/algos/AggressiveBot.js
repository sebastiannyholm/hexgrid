// bot scripts cannot import modules as they will lose the reference when compiled by the server
const HexOwner = {
  NONE: 0,
  OWN: 1,
  OTHER: 2,
};

function turn(myCells) {
  // get all cells with enemy neighbors
  const attackerCells = myCells.filter((cell) => cell.neighbors.some((n) => n.owner !== HexOwner.OWN));

  var maxRes = 0;
  var attacker = null;
  for (let i = 0; i < attackerCells.length; i++) {
    if (attackerCells[i].resources > maxRes) {
      maxRes = attackerCells[i].resources;
      attacker = attackerCells[i];
    }
  }

  var minRes = 2000;
  var target = null;
  for (let i = 0; i < attacker.neighbors.length; i++) {
    if (attacker.neighbors[i].resources < minRes && attacker.neighbors[i].owner !== HexOwner.OWN) {
      minRes = attacker.neighbors[i].resources;
      target = attacker.neighbors[i];
    }
  }
  var transaction = {
    fromId: attacker.id,
    toId: target.id,
    transferAmount: attacker.resources - 1,
  };
  return transaction;
}

const name = 'AggressiveBot';

export default { name, turn };
