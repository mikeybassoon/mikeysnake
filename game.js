/* game.js

  Contains game manager object

  Checks game ID, gets appropriate board analysis object
    Initializes board analysis object if not up to date
*/

module.exports = function(){
  var games = new Array;

  var currentGameExists = function (gameID){
    for(var i = 0; i < games.length; i++){
      if(games[i].id == gameID){
        return true;
      }
    }
    return false;
  }

  function createNewGame(data){
    games.push(data);
  }

};
