const game = require('./game.js');

exports.initialize = function(gameData){
  // package data so it can be passed to game object
  var currentGame = {
    'gameID': gameData.game.id,
    'turn': gameData.turn
  };

  if(!game.currentGameExists){ // current game does not have an entry on server yet?
    game.createNewGame(currentGame); // create new game
  }
}
