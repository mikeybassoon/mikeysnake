/*  Grabthar's Hammer

A Battlesnake by Mikeybassoon, but more object oriented this time!

Contains code from Battlesnake's official JS/Node Starter Snak
*/

const bodyParser = require('body-parser');
const express = require('express');
const fileSystem = require('fs');

const PORT = process.env.PORT || 3000

const app = express()
app.use(bodyParser.json())

app.get('/', handleIndex)
app.post('/start', handleStart)
app.post('/move', handleMove)
app.post('/end', handleEnd)

app.listen(PORT, () => console.log(`Battlesnake Server listening at http://127.0.0.1:${PORT}`))





// http request handler functions

function handleIndex(request, response) {
  console.log('Processing index request...');
  var battlesnakeInfo = {
    apiversion: '1',
    author: 'mikeybassoon',
    color: '#992288',
    head: 'sand-worm',
    tail: 'shac-coffee',
    version: "1.1.0"
  }
  response.status(200).json(battlesnakeInfo)
  console.log('Indexing request processed');
}

function handleStart(request, response) {
  // get current date/time info and start file logging
  const START_TIME = Date.now();
  const DATE_STRING = START_TIME.getFullYear() + '-' + (START_TIME.getMonth() + 1) + '-' + START_TIME.getDate() + '-' + START_TIME.getHours() + '-' + START_TIME.getMinutes() + '-' + START_TIME.getSeconds() + '.txt';


  var gameData = request.body

  // initialize the gameState
  // remember to include the filename for the log as one of the things initialized

  // start logging for this game


  console.log('START')
  response.status(200).send('ok')
}

function handleMove(request, response) {
  console.log('TURN ' + request.body.turn);

  var gameData = request.body;

  // call initializer to update gameState

  // call move logic to give move

  var availableMoves = ['up', 'down', 'left', 'right'];

  var move = randomMove(availableMoves); // text string for http response

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
