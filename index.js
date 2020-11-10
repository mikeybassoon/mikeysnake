const bodyParser = require('body-parser')
const express = require('express')

const PORT = process.env.PORT || 3000

const app = express()
app.use(bodyParser.json())

app.get('/', handleIndex)
app.post('/start', handleStart)
app.post('/move', handleMove)
app.post('/end', handleEnd)

app.listen(PORT, () => console.log(`Battlesnake Server listening at http://127.0.0.1:${PORT}`))

const ESCAPE_ROUTE_SIZE = 10; // default size of cavern required to make a move legal
const HUNGRY_TIME = 15; // point at which snake will start looking for food

/*  Coordinates Array - GLOBAL

  Stores lists of coordinates in order that the battlesnake will consume in trying to reach target
  Two dimensional
    [gameID_1]: { {x, y}, {x, y}, {x, y} },
    [gameID_2]: { ... }

*/
var directions = new Array;


// http request handler functions

function handleIndex(request, response) {
  var battlesnakeInfo = {
    apiversion: '1',
    author: 'mikeybassoon',
    color: '#992288',
    head: 'sand-worm',
    tail: 'shac-coffee',
    version: "1.0.3"
  }
  response.status(200).json(battlesnakeInfo)
}

function handleStart(request, response) {
  var gameData = request.body

  console.log('START')
  response.status(200).send('ok')
}

function handleMove(request, response) {
  var gameData = request.body;
  var board = gameData.board;
  var gameID = gameData.game.id;
  var mySnake = gameData.you; // info about player's snake
  var hungry = timeToEat(mySnake);
  var openSpaces = buildClearSpaceArray(board); // array of unobstructed spaces

  /* var strategy

    A string holding a descriptor of the strategy currently being pursued by the snake

    Acceptable values:
      buildNewPlan
      default
      findFood
      followPlan
  */
  var strategy = 'default';

  // get current movement plan
  var movementPlan = function(){
    for(var i = 0; i < directions.length; i++){ // for each set of directions in the directions array
      if(directions[gameID]){ // game plan exists for this game?
        return directions[gameID];
      }
    }
  };

  // perform check - does the current movement plan include no obstructed spaces?
  var validPlanExists = checkPlan(movementPlan, openSpaces);

  if(!hungry){
    if(validPlanExists){
      console.log('--Existing movement plan still works');
      strategy = 'followPlan';
    }
    else{
      console.log('--No valid plan available. Building a new one.');
      strategy = 'buildNewPlan';
    }
  }
  else{ // snake is hungry?
    console.log('--Snake is hungry. Seeking food.');
    strategy = 'findFood';
  }








  console.log('--MOVE gameID = ' + gameID);
  console.log('--TURN: ' + gameData.turn);
  console.log('--Snake identified. ID: ' + mySnake.id);
  console.log(`--Engaging move logic - current coordinates \[${mySnake.head.x}, ${mySnake.head.y}\]`);

  // identify valid directions for snake to travel
  var possibleMoves = new Array;

  // define all adjacent coordinates
  // check if a cavern-free path is available for each

  var currentLocation = {
    'x': mySnake.head.x,
    'y': mySnake.head.y
  };
  var upLocation = {
    'x': currentLocation.x,
    'y': currentLocation.y + 1
  };
  var leftLocation = {
    'x': currentLocation.x - 1,
    'y': currentLocation.y
  };
  var downLocation = {
    'x': currentLocation.x,
    'y': currentLocation.y - 1
  };
  var rightLocation = {
    'x': currentLocation.x + 1,
    'y': currentLocation.y
  };


  // identify available spaces to move into

  // up?
  if(isClear(upLocation, openSpaces)){
    console.log('--Up is valid direction');
    possibleMoves.push('up');
  }

  // left?
  if(isClear(leftLocation, openSpaces)){
    console.log('--Left is valid direction');
    possibleMoves.push('left');
  }

  // down?
  if(isClear(downLocation, openSpaces)){
    console.log('--Down is valid direction');
    possibleMoves.push('down');
  }

  // right?
  if(isClear(rightLocation, openSpaces)){
    console.log('--Right is valid direction');
    possibleMoves.push('right');
  }


  // decide next move

  console.log('--Deciding stretegy');
  var move; // text string for http response

  // note - each of the behaviours listed below in if() statement needs its own control logic
  if(strategy == 'default' && strategy == 'findFood' && strategy == 'buildNewPlan' && strategy == 'followPlan'){
    if(possibleMoves.length == 0){ // no legal moves?
      console.log('--No legal move available - performing default move');
      move = 'left'; // move up, game over anyway
    }
    else if(possibleMoves.length == 1){ // only one legal move?
      console.log('--Making only possible move');
      move = possibleMoves[0]; // make that move
    }
    else if(possibleMoves.length == 2){ // two choices?
      move = randomMove(possibleMoves);
      // run cavern check protocol
    }
    else if(possibleMoves.length == 3){ // three choices?
      move = randomMove(possibleMoves); // pick a random direction and move in it
      // future option: run the "circles" (holding pattern) protocol
    }
    else{ // should not be possible
      console.log('ERROR - invalid number of possibleMoves: ' + possibleMoves.length);
      move = 'left';
    }
  }


  // create HTTP response

  console.log('MOVE: ' + move)
  response.status(200).send({
    move: move
  })
}

function handleEnd(request, response) {
  var gameData = request.body

  console.log('END')
  response.status(200).send('ok')
}

// routing algorithm functions

function randomMove(availableMoves){
  return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}








// helper functions

/* function checkPlan

  Parameters:
    <1> Array of coordinates representing a navigation plan
    <2> Array of all spaces on the board deemed to be "clear"
  Returns true if all coordinates in planSpaces also match a coordinate pair in clearSpaces
  Else returns false

*/
function checkPlan(planSpaces, clearSpaces){
  if(planSpaces.length == 0){ // no planned route exists?
    return false;
  }
  for(var i = 0; i < planSpaces.length; i++){
    if(!isClear(planSpaces[i], clearSpaces)){ // found an obstructed space?
      return false;
    }
  }

  // no obstructed spaces on planned route found?
  return true;
}

/*  function erasePlan

  Takes current game ID
  Erases all coordinates in plan ID associated with it

*/

/* function timeToEat
  Parameter:
    <1> Snake object representing self
  Returns true if your snake needs to make locating food a priority
  Else returns false
*/
function timeToEat(snake){
  console.log('>--Inside timeToEat()');
  if(snake.health < HUNGRY_TIME){
    console.log('>>--Exiting timeToEat() - snek is hungry');
    return true;
  }

  console.log('>--Exiting timeToEat() - snek is not hungry');
  return false;
}

/*  function sameCoordinates

  Returns true if two sets of coordinates are the same
  Else returns false

  Precondition: both coordinates must have attributes 'x' and 'y'
*/
function sameCoordinates(space_a, space_b){
  console.log('>--Inside sameCoordinates()');
  if(space_a.x == space_b.x && space_a.y == space_b.y){
    return true;
  }

  console.log('>--Exiting sameCoordinates()');
  return false;
}

/*  function buildClearSpaceArray
  Constructs an array of all unobstructed coordinates on the board
  Parameters:
    <1> Board object
  Returns the array
*/
function buildClearSpaceArray(board){
  var clearSpaces = new Array;

  for(var x = 0; x < board.width; x++){
    for(var y = 0; y < board.height; y++){
      var coordinates = {
        'x': x,
        'y': y
      };
      if(!spaceOccupied(coordinates, board)){
        clearSpaces.push(coordinates);
      }
    }
  }

  return clearSpaces;
}

/*  function isClear
  Checks if a single space is on the list of unobstructed spaces
  Parameters:
    <1> {x, y} coordinates of space being checked
    <2> array of {x, y} coordinates with no obstruction
  Returns true if space being checked is on the list of free spaces
  Else returns false
*/
function isClear(checkSpace, clearSpaces){
  console.log('>--Entering isClear()');
  for(var i = 0; i < clearSpaces.length; i++){
    if(checkSpace.x == clearSpaces[i].x && checkSpace.y == clearSpaces[i].y){
      return true;
    }
  }

  return false;
}

/* function spaceOccupied
  Checks if a space is currently occupied by a hazard or snake
  Parameters:
    <1> {x, y} coordinates of space to be checked
    <2> Board object
  Returns true if occupied, else returns false
*/
function spaceOccupied(checkSpace, board){
  for(var i = 0; i < board.hazards.length; i++){
    if(checkSpace.x == board.hazards[i].x && checkSpace.y == board.hazards[i].y){;
      return true;
    }
  }
  for(var i = 0; i < board.snakes.length; i++){
    for(var j = 0; j < board.snakes[i].length; j++){
      if(checkSpace.x == board.snakes[i].body[j].x && checkSpace.y == board.snakes[i].body[j].y){
        return true;
      }
    }
  }
  return false;
}
