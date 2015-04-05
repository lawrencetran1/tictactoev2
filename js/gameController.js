(function(){
	angular
		.module('myApp')
		.controller('GameController', GameController);

		GameController.$inject = ['$firebaseObject', '$firebaseArray'];

		function GameController($firebaseObject, $firebaseArray) {
			var ctrl = this;
			var GAME_LOCATION = 'https://larry-firebase.firebaseio.com/tictactoe/';
			var ref = new Firebase(GAME_LOCATION);
			var gameId = Math.round(Math.random()*100000000000);

			ctrl.gameList = getGameList();
			ctrl.createGame = createGame;
			// ctrl.checkGame = checkIfGameExists;

			function createGame() {
				var ref = new Firebase(GAME_LOCATION + gameId);
				ctrl.game = $firebaseObject(ref);
				ctrl.game.gameId = gameId;
				ctrl.game.board = [{move: ""},{move: ""},{move: ""},{move: ""},{move: ""},{move: ""},{move: ""},{move: ""},{move: ""}];
				ctrl.game.round = 0;
				ctrl.game.playerCount = 0;
				ctrl.game.winner = "";
				ctrl.game.player1 = {name: "Player 1", symbol: 'X', wins: 0};
				ctrl.game.player2 = {name: "Player 2", symbol: 'O', wins: 0};
				ctrl.game.playerTurn = 0;
				ctrl.game.$save(ctrl.game);							// use $save and pass in the changed object to save it to firebase
			};

			function getGameList() {
				var obj = $firebaseObject(ref);

     		// to take an action after the data loads, use the $loaded() promise
     		obj.$loaded().then(function() {
        // console.log("loaded record:", obj.$id, obj.someOtherKeyInData);

       	// To iterate the key/value pairs of the object, use angular.forEach()
       	angular.forEach(obj, function(value, key) {
          	console.log(value.gameId);
       	});
     	});
			};

			ctrl.click = function($index) {
				var square = ctrl.game.board[$index];
				if (square.move === 'X' || square.move === 'O') return;
				if (ctrl.game.playerTurn == 0) {
					square.move = 'X';
					ctrl.game.playerTurn++;
					ctrl.game.round++
				}
				else {
					square.move = 'O';
					ctrl.game.playerTurn--
					ctrl.game.round++
				}
				ctrl.game.combos = [
					{combo: ctrl.game.board[0].move + ctrl.game.board[1].move + ctrl.game.board[2].move},
					{combo: ctrl.game.board[3].move + ctrl.game.board[4].move + ctrl.game.board[5].move},
					{combo: ctrl.game.board[6].move + ctrl.game.board[7].move + ctrl.game.board[8].move},
					{combo: ctrl.game.board[0].move + ctrl.game.board[3].move + ctrl.game.board[6].move},
					{combo: ctrl.game.board[1].move + ctrl.game.board[4].move + ctrl.game.board[7].move},
					{combo: ctrl.game.board[2].move + ctrl.game.board[5].move + ctrl.game.board[8].move},
					{combo: ctrl.game.board[0].move + ctrl.game.board[4].move + ctrl.game.board[8].move},
					{combo: ctrl.game.board[2].move + ctrl.game.board[4].move + ctrl.game.board[6].move}
				];
				ctrl.game.$save(square);
				ctrl.checkWinner();
			};

			ctrl.checkWinner = function() {
				for (var i = 0; i < ctrl.game.combos.length; i++) {
					if (ctrl.game.combos[i].combo === 'XXX') {
						ctrl.game.winner = ctrl.game.player1.name;
						ctrl.game.player1.wins++;
						ctrl.clearGame();
					}
					else if (ctrl.game.combos[i].combo === 'OOO') {
						ctrl.game.winner = ctrl.game.player2.name;
						ctrl.game.player2.wins++;
						ctrl.clearGame();
					}
					else if (ctrl.game.winner === "" && ctrl.game.round == 9) {
						ctrl.game.winner = 'tie';
						ctrl.clearGame();
					}
				}
				ctrl.game.$save(ctrl.game);
			};

			ctrl.clearGame = function() {
				ctrl.game.winner = "";
				ctrl.game.round = 0;
				for (var i = 0; i < ctrl.game.board.length; i++) {
					ctrl.game.board[i].move = "";
				}
				for (var i = 0; i < ctrl.game.combos.length; i++) {
					ctrl.game.combos[i].combo = "";
				}
				ctrl.game.$save(ctrl.game);
			};


		};

})();