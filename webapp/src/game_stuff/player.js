const HexOwner = {
  NONE: 0,
  OWN: 1,
  OTHER: 2,
};

class Player {
  constructor(id, name, codeString, color) {
    this.id = id;
    this.name = name;
    this.color = color;
    this.ownedHexagonCount = 0;
    this.totalResources = 0;
    this.roundsSurvived = 0;
    this.exceptions = 0;
    this.transaction = null;

    try {
      this.turnFunction = eval('(' + codeString + ')'); // evauluate the code string as a js function
    } catch (e) {
      throw new Error('Could not compile turn function');
    }
  }

  isAlive() {
    return this.ownedHexagonCount > 0;
  }

  setTransaction(transaction) {
    this.transaction = transaction;
  }

  turn(playerCells) {
    if (this.turnFunction) {
      return this.turnFunction(playerCells);
    }
  }
}

module.exports = Player;
