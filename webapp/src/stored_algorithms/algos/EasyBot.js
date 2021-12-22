// bot scripts cannot import modules as they will lose the reference when compiled by the server
const HexOwner = {
  NONE: 0,
  OWN: 1,
  OTHER: 2,
};

function turn(myCells) {
  let attacker = null;
  let weakestEnemy = null;
  let minResources = 2000;
  myCells.forEach((cell) => {
    cell.neighbors.forEach((neighbor) => {
      if (neighbor.owner !== HexOwner.OWN && neighbor.resources < minResources) {
        attacker = cell;
        weakestEnemy = neighbor;
        minResources = neighbor.resources;
      }
    });
  });

  var transaction = {
    fromId: attacker.id,
    toId: weakestEnemy.id,
    transferAmount: attacker.resources - 1,
  };
  return transaction;
}

const name = 'EasyBot';

export default { name, turn };
