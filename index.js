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
  var mySnake; // info about player's snake
  var hungry = false; // flag for when food finding becomes priority
  var openSpaces = new Array; // array of unobstructed spaces

  // bind mySnake data to variable
  for(var i = 0; i < gameData.board.snakes.length; i++){
    if(gameData.board.snakes[i].name == 'Grabthar'){
      mySnake = gameData.board.snakes[i];
    }
  }

  // identify all open spaces on board
  for(var x = 0; x < board.width; x++){
    for(var y = 0; y < board.height; y++){
      var thisSpace = {
        'x': x,
        'y': y
      };

      if(spaceClear(thisSpace, board)){
        openSpaces.push(thisSpace);
      }
    }
  }

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

  // assemble pathfinder object for recursive route finding
  var pathfinder = {
    'counter': 0,
    'path': new Array,
    'clear': openSpaces,
    'targetValue': ESCAPE_ROUTE_SIZE
  };

  if(currentLocation.y != board.height){
    // package information for recursive pathfinding
    pathfinder.x = upLocation.x;
    pathfinder.y = upLocation.y;
    if(cavernIsClear(pathfinder)){
      possibleMoves.push('up');
    }
  }
  if(currentLocation.y != 0){
    // package info
    pathfinder.x = downLocation.x;
    pathfinder.y = downLocation.y;
    if(cavernIsClear(pathfinder)){
      possibleMoves.push('down');
    }
  }
  if(currentLocation.x != board.width){
    // package info
    pathfinder.x = rightLocation.x;
    pathfinder.y = rightLocation.y;
    if(cavernIsClear(pathfinder)){
      possibleMoves.push('right');
    }
  }
  if(currentLocation.x != 0){
    // package info
    pathfinder.x = leftLocation.x;
    pathfinder.y = leftLocation.y;
    if(cavernIsClear(pathfinder)){
      possibleMoves.push('left');
    }
  }


  // no move found yet that works?
  if(possibleMoves.length == 0){
    console.log('----No escape route available!');
    if(currentLocation.y != board.height - 1){ // can only move up if not on top row
      if(spaceClear(upLocation, board)){ //
        possibleMoves.push('up');
      }
    }

    // left?
    if(currentLocation.x != 0){ // can only go left if not in leftmost row
      if(spaceClear(leftLocation, board)){
        possibleMoves.push('left');
      }
    }

    // down?
    if(currentLocation.y != 0){ // can only go down if not in lowest row
      if(spaceClear(downLocation, board)){
        possibleMoves.push('down');
      }
    }

    // right?
    if(currentLocation.x != board.width - 1){ // can only move right if not in rightmost row
      if(spaceClear(rightLocation, board)){
        possibleMoves.push('right');
      }
    }
  }


  // MAKE MOVE


  var move;
  if(possibleMoves.length == 0){ // no legal move?
    console.log('No legal move available!');
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

/*
  function sameCoordinates
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



/*
  function spaceClear
  Checks if a given set of coordinates corresponds to a clear space on the board
  Returns true if the space represents a valid move
  Returns false if space obstructed/does not exist
*/
function spaceClear(targetCoordinates, board){

  for(var i = 0; i < board.hazards.length; i++){
    var thisHazard = board.hazards[i];
    var hazardCoordinates = {
      'x': thisHazard.x,
      'y': thisHazard.y
    };
    if(sameCoordinates(hazardCoordinates, targetCoordinates)){
      return false;
    }
  }

  for(var i = 0; i < board.snakes.length; i++){
    var thisSnake = board.snakes[i];
    var headCoordinates = {
      'x': thisSnake.head.x,
      'y': thisSnake.head.y
    };

    // check if a snake head in way
    if(sameCoordinates(headCoordinates, targetCoordinates)){
      return false;
    }

    // check if a snake body part is in way
    for(var j = 0; j < thisSnake.body.length; j++){
      var thisBodySegment = thisSnake.body[j];
      var bodyCoordinates = {
        'x': thisBodySegment.x,
        'y': thisBodySegment.y
      }

      if(sameCoordinates(bodyCoordinates, targetCoordinates)){
        return false;
      }
    }
  }

  return true;
}

/*
  function cavernIsClear

  CAUTION! Recursive!

  Parameters:
    <1> Pathfinder object containing:
      - x, y: coordinates of start point
      - array of clear spaces on the board
      - array of steps taken to reach this point
      - a counter value
      - the target value

  Returns true if a route can be found of specified minimum size, else returns false
*/
function cavernIsClear(pathfinder){
  var currentSpace = {
    'x': pathfinder.x,
    'y': pathfinder.y
  };
  var currentCount = pathfinder.counter;
  var currentPath = pathfinder.path;
  var clearSpaces = pathfinder.clear;
  var legalNextMoves = new Array;

  currentCount++; // increment length counter for current route
  if(currentCount == pathfinder.targetValue){ // target length reached?
    return true;
  }

  // identify all clear spaces adjacent to start point
  // check if space above free
  var upSpace = {
    'x': currentSpace.x,
    'y': currentSpace.y + 1
  };
  if(isClear(upSpace, clearSpaces)){ // if space above clear
    legalNextMoves.push(upSpace);
  }

  // check if space below free
  var downSpace = {
    'x': currentSpace.x,
    'y': currentSpace.y - 1
  };
  if(isClear(downSpace, clearSpaces)){
    legalNextMoves.push(downSpace);
  }

  // check if space to left free
  var leftSpace ={
    'x': currentSpace.x - 1,
    'y': currentSpace.y
  };
  if(isClear(leftSpace, clearSpaces)){
    legalNextMoves.push(leftSpace);
  }

  var rightSpace = {
    'x': currentSpace.x + 1,
    'y': currentSpace.y
  };
  if(isClear(rightSpace, clearSpaces)){
    legalNextMoves.push(rightSpace);
  }

  // if no clear spaces, return false
  if(legalNextMoves.length = 0){
    return false;
  }

  // for each clear space:
  for(var i = 0; i < legalNextMoves.length; i++){
    var nextMove = legalNextMoves[i];
    // package pathfinder object for next stage in function call
    var nextStep = {
      'x': nextMove.x,
      'y': nextMove.y,

      // REMOVE START POINT FROM THE CLEAR SPACES ARRAY
      // BUILD THE CLEAR SPACES ARRAY

      'path': currentPath.push({'x': nextMove.x, 'y': nextMove.y}),
      'counter': currentCount,
      'targetValue': pathfinder.targetValue
    };

    if(cavernIsClear(nextStep)){
      return true;
    }
  }

  // no clear path out found?
  return false;
}


/*
  function isClear()

  parameters:
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
