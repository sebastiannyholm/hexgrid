class Player {
    constructor(id, name, color) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.ownedHexagonCount = 0;
        this.totalResources = 0;
        this.roundsSurvived = 0;
        this.exceptions = 0;
        this.transaction = null;
    }

    isAlive() {
        return this.ownedHexagonCount > 0;
    }

    setTransaction(transaction) {
        this.transaction = transaction;
    }
}

module.exports = Player;