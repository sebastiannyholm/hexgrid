// bot scripts cannot import modules as they will lose the reference when compiled by the server
const HexOwner = {
  NONE: 0,
  OWN: 1,
  OTHER: 2,
};


function turn(myCells) {

  const doStuff = function(source, target, resources, step) {
    console.log(step)

    console.log('source');
    console.log(source);

    console.log('target');
    console.log(target);

    console.log('transfer: ', resources);

    return {
      fromId: source.id,
      toId: target.id,
      transferAmount: resources
    };
  }

  let firstTurn = myCells.length === 1 && myCells[0].resources === 10;

  /////////////////////////////
  ////    Build cluster    ////
  /////////////////////////////
  let assignedCells = {};
  let clusters = {};
  for (let i = 0; i < myCells.length; i++) {
    let cell = myCells[i];

    if (cell.id in assignedCells) {
      continue;
    }

    let cluster = i;
    clusters[cluster] = [];
    clusters[cluster].push(cell);
    assignedCells[cell.id] = cluster;

    for (let j = 0; j < cell.neighbors.length; j++) {
      let neighbor = cell.neighbors[j];

      if (neighbor.owner !== HexOwner.OWN) {
        continue;
      }

      // If not yet assigned, continue, as this object does not contain the neighbor field
      if (!(neighbor.id in assignedCells)) {
        continue;
      }

      // If already in a cluster, but not the current, merge into the current
      if (assignedCells[neighbor.id] !== cluster) {

        let mergeCluster = assignedCells[neighbor.id];

        // If neighbor cluster is larger than the current, merge current into neighbor
        // I.e. swap clusters
        if (clusters[mergeCluster].length > clusters[cluster].length) {
          mergeCluster = cluster;
          cluster = assignedCells[neighbor.id];
        }

        for (let t = 0; t < clusters[mergeCluster].length; t++) {
          let mergeCell = clusters[mergeCluster][t];

          clusters[cluster].push(mergeCell);
          assignedCells[mergeCell.id] = cluster;
        }

        delete clusters[mergeCluster];
      }
    }
  }

  /////////////////////////////
  //  Find biggest cluster   //
  /////////////////////////////
  let maxClusterSize = 0;
  let maxClusterId = 0;
  for (let key in clusters) {
    let currentCluster = clusters[key];

    if (maxClusterSize < currentCluster.length) {
      maxClusterSize = currentCluster.length;
      maxClusterId = key;
    }
  }

  // Count how many of my own cells are neighbor for another cell
  let friendlyNeighbors = {};

  // All free and enemy neighbor cells
  let neighborCells = {};

  // Contains the neighbor cell with the most power, that belongs to me 
  let bestNeighbor = {};
  let worstNeighbor = {};

  // If no enemy cells are neighbors
  let secureFriends = [];
  
  // If enemy cells are neighbors
  let unsecureFriends = [];

  let freeCells = false;
  for (let i = 0; i < clusters[maxClusterId].length; i++) {
    let cell = clusters[maxClusterId][i];

    let insecure = 0;
    for (let j = 0; j < cell.neighbors.length; j++) {
      let neighbor = cell.neighbors[j];

      // If already mine, skip analysis
      if (neighbor.owner === HexOwner.OWN) {
        continue;
      }

      if (neighbor.owner === HexOwner.OTHER) {
        insecure++;
      }

      // Find worst neighbor of my own cell
      if (!(cell.id in worstNeighbor) || worstNeighbor[cell.id].resources < neighbor.resources) {
        worstNeighbor[cell.id] = neighbor;
      }

      // if we have already seen this neighbor from another cell, update info
      if (neighbor.id in friendlyNeighbors) {
        friendlyNeighbors[neighbor.id]++;

        if (bestNeighbor[neighbor.id].resources < cell.resources) {
          bestNeighbor[neighbor.id] = cell;
        }
        continue;
      }

      friendlyNeighbors[neighbor.id] = 1;
      bestNeighbor[neighbor.id] = cell;
      neighborCells[neighbor.id] = neighbor;

      if (neighbor.resources === 0) {
        freeCells = true;
      }
    }

    if (insecure === 0) {
      secureFriends.push(cell);
    } else if (cell.resources < 100) {
      unsecureFriends.push(cell);
    }
  }

  let maxFriendlyNeighbors = 0;
  let minEnemy = 500;

  let source = null;
  let target = null;

  for (let key in friendlyNeighbors) {
    if (freeCells) {
      // Take super-cell if free
      if (neighborCells[key].maxGrowth === 300 && neighborCells[key].resources === 0) {
        source = bestNeighbor[key];
        target = neighborCells[key];
        break;
      }

      // If no super-cell, take the free cell with the most neighbors of my own 
      if (maxFriendlyNeighbors < friendlyNeighbors[key] && neighborCells[key].resources === 0) {
        source = bestNeighbor[key];
        target = neighborCells[key];
        maxFriendlyNeighbors = friendlyNeighbors[key];
      }
      continue;
    }

    // If no free cells
    
    // Check if the current neighbor has more neighbors of my own than the previous
    if (maxFriendlyNeighbors < friendlyNeighbors[key]) {
      source = bestNeighbor[key];
      target = neighborCells[key];
      maxFriendlyNeighbors = friendlyNeighbors[key];
      minEnemy = neighborCells[key].resources;
      continue;
    }

    // If same amount of neighbors of my own, check if it requires less resources to take 
    if (maxFriendlyNeighbors === friendlyNeighbors[key]) {
      if (minEnemy > neighborCells[key].resources) {
        minEnemy = neighborCells[key].resources;

        source = bestNeighbor[key];
        target = neighborCells[key];
      }
    }
  }

  if (firstTurn || freeCells || clusters[maxClusterId].length === 1) {
    return doStuff(source, target, source.resources - 1, 'first');
  }

  let bestSupplyCell = null;
  let useSecureFriend = false;

  if (secureFriends.length > 0) {

    // If a secure super-cell has max, take that
    for (let i = 0; i < secureFriends.length; i++) {
      let cell = secureFriends[i];

      if (cell.resources === cell.maxGrowth && cell.maxGrowth === 300) {
        useSecureFriend = true;
        bestSupplyCell = cell;
        break;
      }
    }

    // If no super-cell available, check if secure none super-cell has max
    if (bestSupplyCell === null) {
      for (let i = 0; i < secureFriends.length; i++) {
        let cell = secureFriends[i];

        if (cell.resources === cell.maxGrowth && cell.maxGrowth === 100) {
          useSecureFriend = true;
          bestSupplyCell = cell;
        }
      }
    }

    // If no max is available, find best secure cell
    if (bestSupplyCell === null) {
      for (let i = 0; i < secureFriends.length; i++) {
        let cell = secureFriends[i];

        // Take the one with the most resources
        if (bestSupplyCell === null || bestSupplyCell.resources < cell.resources) {
          useSecureFriend = true;
          bestSupplyCell = cell;
        }
      }

      // Check if we have an unsecure power-cell with max power
      if (bestSupplyCell.resources < bestSupplyCell.maxGrowth) {
        for (let i = 0; i < clusters[maxClusterId].length; i++) {
          let cell = clusters[maxClusterId][i];

          if (cell.resources === cell.maxGrowth && cell.maxGrowth === 300 && cell in unsecureFriends) {
            bestSupplyCell = cell;
            useSecureFriend = false;
            break;
          }
        }
      }
    }
  }

  let backBestSupplyCell = bestSupplyCell;
  let backUseSecureFriend = useSecureFriend;
  // If no supply cell yet, we have no secure cells OR if the supply cell has less than 30 resources
  // Then take the cell with most resources
  if (bestSupplyCell === null || bestSupplyCell.resources < 30) {
    for (let i = 0; i < clusters[maxClusterId].length; i++) {
      let cell = clusters[maxClusterId][i];

      if (bestSupplyCell === null || bestSupplyCell.resources < cell.resources) {
        bestSupplyCell = cell;
        useSecureFriend = false;
      }
    }
  }

  // If we use a secure cell as source, but targets an unsecure cell as well, i.e. a cell with one or more enemies as neighbors.
  // In this case, find the unsecure cell with the least resources and set this as target
  if (unsecureFriends.length > 0 && useSecureFriend) {
    let unsecureTarget = null;
    let useThree = false;
    let useTwo = false;

    for (let i = 0; i < unsecureFriends.length; i++) {
      let cell = unsecureFriends[i];

      if (worstNeighbor[cell.id].resources < cell.resources) {
        continue;
      }

      if (cell.resources < 100 && friendlyNeighbors[cell.id] === 3 && (!useThree || useThree && cell.resources < unsecureTarget.resources)) {
        unsecureTarget = cell;
        useThree = true;
      }
      if (useThree) {
        continue;
      }

      if (cell.resources < 100 && friendlyNeighbors[cell.id] === 2 && (!useTwo || useTwo && cell.resources < unsecureTarget.resources)) {
        unsecureTarget = cell;
        useTwo = true;
      }
      if (useTwo) {
        continue;
      }

      // Find the weakest cell and protect it
      if (unsecureTarget === null || cell.resources < unsecureTarget.resources) {
        unsecureTarget = cell;
      }
    }

    if (unsecureTarget !== null) {

      if (maxFriendlyNeighbors < 4) {
        target = unsecureTarget;
        source = bestSupplyCell;
        console.log('useSecureFriend: ', useSecureFriend);
      } else {
        console.log("attack");
      }

      return doStuff(source, target, source.resources - 1, 'second');
    }
  }

  let resources = 0;
  let friends = 0;

  // Calculate the amount of resources we need to move
  for (let i = 0; i < source.neighbors.length; i++) {
    let neighbor = source.neighbors[i];

    if (neighbor.owner === HexOwner.OWN) {
      friends++;
    }
  }

  let minimumToLeaveBehind = 50;

  // If the source is secure move everything
  // Otherwise, if maxed up, move all - 99
  if (friends >= 5) {
    resources = source.resources - 1;
  } else if (source.resources - (source.maxGrowth - 100) >= minimumToLeaveBehind) {
    resources = source.resources - (minimumToLeaveBehind - 1);
  }

  // If we can't take a cell without having 100+ resources,
  // move resources to the source instead to prepare attack
  if (resources <= target.resources + minimumToLeaveBehind && target.resources > 0) {
    if (bestSupplyCell !== null && bestSupplyCell.id !== source.id) {
      target = source;
      source = bestSupplyCell;

      resources = 0;
      if (useSecureFriend) {
        console.log("Use secure");
        resources = source.resources - 1;
      } else if (source.resources - (source.maxGrowth - 100) >= minimumToLeaveBehind) {
        console.log("Use insecure");
        resources = source.resources - (minimumToLeaveBehind - 1);
      } else  if (backBestSupplyCell !== null) {
        console.log("Use backup");
        source = backBestSupplyCell;
        if (backUseSecureFriend) {
          console.log("Use secure");
          resources = source.resources - 1;
        } else if (source.resources - (source.maxGrowth - 100) >= minimumToLeaveBehind) {
          console.log("Use insecure");
          resources = source.resources - (minimumToLeaveBehind - 1);
        }
      } else {
        console.log("To bad!");
      }
    } else {
      console.log("No best support cell");
    }
  } else {
    console.log("gogogog");
  }

  return doStuff(source, target, resources, 'third');
}

const name = 'MakeItSafe2';

export default { name, turn };
