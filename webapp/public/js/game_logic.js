





var gameTimeMaxMillis = 3 * 1000;


var gameAborted = false;

/////////////////////
// SETUP VARIABLES
/////////////////////

var Orientation = {
	FLAT: 0, POINTY: 1
}

var HexOwner = {
	NONE: 0, OWN: 1, OTHER: 2
}

var NeighborWraparound = {
	NONE: 0, WRAP: 1
}

var cubeNeighbors = [
	{x:0, y:-1, z:+1}, {x:+1, y:0, z:-1}, {x:-1, y:+1, z:0}, 
	{x:0, y:+1, z:-1}, {x:-1, y:0, z:+1}, {x:+1, y:-1, z:0}
];

var cubeDiagonals = [
	{x:-1, y:-1, z:+2}, {x:-2, y:+1, z:+1}, {x:-1, y:+2, z:-1}, 
	{x:+1, y:+1, z:-2}, {x:+2, y:-1, z:-1}, {x:+1, y:-2, z:+1}
];

// var cube_diagonals = [
//     Cube(+2, -1, -1), Cube(+1, +1, -2), Cube(-1, +2, -1), 
//     Cube(-2, +1, +1), Cube(-1, -1, +2), Cube(+1, -2, +1), 
// ]


///////////////////
///////////////////
var gameSteps = []

///////////////////
///////////////////
var hexagons = [];
var hexagonIdDict = {};
var cubeStringToHexDict = {};

var algos = [];
var players = [];
var rounds = 0;
var gameTimer = null;
var gameStepIntervalMillis = 100;

// seems like hardcoded colors are the way to go. Limit number of players to number of colors
const playerColors = [
	{bg:"#0000A6", fg:"#b2b3ff"}, {bg:"#63FFAC", fg:"#004a00"}, {bg:"#B79762", fg:"#1c0000"}, 
	{bg:"#A30059", fg:"#ffb3ff"}, {bg:"#FFDBE5", fg:"#49262e"}, {bg:"#7A4900", fg:"#fff9af"}, 
	{bg:"#FF4A46", fg:"#7e0000"}, {bg:"#008941", fg:"#a6ffe7"}, {bg:"#006FA6", fg:"#aaffff"}, 
	{bg:"#FFFF00", fg:"#494a00"}, {bg:"#1CE6FF", fg:"#003a51"}, {bg:"#FF34FF", fg:"#750076"}, 
	{bg:"#004D43", fg:"#b2fff4"}, {bg:"#8FB0FF", fg:"#00004f"}, {bg:"#607D8B", fg:"#120000"}, 
	{bg:"#5A0007", fg:"#ffb3b9"}, {bg:"#809693", fg:"#000703"}, {bg:"#FEFFE6", fg:"#484a2f"}, 
	{bg:"#1B4400", fg:"#cdf7b1"}, {bg:"#4FC601", fg:"#003a00"}, {bg:"#3B5DFF", fg:"#000098"}, 
	{bg:"#4A3B53", fg:"#fdefff"}, {bg:"#FF2F80", fg:"#870008"}, {bg:"#61615A", fg:"#fffff7"}, 
	{bg:"#BA0900", fg:"#ffbcb1"}, {bg:"#6B7900", fg:"#021200"}, {bg:"#00C2A0", fg:"#003e1a"}, 
	{bg:"#FFAA92", fg:"#490000"}, {bg:"#FF90C9", fg:"#490012"}, {bg:"#B903AA", fg:"#ffb6ff"}, 
	{bg:"#D16100", fg:"#580000"}, {bg:"#DDEFFF", fg:"#273b4a"}, {bg:"#7B4F4B", fg:"#fff2ed"}, 
	{bg:"#A1C299", fg:"#000f00"}, {bg:"#300018", fg:"#e3b4ca"}, {bg:"#0AA6D8", fg:"#00295a"}, 
	{bg:"#00846F", fg:"#a3ffff"}
];


var editorCode = null;



/////////////////////
// FUNCTIONS
/////////////////////

function Player(id, algo, color) {
	return {id:id, algo:algo, color:color, exceptions:0, isAlive:true, roundsSurvived:0};
}

function Point(x, y) {
    return {x: x, y: y};
}

function Cube(x, y, z) {
    return {x: x, y: y, z: z};
}

function cubeAdd(a,b) {
	return {x:a.x+b.x, y:a.y+b.y, z:a.z+b.z};
}

function cubeSubtract(a, b) {
    return {x:a.x-b.x, y:a.y-b.y, z:a.z-b.z};
}

function cubeEqual(a,b) {
	return a.x === b.x && a.y === b.y && a.z === b.z;
}

function cubeDiagonalNeighbor(cube, dir) {
	return cubeAdd(cube, cubeDiagonals[dir])
}

function cubeNeighbor(cube, dir) {
	return cubeAdd(cube, cubeNeighbors[dir])
}

function isAlive(playerCells) {
	return getPlayerResources(playerCells) !== 0;
}

function guidGenerator() {
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

function Hexagon(x, y, z) {
	if (Math.round(x+y+z) != 0) throw "cube coordinates must sum to 0";

	
	return {
		cube:{x:x, y:y, z:z},  
		id:guidGenerator(), 
		resources:0, 
		ownerId:-1,
		maxGrowth:100
	};
}


function getCubeCoords(rings) {
    var cubeCoords = [{x:0, y:0, z:0}];	// init center hexagon

    for (var r = 0; r < rings+1; r++) {
        var x = 0, y = -r, z = +r;

        for (var i = 0; i < r; i++) {
            x += 1;
            z -= 1;
            cubeCoords.push({x:x, y:y, z:z});
        }
        for (var i = 0; i < r; i++) {
            y += 1;
            z -= 1;
            cubeCoords.push({x:x, y:y, z:z});
        }
        for (var i = 0; i < r; i++) {
            x -= 1;
            y += 1;
            cubeCoords.push({x:x, y:y, z:z});
        }
        for (var i = 0; i < r; i++) {
            x -= 1;
            z += 1;
            cubeCoords.push({x:x, y:y, z:z});
        }
        for (var i = 0; i < r; i++) {
            y -= 1;
            z += 1;
            cubeCoords.push({x:x, y:y, z:z});
        }
        for (var i = 0; i < r; i++) {
            x += 1;
            y -= 1;
            cubeCoords.push({x:x, y:y, z:z});
        }
    }
    return cubeCoords;
}


function hexagonsFromCubeCoords(cubeCoords) {
	let hexagons = [];
	var cubeStringToHex = {};
	for (var i = 0; i < cubeCoords.length; i++) {
		var hexagon = Hexagon(cubeCoords[i].x, cubeCoords[i].y, cubeCoords[i].z);
		hexagons.push(hexagon);

		var cubeString = cubeToString({x:cubeCoords[i].x, y:cubeCoords[i].y, z:cubeCoords[i].z});
		cubeStringToHex[cubeString] = hexagon;
	}
	cubeStringToHexDict = cubeStringToHex;
	return hexagons;
}

function cubeToString(cube) {
	return "(" + cube.x + "," + cube.y + "," + cube.z + ")";
}

function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

function setupGame(codes) {
	// reset key variables
	rounds = 0;
	gameSteps = [];
	hexagons = [];
	hexagonIdDict = {};
	cubeStringToHexDict = {};


	gameAborted = false;

	// find and setup player algos
	var algos = [];
	// var playerCodes = JSON.parse(localStorage.getItem("playerCodes")); // playerCodes = {name, codeString}
	var playerCodes = codes;

	for (var i = 0; i < playerCodes.length; i++) {
		// run in strict mode
		// var strictCodeString = "('use strict';" + playerCodes[i].codeString + ")";
		var strictCodeString = "(" + playerCodes[i].codeString + ")";
	    let turnFunction = null;
	    try {
		    turnFunction = eval(strictCodeString);	// evauluate the code string as a js function
		} catch (e) {
			// eval could not compile function
			turnFunction = eval("(function turn(myCells) {})");
		}
	    algos.push({name: playerCodes[i].name, code: turnFunction});
	}
	
	shuffle(algos); 	// shuffle to not place the same players in the same spots every run (if same input)
	var allPlayers = [];
	for (var i = 0; i < algos.length; i++) {
		if (i > playerColors.length) { 	
			break;
		}
		var player = Player(i, algos[i], playerColors[i]);
		allPlayers.push(player);
	}
	players = allPlayers;
	hexagons = makeBoard(players);


	const gameStep = hexagons.map(a => ({...a}));
	gameSteps.push({round: rounds, hexagons: gameStep, playerStandings: getPlayerStandings()});

}

function getPlayerData() {	
  		var playerData = []
  		players.forEach(player => {
  			const ownedHexagons = hexagons.filter(hexagon => hexagon.ownerId == player.id);
  			
  			playerData.push({
  				id: player.id,
  				name: player.algo.name,
  				hexagonCount: ownedHexagons.length,
				resources: getPlayerResources(ownedHexagons),
				alive: player.isAlive,  
  				roundsSurvived: player.roundsSurvived,
  				exceptions: player.exceptions
  			})
  		})
	return playerData;
}

function getPlayerStandings() {
	var sortedPlayers = getPlayerData();
	sortedPlayers.sort(function(p1, p2) {
		if (p1.hexagonCount === p2.hexagonCount) {
			if (p1.resources === p2.resources) 	{
				if (p1.roundsSurvived === p2.roundsSurvived)
					return p2.exceptions - p1.exceptions		// sort by number of exceptions
				return p2.roundsSurvived - p1.roundsSurvived;	// sort by rounds survived if equal resources
            } else return p2.resources - p1.resources;			// sort by resouces if controlling equal hexagons
		} else return p2.hexagonCount - p1.hexagonCount;		// sort by hexagon count predominantly
	});

	return sortedPlayers;
}

// naive game over check..
function isGameOver() {
	for (var i = 1; i < hexagons.length; i++) {
		if (hexagons[0].ownerId !== hexagons[i].ownerId) return false;
	}
	return true;
}

function advanceGame() {
	rounds++;
	var validPlayerTransactions = makeTurns(players);
	updateBoard(validPlayerTransactions);
	growCells();

	const gameStep = hexagons.map(a => ({...a}));
	gameSteps.push({round: rounds, hexagons: gameStep, playerStandings: getPlayerStandings()});
}

function startGame() {
	console.log("Starting game simulation");
	const gameTimeEnd = new Date().getTime() + gameTimeMaxMillis;
	while (!isGameOver() || gameAborted) {
		if (new Date().getTime() > gameTimeEnd) {
            console.log("time over")
			gameAborted = true;
			break;
		}
		advanceGame();
	}
	return onGameOver();
}

function onGameOver() {
	console.log("Game simulation done");
    return gameSteps;
}

function stopGame() {
	gameAborted = true;
}

function restartGame(codes) {
	stopGame(); 	// stop current game
    setupGame(codes);
    return startGame();
}

function makeTurns(players) {
	var playerTransactions = [];
	var validPlayerTransactions = [];

	for (var i = 0; i < players.length; i++) {
		if (!players[i].isAlive) continue;

		var playerCells = getBoardState(players[i]);
		if (playerCells.length === 0) {
			players[i].isAlive = false;
			continue;
		}
		players[i].roundsSurvived = rounds; 	// update number of rounds alive


		// TODO: time excecution and fail algo if not returning within 500ms or something (prevent infinite loops etc)
		var transaction = null;
		var validTransaction = null;

		try {
			transaction = players[i].algo.code(playerCells);
			validTransaction = validateTransaction(players[i], transaction);
			validPlayerTransactions.push(validTransaction);

		} catch (e) {
			console.log(e);
			players[i].exceptions++;
		}

		
	}
	return validPlayerTransactions;
}

// function delay(ms) {
// 	return new Promise(resolve => setTimeout(resolve, ms))
// }


// Make all transactions "at the same time" => Two rounds:
// 		First round removes all resources being transfered from cells
// 		Second round transfers the amounts removed to their destination cells
function updateBoard(validTransactions) {
	// subtract resources being transferred
	for (var i = 0; i < validTransactions.length; i++) {
		hexagonIdDict[validTransactions[i].transaction.fromId].resources -= validTransactions[i].transaction.transferAmount;
	}

	// complete the transfer of resources
	for (var i = 0; i < validTransactions.length; i++) {
		transferResources(
			validTransactions[i].player,
			validTransactions[i].transaction.toId, 
			validTransactions[i].transaction.transferAmount
		);	
	}
}

function getPlayerResources(playerCells) {
	var resources = 0;
	for (var i = 0; i < playerCells.length; i++) {
		resources += playerCells[i].resources;
	}
	return resources;
}

function hexNeighbors(hexagon) {
	var hexNeighbors = [];
	hexagon.neighbors.forEach(neighborId => {
		hexNeighbors.push(hexagonIdDict[neighborId]);
	});
	return hexNeighbors;
}

// run a DFS search for a path owned by the same player between the two hexagons
function ownedPathExists(startHex, endHex) {
	var stack = [];
	var explored = new Set();

	stack.push(startHex);

	while (stack.length > 0) {
		var currentHex = stack.pop();
		explored.add(currentHex);

		if (currentHex === endHex)  	// search concluded, path exists
			return true;

		hexNeighbors(currentHex).filter(n => !explored.has(n) && n.ownerId === endHex.ownerId).forEach(n => {
			stack.push(n);
		});
	}
	return false;
}

// returns all transaction that did not violate transaction restrictions.
function validateTransaction(player, transaction) {

	try {
		var fromHexagon = hexagonIdDict[transaction.fromId];
		var toHexagon = hexagonIdDict[transaction.toId];

		if (!fromHexagon)
			throw "cannot perform transaction from hexagon with id: " + transaction.fromId;

		if (!toHexagon)
			throw "cannot perform transaction to hexagon with id: " + transaction.toId;

		if (fromHexagon.ownerId === toHexagon.ownerId && !ownedPathExists(fromHexagon, toHexagon))
			throw "hexagons are not connected";

		if (transaction.transferAmount < 0) 
			throw "cannot transfer negative amounts";

		else if (fromHexagon.resources < transaction.transferAmount) 
			throw "not enough resources to transfer";

		else if (fromHexagon.ownerId !== player.id) 
			throw "cannot transfer resources from cells you do not own";

		else if (fromHexagon === toHexagon) 
			throw "cannot transfer to same cell";

		else if (fromHexagon.ownerId !== toHexagon.ownerId && !fromHexagon.neighbors.includes(toHexagon.id))
			throw "cannot transfer to non-neighboring cells when attacking";

		else if (!Number.isInteger(transaction.transferAmount))
			throw "transfer amount is not an integer";

		return {player:player, transaction:transaction};
	} catch(e) {
		// the transaction is badly formatted
		throw "Invalid transaction: " + e;
	}
}


function transferResources(player, hexToId, transferAmount) {
	var toHexagon = hexagonIdDict[hexToId];

	// increase resources if already owned
	if (toHexagon.ownerId === player.id)
		toHexagon.resources += transferAmount;
	else {
		toHexagon.resources -= transferAmount;
		// update owner if transferring enough resources to overtake
		if (toHexagon.resources < 0) {
			toHexagon.resources *= -1;	// to get back to positive
			toHexagon.ownerId = player.id;
		} else if (toHexagon.resources === 0) {
			// who gets ownership in this case?
			toHexagon.ownerId = -1;
		}
	}
}

// increment all player-owned hexagon resources by 1 if not at maxGrowth or above
function growCells() {
	for (var i = 0; i < hexagons.length; i++) {
		if (hexagons[i].ownerId !== -1 && hexagons[i].resources < hexagons[i].maxGrowth) 
			hexagons[i].resources++;
	}
}



function getHexagonIdDict(hexagons) {
	// associate id with its hexagon for faster lookups
	var hexagonIdDict = {};
	for (var i = 0; i < hexagons.length; i++) {
		hexagonIdDict[hexagons[i].id] = hexagons[i];
	}
	return hexagonIdDict;
}


function getBoardState(player) {
	// playerCell 	-> id, resources, maxGrowth, neighborCells
	// neighborCell -> id, resources, owner, maxGrowth

	var playerCells = [];
	for (var i = 0; i < hexagons.length; i++) {
		if (hexagons[i].ownerId === player.id) {
			var neighborCells = [];
			for (var j = 0; j < hexagons[i].neighbors.length; j++) {

				const neighborHex = hexagonIdDict[hexagons[i].neighbors[j]]

				var hexOwner = HexOwner.NONE;
				if (neighborHex.ownerId === player.id) hexOwner = HexOwner.OWN;
				else if (neighborHex.ownerId !== -1) hexOwner = HexOwner.OTHER;

				neighborCells.push({
					id: neighborHex.id, 
					resources: neighborHex.resources, 
					owner: hexOwner,
					maxGrowth: neighborHex.maxGrowth
				});
			}
			playerCells.push({
				id: hexagons[i].id, 
				resources: hexagons[i].resources, 
				// owner: HexOwner.OWN,
				maxGrowth: hexagons[i].maxGrowth,
				neighbors:neighborCells
			});
		}
	}
	return playerCells;
}

function getHexgridRings(hexagons) {
	var cubeOnOuterRing = hexagons[hexagons.length-1].cube;
	var numRings = Math.max(Math.abs(cubeOnOuterRing.x), Math.abs(cubeOnOuterRing.y), Math.abs(cubeOnOuterRing.z));
	return numRings;
}

// just do this for now, slow a.f. but prototyping atm, only have to do it once per setup though
function setupHexagonNeighbors(hexagons, wraparound) {
	// figure out which hexagons are neighbors

	var numRings = getHexgridRings(hexagons);
	var mirrorCenters = getMirrorCenters(numRings);

	for (var i = 0; i < hexagons.length; i++) {
		var hexagon = hexagons[i];
		
		for (var c = 0; c < cubeNeighbors.length; c++) {
			var neighborCube = cubeNeighbor(hexagon.cube, c)

			// if a neighbor is off the main map, then wraparound if set
			// this is the case when distance to any of the mirror centers
			// is less than or equal the size of the grid, i.e. numRings
			if (wraparound === NeighborWraparound.WRAP) {
				for (var m = 0; m < mirrorCenters.length; m++) {
					if (cubeDistance(mirrorCenters[m], neighborCube) <= numRings) {
						var mirroredNeighborCube = cubeSubtract(neighborCube, mirrorCenters[m]);
						neighborCube = mirroredNeighborCube;	// as it reappears mirrored on the main grid
						break;
					}
				}
			}

			// now find which of the hexagons has these cube coords
			// -----------------

			// OPTION 1 - add neighbors both ways, neighbor indices become complex and not the same for all hexagons
			// for (var j = i+1; j < hexagons.length; j++) {


			// 	if (cubeEqual(hexagons[j].cube, neighborCube)) {

			// 		// add neighbors both ways
			// 		if (hexagon.neighbors == null)
			// 			hexagon.neighbors = [hexagons[j]];
			// 		else 
			// 			hexagon.neighbors.push(hexagons[j]);

			// 		if (hexagons[j].neighbors == null)
			// 			hexagons[j].neighbors = [hexagon];
			// 		else 
			// 			hexagons[j].neighbors.push(hexagon);
					
			// 		break;
			// 	}
			// }

			// OPTION 2 - not adding both way, but keep neighbor indices the same (much easier to follow, but slower)
			for (var j = 0; j < hexagons.length; j++) {

				if (cubeEqual(hexagons[j].cube, neighborCube)) {

					var neighborHex = cubeStringToHexDict[cubeToString(neighborCube)];

					if (hexagon.neighbors == null)
						hexagon.neighbors = [neighborHex.id];

					else 
						hexagon.neighbors.push(neighborHex.id);
					
					break;
				}
			}
		}
	}
	return hexagons;
}

function cubeDistance(a, b) {
	// since a hexgrid is basically a slice/plane of a cubegrid
	// the distance is the manhattan distance of the cubegrid divided by 2
    return (Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs(a.z - b.z)) / 2;
}

function getAllRotationsOfCube(cube) {
	var rotations = [cube];
	for (var i = 0; i < 5; i++) {
		// shift coordinates once to the left for 60 degree left rotation
		// each rotation also shifts the signs of the coordinates
		rotations.push({x:-rotations[i].y, y:-rotations[i].z, z:-rotations[i].x});
	}
	return rotations;
}

function getMirrorCenters(numRings) {
	// centers at 60 degrees rotations around (0,0,0) at (2N+1, -N-1, -N)

	var mirrorCenter = {x:2*numRings+1, y:-numRings-1, z: -numRings};
	return getAllRotationsOfCube(mirrorCenter);
}


function makeBoard(players) {
	// each player should have their own ring around the center hex given
	// each player ring should be separated by at least one ring
	// each player should also be at least one ring from the edge
	// this implies a minimum hexgrid

	// place the first player at (0,0,0)
	// subsequent players are place at (4,-4,0) and its 5 rotations (60 degree increments)
	// if players > 7 (center + 6 rotations) do it again, i.e. (8,-8,0) and rotate in smaller increments (30,15,..)

	// 2-7 players: 6 rings
	// 8-12 = 4 more rings and 30 degree rotations around center (0,0,0)

	// 6 rings 		room for 6 + center 			60 degree rotations
	// 10 rings 	room for 6 + 12 + center 		30 degree rotations
	// 14 rings 	room for 6 + 12 + 24 + center 	15 degree rotations
	//----------------------------------
	var numRings = 6;
	var playerRings = 1; 					// number of rings containing player cells
	var roomForPlayers = 1 + 6*playerRings;	// room for center + the capacity of the ring
	// increase rings by 4 until enough room for all players
	while (roomForPlayers < players.length) {
		numRings += 4;
		playerRings++;
		roomForPlayers += 6*playerRings; 	// each ring of players increase capacity by six of previous ring of player
	}

	// how big can we make 1 hexagon to still fit grid in canvas?
	// first figure out dominant directions
	// 		pointy hexagon = flat grid = scale on width
	// 		flat hexagon = pointy grid = scale on height


	var numHexagons = 2*numRings+1; 	// 1 ring adds 2 hexagons and then + center hexagon

	// create cubes/hexagons of this many rings
	var cubeCoords = getCubeCoords(numRings);
	let hexagons = hexagonsFromCubeCoords(cubeCoords);
	hexagons = setupHexagonNeighbors(hexagons, NeighborWraparound.WRAP);
	hexagonIdDict = getHexagonIdDict(hexagons);

	// assign one hexagon according to restrictions for each player starting with center
	var centerHexagon = cubeStringToHexDict["(0,0,0)"];
	centerHexagon.resources = 10;
	centerHexagon.ownerId = players[0].id;

	// rotations of 15/30 degree increments by doing two 60 degree rotations with different starting point
	var nextPlayerCube = {x:4, y:-4, z:0};	
	var hexesAssigned = 1;
	var rotations = [];

	// init mining field around players ranging from 0-100
	var miningField = Array.from({length: 6}, () => Math.floor(Math.random() * 100));

	// make mining field around center hexagon
	// for (var n = 0; n < centerHexagon.neighbors.length; n++) {
	// 	centerHexagon.neighbors[n].resources = miningField[n];
	// }

	for (var n = 0; n < centerHexagon.neighbors.length; n++) {
		hexagonIdDict[centerHexagon.neighbors[n]].resources = miningField[n]
	}


	// make supercell around each player's mining field
	// get a neighbor of the mining field that is not part of the mining field or the player hexagon
	// starting with the center hexagon
	// centerHexagon.neighbors[0].neighbors[0].maxGrowth = 300;
	cubeStringToHexDict[cubeToString(cubeDiagonalNeighbor(centerHexagon.cube, 0))].maxGrowth = 300;

	// assign one hexagon according to restrictions for each player 
	for (var currentPlayerRing = 1; currentPlayerRing <= playerRings; currentPlayerRing++) {

		var playerCube = nextPlayerCube;
		for (var extras = currentPlayerRing-1; extras >= 0; extras--) {
			rotations.push(...getAllRotationsOfCube(playerCube));	// extend array - "..." notation fails for large arrays (> 100k entries), we should be okay
			playerCube = cubeAdd(playerCube, {x:-4, y:0, z:4});		// follow player ring and settle on first hexagon satisfying restrictions
		}

		for (var i = 0; i < rotations.length && hexesAssigned < players.length; i++) {
			var hexagon = cubeStringToHexDict[cubeToString(rotations[i])];
			hexagon.resources = 10;
			hexagon.ownerId = players[hexesAssigned].id;
			hexesAssigned++;

			// assign the neighbor hexagons resources equal to the mining field
			// shuffle mining field for each player
			shuffle(miningField);
			for (var n = 0; n < hexagon.neighbors.length; n++) {
				hexagonIdDict[hexagon.neighbors[n]].resources = miningField[n]
			}

			// make supercell around mining field
			// hexagon.neighbors[0].neighbors[0].maxGrowth = 300;
			cubeStringToHexDict[cubeToString(cubeDiagonalNeighbor(hexagon.cube, 0))].maxGrowth = 300;
		}

		rotations = [];
		nextPlayerCube = cubeAdd(nextPlayerCube, {x:4, y:-4, z:0});
	}
	return hexagons;
}



