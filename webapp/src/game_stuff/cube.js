class Cube {
  constructor(x, y, z, withSelfReferencing = true) {
    if (Math.round(x + y + z) !== 0) throw 'cube coordinates must sum to 0';

    this.x = x;
    this.y = y;
    this.z = z;

    if (withSelfReferencing) {
      this.neighbors = [
        new Cube(this.x, this.y - 1, this.z + 1, false),
        new Cube(this.x + 1, this.y, this.z - 1, false),
        new Cube(this.x - 1, this.y + 1, this.z, false),
        new Cube(this.x, this.y + 1, this.z - 1, false),
        new Cube(this.x - 1, this.y, this.z + 1, false),
        new Cube(this.x + 1, this.y - 1, this.z, false),
      ];
      this.diagonals = [
        new Cube(this.x - 1, this.y - 1, this.z + 2, false),
        new Cube(this.x - 2, this.y + 1, this.z + 1, false),
        new Cube(this.x - 1, this.y + 2, this.z - 1, false),
        new Cube(this.x + 1, this.y + 1, this.z - 2, false),
        new Cube(this.x + 2, this.y - 1, this.z - 1, false),
        new Cube(this.x + 1, this.y - 2, this.z + 1, false),
      ];
    }
  }

  add(otherCube) {
    return new Cube(this.x + otherCube.x, this.y + otherCube.y, this.z + otherCube.z);
  }

  subtract(otherCube) {
    return new Cube(this.x - otherCube.x, this.y - otherCube.y, this.z - otherCube.z);
  }

  equals(otherCube) {
    return this.x === otherCube.x && this.y === otherCube.y && this.z === otherCube.z;
  }

  dist(otherCube) {
    // since a hexgrid is basically a slice/plane of a cubegrid
    // the distance is the manhattan distance of the cubegrid divided by 2
    return (Math.abs(this.x - otherCube.x) + Math.abs(this.y - otherCube.y) + Math.abs(this.z - otherCube.z)) / 2;
  }

  toString() {
    return 'Cube(' + this.x + ',' + this.y + ',' + this.z + ')';
  }

  /**
   * returns a cube with coordinates equal to 60 degrees counter clock-wise rotation of this cube coordinates
   */
  rotate60() {
    return new Cube(-this.y, -this.z, -this.x);
  }

  allRotations() {
    let rotatedCubes = [this];
    let rotatedCube = this.rotate60();
    while (!rotatedCube.equals(this)) {
      rotatedCubes.push(rotatedCube);
      rotatedCube = rotatedCube.rotate60();
    }
    return rotatedCubes;
  }
}

module.exports = Cube;
