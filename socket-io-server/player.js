class Player {
    constructor(id, username, color) {
        this.id = id;
        this.username = username;
        this.color = color;
        this.hexagonCount = 0;
        this.resources = 0;
        this.roundsSurvived = 0;
    }

    isAlive() {
        return this.resources <= 0;
    }

    update(hexagons) {
        const ownedHexagons = hexagons.filter(hexagon => hexagon.ownerId == this.id);

        this.hexagonCount = ownedHexagons.length;
        this.resources = ownedHexagons.reduce((acc, hex) => acc + hex.resources, 0);
        this.roundsSurvived++;
    }
}


export default Player;