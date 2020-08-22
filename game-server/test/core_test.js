import { expect } from 'chai';
import { List, Map, isList } from 'immutable';
import { setPlayers, selectPlayer, deselectPlayer, createGame } from '../src/core';

describe('application logic', () => {

	describe('createGame', () => {
		it('sets up the game with the given player names', () => {
			const state = Map();
			const playerNames = List.of('twSupply', 'makeItSafe');
			const nextState = createGame(state, playerNames);
			expect(nextState).to.equal(Map({
				players: List.of(
					Map({
						id: 0,
						name: 'twSupply'
					}),
					Map({
						id: 1,
						name: 'makeItSafe'
					})
				)
			}));
		});
	});

	// describe('nextStep', () => {
	// 	it('takes advances the game state by performing given transactions on the current state', () => {
	// 		const state = Map({
	// 			hexagons: List.of(
	// 				Map({
	// 					id: 'asd-123-qwe-456',
	// 					cube: {
	// 						x: 0,
	// 						y: 0,
	// 						z: 0
	// 					},
	// 					maxGrowth: 100,
	// 					ownerId: 0,
	// 					resources: 10,
	// 					neighbors: List.of('abc-000-xyz-111')
	// 				}),
	// 				Map({
	// 					id: 'abc-000-xyz-111',
	// 					cube: {
	// 						x: 1,
	// 						y: 0,
	// 						z: -1
	// 					},
	// 					maxGrowth: 100,
	// 					ownerId: -1,
	// 					resources: 0,
	// 					neighbors: List.of('asd-123-qwe-456')
	// 				}),
	// 				Map({
	// 					id: 'ijk-999-lmn-777',
	// 					cube: {
	// 						x: 1,
	// 						y: -1,
	// 						z: 0
	// 					},
	// 					maxGrowth: 100,
	// 					ownerId: 1,
	// 					resources: 10,
	// 					neighbors: List.of('pqr-555-stu-111')
	// 				}),
	// 				Map({
	// 					id: 'pqr-555-stu-111',
	// 					cube: {
	// 						x: 0,
	// 						y: -1,
	// 						z: 1
	// 					},
	// 					maxGrowth: 100,
	// 					ownerId: 0,
	// 					resources: 4,
	// 					neighbors: List.of('ijk-999-lmn-777')
	// 				})
	// 			)
	// 		});

	// 		const transactions = List.of(
	// 			Map({
	// 				id: 0,
	// 				name: 'twSupply',
	// 				transaction: {
	// 					fromId: 'asd-123-qwe-456',
	// 					toId: 'abc-000-xyz-111',
	// 					transferAmount: 2
	// 				}
	// 			}),
	// 			Map({
	// 				id: 1,
	// 				name: 'makeItSafe',
	// 				transaction: {
	// 					fromId: 'ijk-999-lmn-777',
	// 					toId: 'pqr-555-stu-111',
	// 					transferAmount: 5
	// 				}
	// 			})
	// 		);


	// 		const nextState = nextStep(state, transactions);
	// 		expect(nextState).to.equal(Map({
	// 			hexagons: List.of(
	// 				Map({
	// 					id: 'asd-123-qwe-456',
	// 					cube: {
	// 						x: 0,
	// 						y: 0,
	// 						z: 0
	// 					},
	// 					maxGrowth: 100,
	// 					ownerId: 0,
	// 					resources: 9,
	// 					neighbors: List.of('abc-000-xyz-111')
	// 				}),
	// 				Map({
	// 					id: 'abc-000-xyz-111',
	// 					cube: {
	// 						x: 1,
	// 						y: 0,
	// 						z: -1
	// 					},
	// 					maxGrowth: 100,
	// 					ownerId: 0,
	// 					resources: 3,
	// 					neighbors: List.of('asd-123-qwe-456')
	// 				}),
	// 				Map({
	// 					id: 'ijk-999-lmn-777',
	// 					cube: {
	// 						x: 1,
	// 						y: -1,
	// 						z: 0
	// 					},
	// 					maxGrowth: 100,
	// 					ownerId: 1,
	// 					resources: 6,
	// 					neighbors: List.of('pqr-555-stu-111')
	// 				}),
	// 				Map({
	// 					id: 'pqr-555-stu-111',
	// 					cube: {
	// 						x: 0,
	// 						y: -1,
	// 						z: 1
	// 					},
	// 					maxGrowth: 100,
	// 					ownerId: 1,
	// 					resources: 2,
	// 					neighbors: List.of('ijk-999-lmn-777')
	// 				})
	// 			)
	// 		}));
	// 	});
	// });

	// describe('selectPlayer', () => {
	// 	it('creates a selection of players for the selected player', () => {
	// 		const state = Map({
	// 			players: List.of('twSupply', 'makeItSafe')
	// 		})
	// 		const nextState = selectPlayer(state, 'twSupply');
	// 		expect(nextState).to.equal(Map({
	// 			players: List.of('twSupply', 'makeItSafe'),
	// 			selected: Map({
	// 				'twSupply': 1
	// 			})
	// 		}));
	// 	});

	// 	it('adds to existing selection for the selected player', () => {
	// 		const state = Map({
	// 			players: List.of('twSupply', 'makeItSafe'),
	// 			selected: Map({
	// 				'twSupply': 3,
	// 				'makeItSafe': 2
	// 			})
	// 		})
	// 		const nextState = selectPlayer(state, 'twSupply');
	// 		expect(nextState).to.equal(Map({
	// 			players: List.of('twSupply', 'makeItSafe'),
	// 			selected: Map({
	// 				'twSupply': 4,
	// 				'makeItSafe': 2
	// 			})
	// 		}));
	// 	});
	// });


	// describe('deselectPlayer', () => {
	// 	it('does not create a selection entry for the deselected player', () => {			
	// 		const state = Map({
	// 			players: List.of('twSupply', 'makeItSafe'),
	// 			selected: Map({
	// 				makeItSafe: 1
	// 			})
	// 		})
	// 		const nextState = deselectPlayer(state, 'twSupply');
	// 		expect(nextState).to.equal(Map({
	// 			players: List.of('twSupply', 'makeItSafe'),
	// 			selected: Map({
	// 				makeItSafe: 1
	// 			})
	// 		}));
	// 	});

	// 	it('subtracts from existing selection for the deselected player', () => {
	// 		const state = Map({
	// 			players: List.of('twSupply', 'makeItSafe'),
	// 			selected: Map({
	// 				'twSupply': 3,
	// 				'makeItSafe': 2
	// 			})
	// 		})
	// 		const nextState = deselectPlayer(state, 'twSupply');
	// 		expect(nextState).to.equal(Map({
	// 			players: List.of('twSupply', 'makeItSafe'),
	// 			selected: Map({
	// 				'twSupply': 2,
	// 				'makeItSafe': 2
	// 			})
	// 		}));
	// 	});

	// 	it('deselecting a player does not result in negative selection count', () => {
	// 		const state = Map({
	// 			players: List.of('twSupply', 'makeItSafe'),
	// 			selected: Map({
	// 				'twSupply': 0,
	// 				'makeItSafe': 2
	// 			})
	// 		})
	// 		const nextState = deselectPlayer(state, 'twSupply');
	// 		expect(nextState).to.equal(Map({
	// 			players: List.of('twSupply', 'makeItSafe'),
	// 			selected: Map({
	// 				'twSupply': 0,
	// 				'makeItSafe': 2
	// 			})
	// 		}));
	// 	});
	// });

	// describe('createGame', () => {
	// 	it('creates a game instance from a selection of players', () => {
	// 		const players = List.of('twSupply', 'makeItSafe');
	// 		const gameState = createGame(players);

	// 		expect(gameState).to.equal(Map({	
	// 			round: 0,
	// 			hexagons: isList,
	// 			playerStandings: List.of(
	// 				Map({
	// 					name: 'twSupply',
	// 					hexagonCount: 1,
	// 					resources: 10,
	// 					roundsSurvived: 0,
	// 					exceptions: 1
	// 				}),
	// 				Map({
	// 					name: 'makeItSafe',
	// 					hexagonCount: 1,
	// 					resources: 10,
	// 					roundsSurvived: 0,
	// 					exceptions: 1
	// 				})
	// 			)
	// 		}));
	// 	});
	// });

	// describe('advanceGame', () => {
	// 	it('takes ', () => {
	// 		const gameState = 
	// 	});
	// });



	// describe('makeTurns', () => {
	// 	it('takes players and their code and produces valid player transactions', () => {
	// 		const state = Map({
	// 			players: Map({
	// 				id: 1,
	// 				algo,
	// 				color
	// 			})
	// 		});
	// 	});
	// }


	// 'twSupply': 'function turn(myCells) {return {}}',
	// 'makeItSafe': 'function turn(myCells) {return {}}'

	// 		const nextState = createGame(state)
	// 		// score: {
	// 		// 	player: string,
	// 		// 	hexagons: int,
	// 		// 	resources: int,
	// 		// 	exceptions: int
	// 		// }
	// 	});
	// }

	// describe('advanceGame', () => {
	// 	it('takes all players during advance'), () => {
	// 		const state = {
	// 			players: ['twSupply', 'makeItSafe']
	// 		};

	// 		const nextState = advanceGame(state);
	// 		expect(nextState).to.deep.equal({
	// 			players: ['twSuppry'],
	// 			score: []
	// 		})


	// 	}
	// });
});