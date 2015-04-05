(function(){
	angular
		.module('myApp')
		.controller('GameController', GameController);

		GameController.$inject = ['$firebaseObject', '$firebaseArray', '$timeout'];

		function GameController($firebaseObject, $firebaseArray, $timeout) {
			var ctrl = this;
			var GAME_LOCATION = 'https://larry-firebase.firebaseio.com/tictactoe/';
			var ref = new Firebase(GAME_LOCATION);
			var gameId = Math.round(Math.random()*100000000000);

			ctrl.gamelist = getGames();
			ctrl.game = null;
			ctrl.id = null;
			ctrl.name = 'n00b';
			ctrl.createGame = createGame;
			ctrl.board = getboard;
			ctrl.chatList = getChat();						

			// initialize new game with default settings
			function createGame(numgames) {
				var gameref = new Firebase(GAME_LOCATION + gameId);
				var listref = new Firebase(GAME_LOCATION + 'gamelist');
				ctrl.newgame = $firebaseObject(gameref);
				ctrl.list = $firebaseArray(listref);
				ctrl.list.$add(gameId);
				ctrl.newgame.gameId = gameId;
				ctrl.newgame.board = [{move: ""},{move: ""},{move: ""},{move: ""},{move: ""},{move: ""},{move: ""},{move: ""},{move: ""}];
				ctrl.newgame.round = 0;
				ctrl.newgame.maxgames = numgames;
				ctrl.newgame.winner = "";
				ctrl.newgame.player1 = {name: "Player 1", symbol: 'X', wins: 0};
				ctrl.newgame.player2 = {name: "Player 2", symbol: 'O', wins: 0};
				ctrl.newgame.playerTurn = 0;
				ctrl.numgames = null;
				ctrl.newgame.$save(ctrl.newgame);							// use $save and pass in the changed object to save it to firebase
			};

			// Join game by passing in gameId as a parameter on ng-click
			// Set ctrl.board as $firebase array to loop through squares
			// Set ctrl.game as $firebase object to update values
			function getboard(gameId, num) {
				var gameref = new Firebase(GAME_LOCATION + gameId);
				var boardref = new Firebase(GAME_LOCATION + gameId + '/board');
				var player1ref = gameref.child('player1');
				var player2ref = gameref.child('player2');
				// ctrl.player1obj = $firebaseObject(player1ref);
				// ctrl.player2obj = $firebaseObject(player2ref);
				ctrl.game = $firebaseObject(gameref);
				ctrl.board = $firebaseArray(boardref);
				ctrl.gameId = gameId;
				if (num == 1) {
					ctrl.id = 1;
					player1ref.set({
						name: ctrl.name, symbol: 'X', wins: 0
					});
				}
				else if (num == 2) {
					ctrl.id = 2;
					player2ref.set({
						name: ctrl.name, symbol: 'O', wins: 0
					});
				}
			};

			function Player(name, symbol, wins) {
				this.name = name;
				this.symbol = symbol;
				this.wins = wins;
			};

			// return $firebase array of all game ID's to loop through using ng-repeat
			function getGames() {
				var listref = new Firebase(GAME_LOCATION + 'gamelist');
				return $firebaseArray(listref);
			};

			ctrl.click = function($index) {
				var square = ctrl.game.board[$index];
				if (square.move === 'X' || square.move === 'O') return;
				if (ctrl.game.playerTurn == 0 && ctrl.id == 1) {
					square.move = 'X';
					ctrl.game.playerTurn++;
					ctrl.game.round++
				}
				else if (ctrl.game.playerTurn == 1 && ctrl.id == 2) {
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
						ctrl.game.maxgames--;
						ctrl.game.winner = 1;
						ctrl.game.player1.wins++;
						$timeout(ctrl.clearGame, 1000);
					}
					else if (ctrl.game.combos[i].combo === 'OOO') {
						ctrl.game.maxgames--;
						ctrl.game.winner = 2;
						ctrl.game.player2.wins++;
						$timeout(ctrl.clearGame, 1000);
					}
					else if (ctrl.game.winner === "" && ctrl.game.round == 9) {
						ctrl.game.maxgames--;
						ctrl.game.winner = 3;
						$timeout(ctrl.clearGame, 1000);
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
				ctrl.gameover();
			};

			ctrl.gameover = function() {
				var currentRef = new Firebase(GAME_LOCATION + ctrl.gameId);
				var gamelistref = new Firebase(GAME_LOCATION + 'gamelist');
				var currentObj = $firebaseObject(currentRef);
				var gamelistArray = $firebaseArray(gamelistref);
				if (ctrl.game.maxgames == 0) {
					currentObj.$remove();
					for (var i = 0; i < gamelistArray.length; i++) {
						if (ctrl.gameId==gamelistArray[i].$value) {
							console.log(gamelistArray[i]);
							gamelistArray.$remove(i);
						}
					}
				};
			};

			// retrieve all chats
			function getChat() {
				var ref = new Firebase(GAME_LOCATION + 'chat');
				var chat = $firebaseArray(ref);
				return chat;
			}

			// add new text to chat box
			ctrl.addText = function(text){
				ctrl.chatList.$add(ctrl.name + ': ' + ctrl.text);
				ctrl.text = null;
			}

		};

})();