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


function handleIndex(request, response) {
  var battlesnakeInfo = {
    apiversion: '1',
    author: 'mikeybassoon',
    color: '#992288',
    head: 'sand-worm',
    tail: 'shac-coffee',
    version: "1.0.0"
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
  var gameID = gameData.game.id;


  var mySnake = function(gameData){
    var me;

    function findMe(snake){
      if(snake.name == 'Grabthar'){
        me = snake;
      }
    }

    gameData.board.snakes.foreach(findMe(this));

    return me;
  };
  console.log('Snake identified. ID: ' + mySnake.id);

  // identify valid directions for snake to travel
  var possibleMoves = new Array;

  var currentLocation = {
    'x': mySnake.head.x,
    'y': mySnake.head.y
  };

  // up?
  if(mySnake.head.y != gameData.board.height - 1){ // can only move up if not on top row
    var upLocation = {
      'x': currentLocation.x,
      'y': currectLocation.y + 1
    };

    if(spaceClear(upLocation, gameData.board)){ //
      possibleMoves.push('up');
    }
  }

  // left?
  if(mySnake.head.x != 0){ // can only go left if not in leftmost row
    var leftLocation = {
      'x': currentLocation.x - 1,
      'y': currentLocation.y
    };

    if(spaceClear(leftLocation, gameData.board)){
      possibleMoves.push('left');
    }
  }

  // down?
  if(mySnake.head.y != 0){ // can only go down if not in lowest row
    var downLocation = {
      'x': currentLocation.x,
      'y': currentLocation.y - 1
    };

    if(spaceClear(downLocation, gameData.board)){
      possibleMoves.push('down');
    }
  }

  // right?
  if(mySnake.head.x != gameData.board.width - 1){ // can only move right if not in rightmost row
    var rightLocation = {
      'x': currentLocation.x + 1,
      'y': currentLocation.y
    };

    if(spaceClear(rightLocation, gameData.board)){
      possibleMoves.push('right');
    }
  }

  var move;
  if(possibleMoves.length == 0){ // no legal move?
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
function spaceClear(coordinates, board){
  board.hazards.foreach(
    if(this->x == coordinates.x && this->y == coordinates.y){ // check if hazard in way
      return false;
    }
  );
  board.snakes.foreach(
    if(this->head.x == coordinates.x && this->head.y == coordinates.y){ // check if snake head in way
      return false;
    }
    this->body.foreach(
      if(this->x == coordinates.x && this->y == coordinates.y){ // check each body segment to see if in way
        return false;
      }
    );
  );

  return true;
}
