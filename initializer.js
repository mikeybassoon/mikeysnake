const game = require('./game.js');

/* function initialize
  Sets game ID and turn ID for a newly created game
  Parameters
    <1> Game data as sent in http request
  Preconditions:
    <> Must only be launched by new games

*/

exports.initialize = function(gameData){
  // package data so it can be passed to game object
  var currentGame = {
    'gameID': gameData.game.id,
    'turn': gameData.turn
  };

  game.createNewGame(currentGame); // create new game
}

exports.update = function(gameData){
  var gameID = gameData.game.id;
  var turn = gameData.turn;

  
}
