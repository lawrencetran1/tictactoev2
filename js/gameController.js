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

			ctrl.gamelist = getGames();
			ctrl.game = null;
			ctrl.createGame = createGame;
			ctrl.board = getboard;

			function createGame() {
				var gameref = new Firebase(GAME_LOCATION + gameId);
				var listref = new Firebase(GAME_LOCATION + 'gamelist');
				ctrl.newgame = $firebaseObject(gameref);
				ctrl.list = $firebaseArray(listref);
				ctrl.list.$add(gameId);
				ctrl.newgame.gameId = gameId;
				ctrl.newgame.board = [{move: ""},{move: ""},{move: ""},{move: ""},{move: ""},{move: ""},{move: ""},{move: ""},{move: ""}];
				ctrl.newgame.round = 0;
				ctrl.newgame.playerCount = 0;
				ctrl.newgame.winner = "";
				ctrl.newgame.player1 = {name: "Player 1", symbol: 'X', wins: 0};
				ctrl.newgame.player2 = {name: "Player 2", symbol: 'O', wins: 0};
				ctrl.newgame.playerTurn = 0;
				ctrl.newgame.$save(ctrl.newgame);							// use $save and pass in the changed object to save it to firebase
			};

			function getboard(gameId) {
				var gameref = new Firebase(GAME_LOCATION + gameId);
				var boardref = new Firebase(GAME_LOCATION + gameId + '/board');
				ctrl.game = $firebaseObject(gameref);
				ctrl.board = $firebaseArray(boardref);
			};

			function getGames() {
				var listref = new Firebase(GAME_LOCATION + 'gamelist');
				return $firebaseArray(listref);
			};

			ctrl.click = function($index) {
				console.log(ctrl.game)
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