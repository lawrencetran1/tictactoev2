(function(){
	angular
		.module('myApp')
		.controller('GameController', GameController);

		GameController.$inject = ['$firebaseObject'];

		function GameController($firebaseObject) {
			var ctrl = this;
			var ref = new Firebase('https://larry-firebase.firebaseio.com/game');
			// ctrl.game = $firebaseObject(ref);

			ctrl.createGame = createGame();
			ctrl.gameBoard = getBoard();

			function createGame() {
				var gameId = Math.round(Math.random()*100000000000);
				// var playerName = prompt("enter name");
				var ref = new Firebase('https://larry-firebase.firebaseio.com/game/' + gameId);
				ctrl.game = $firebaseObject(ref);								// creates game object with unique ID
				ctrl.game.gameId = gameId;											// creates gameID property inside game object
				ctrl.game.board = [{0: 'square1', 1: 'square2', 2: 'square3'}, 
													 {3: 'square4', 4: 'square5', 5: 'square6'}, 
													 {6: 'square7', 7: 'square8', 8: 'square9'}];
				ctrl.game.winner = null;
				ctrl.game.players = {
					player1: {
						name: null,
						symbol: 'X',
						wins: 0
					},
					player2: {
						name: null,
						symbol: 'O',
						wins: 0
					}
				};
				ctrl.game.playerTurn = null;
				ctrl.game.$save(ctrl.game);							// use $save and pass in the changed object to save it to firebase
			};

			function getBoard() {
				var ref = new Firebase('https://larry-firebase.firebaseio.com/game/' + ctrl.game.gameId);
				return $firebaseObject(ref);
			}

			console.log(ctrl.gameBoard);


		};

})();