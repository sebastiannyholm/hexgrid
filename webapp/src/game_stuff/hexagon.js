const utils = require('./utils');

class Hexagon {
  constructor(cube) {
    this.id = utils.generateGUID();
    this.cube = cube;
    this.resources = 0;
    this.ownerId = utils.Constants.HexOwner.NONE;
    this.maxGrowth = 100;
    this.neighbors = [];
  }
}

module.exports = Hexagon;
