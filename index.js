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

// http request handler functions

function handleIndex(request, response) {
  var battlesnakeInfo = {
    apiversion: '1',
    author: 'mikeybassoon',
    color: '#992288',
    head: 'sand-worm',
    tail: 'shac-coffee',
    version: "1.0.1"
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

  console.log('--MOVE gameID = ' + gameID);
  console.log('--TURN: ' + gameData.turn);
  console.log('--Snake identified. ID: ' + mySnake.id);
  console.log('--Engaging move logic');

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
  if(isClear(upLocation, board)){
    console.log('--Up is valid direction');
    possibleMoves.push('up');
  }

  // left?
  if(isClear(leftLocation, board)){
    console.log('--Left is valid direction');
    possibleMoves.push('left');
  }

  // down?
  if(isClear(downLocation, board)){
    console.log('--Down is valid direction');
    possibleMoves.push('down');
  }

  // right?
  if(isClear(rightLocation, board)){
    console.log('--Right is valid direction');
    possibleMoves.push('right');
  }


  // set target coordinates for travel


  // MAKE MOVE


  var move;
  if(possibleMoves.length == 0){
    console.log('--No legal move available - performing default move');
    move = 'left'; // move up, game over anyway
  } else
    move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)]; // select a random legal move

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

// helper functions

/* function timeToEat
  Parameter:
    <1> Snake object representing self
  Returns true if your snake needs to make locating food a priority
  Else returns false
*/
function timeToEat(snake){
  if(snake.health < HUNGRY_TIME){
    return true;
  }
  return false;
}

/*  function sameCoordinates

  Returns true if two sets of coordinates are the same
  Else returns false

  Precondition: both coordinates must have attributes 'x' and 'y'
*/
function sameCoordinates(space_a, space_b){
  if(space_a.x == space_b.x && space_a.y == space_b.y){
    return true;
  }
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
  for(var i = 0; i < clearSpaces.length; i++){
    if(checkSpace.x == clearSpaces[i].x && checkSpace.y == clearSpaces[i].y){
      return true;
    }
  }

  // no match in clearSpaces list?
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
    if(checkSpace.x == board.hazards[i].x && checkSpace.y == board.hazards[i].y){
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
}
