const LOCAL_STORAGE_PLAYER_NAME = 'playerName';
const LOCAL_STORAGE_EDITOR_CODE = 'editorCode';

const defaultPlayerName = 'Anonymous';
const defaultEditorCode = `
/**
* id 			string (unique identifier for a hexagon cell)
* resources		int (amount displayed in hexagon)
* maxGrowth 	int (normal cells: 100, super cells: 300)
* owner 		enum HexOwner {NONE: 0, OWN: 1, OTHER: 2}
* 					HexOwner.NONE 	Unoccupied hexagon
*  					HexOwner.OWN 	Hexagon controlled by this player (you)
*  					HexOwner.OTHER 	Hexagon controlled by another player (opponent)
*
* playerCell 	{id:string, resources:int, maxGrowth:int, neighborCells:neighborCell[]}
* neighborCell 	{id:string, resources:int, owner:HexOwner, maxGrowth:int}
* myCells 		playerCell[]
*/

function turn(myCells) {
	// get all cells with enemy neighbors and sort by resources to get strongest attacker
	const attackerCells = myCells
	    .filter(cell => cell.neighbors.some(n => n.owner !== HexOwner.OWN))
	    .sort((a, b) => b.resources - a.resources);
	const strongestAttacker = attackerCells[0];
	
	// find and sort neighbors of the most resourceful attacker
	const targetCells = strongestAttacker.neighbors
	    .filter(n => n.owner !== HexOwner.OWN)
	    .sort((a, b) => a.resources - b.resources);
	const weakestTarget = targetCells[0];
    
    // transfer all but one resource from the strongest attacker to the weakest target
    const transaction = {
        fromId: strongestAttacker.id, 
        toId: weakestTarget.id, 
        transferAmount: strongestAttacker.resources - 1
    };
	return transaction;
}`;

const PLAYER_COLORS = [
  { bg: '#0000A6', fg: '#b2b3ff' },
  { bg: '#63FFAC', fg: '#004a00' },
  { bg: '#B79762', fg: '#1c0000' },
  { bg: '#A30059', fg: '#ffb3ff' },
  { bg: '#FFDBE5', fg: '#49262e' },
  { bg: '#7A4900', fg: '#fff9af' },
  { bg: '#FF4A46', fg: '#7e0000' },
  { bg: '#008941', fg: '#a6ffe7' },
  { bg: '#006FA6', fg: '#aaffff' },
  { bg: '#FFFF00', fg: '#494a00' },
  { bg: '#1CE6FF', fg: '#003a51' },
  { bg: '#FF34FF', fg: '#750076' },
  { bg: '#004D43', fg: '#b2fff4' },
  { bg: '#8FB0FF', fg: '#00004f' },
  { bg: '#607D8B', fg: '#120000' },
  { bg: '#5A0007', fg: '#ffb3b9' },
  { bg: '#809693', fg: '#000703' },
  { bg: '#FEFFE6', fg: '#484a2f' },
  { bg: '#1B4400', fg: '#cdf7b1' },
  { bg: '#4FC601', fg: '#003a00' },
  { bg: '#3B5DFF', fg: '#000098' },
  { bg: '#4A3B53', fg: '#fdefff' },
  { bg: '#FF2F80', fg: '#870008' },
  { bg: '#61615A', fg: '#fffff7' },
  { bg: '#BA0900', fg: '#ffbcb1' },
  { bg: '#6B7900', fg: '#021200' },
  { bg: '#00C2A0', fg: '#003e1a' },
  { bg: '#FFAA92', fg: '#490000' },
  { bg: '#FF90C9', fg: '#490012' },
  { bg: '#B903AA', fg: '#ffb6ff' },
  { bg: '#D16100', fg: '#580000' },
  { bg: '#DDEFFF', fg: '#273b4a' },
  { bg: '#7B4F4B', fg: '#fff2ed' },
  { bg: '#A1C299', fg: '#000f00' },
  { bg: '#300018', fg: '#e3b4ca' },
  { bg: '#0AA6D8', fg: '#00295a' },
  { bg: '#00846F', fg: '#a3ffff' },
];

const canvasBackgroundColor = '#183b4e';
const FONT_FAMILY = 'Consolas';

const HexgridOrientation = {
  FLAT: 0,
  POINTY: 1,
};

const HexOwner = {
  NONE: 0,
  OWN: 1,
  OTHER: 2,
};

export default {
  LOCAL_STORAGE_PLAYER_NAME,
  LOCAL_STORAGE_EDITOR_CODE,
  PLAYER_COLORS,
  FONT_FAMILY,
  defaultPlayerName,
  defaultEditorCode,
  canvasBackgroundColor,
  HexgridOrientation,
  HexOwner,
};
