const game = require('./game.js');

module.exports = function(){
  function initialize(gameData){
    var newGame = { // package data for new game
      'gameID': gameData.game.id,
      'turn': gameData.turn
    };
    game.createNewGame(newGame);
  }
}
