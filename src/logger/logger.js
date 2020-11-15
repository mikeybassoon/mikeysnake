/* logger.js

  Handles all logging for the Battlesnake and server

  In future will also handle HTTP requests for logs
*/

const fs = require('fs');



module.exports = {

  filenameTable: [],

  /* function createLogFile

    Parameters:
      <1> Game ID
  */
  createLogFile: (gameID)=> {
    var timestamp = new Date(); // get current time
    var filename = timestamp + '.txt'; // use timestamp as filename
    try{
      // package object
      var record = {
        'gameID': gameID,
        'filename': filename
      };
      filenameTable.push(record);
      fs.appendFileSync(filename, '\n');
      console.log(`Log file created for game ${gameID}`);
    }
    catch(err){
      console.log(`An error occurred while creating log file for ${gameID}:`);
      console.log(err);
    }
  },

  /* function log

    Parameters:
      <1> Game ID
      <2> String to log

    Appends the parameter string to the log file for this game
  */

  log: (gameID, logString)=> {
    var filename = filenameTable[gameID];
    var outputString = '--' + logString + '\n';
    try{
      fs.appendFileSync(filename, outputString);
    }
    catch(err){
      console.log(`Log operation failed.`);
      console.log(err);
    }
  },

  /* function logError

    Parameters:
      <1> Game ID
      <2> String to log

    Appends the parameter string to the log file for this game
  */

  logError: (gameID, logString)=> {
    var filename = filenameTable[gameID];
    var outputString = '!!ERROR: ' + logString + '\n';
    try{
      fs.appendFileSync(filename, outputString);
    }
    catch(err){
      console.log(`Log operation failed.`);
      console.log(err);
    }
  },

  /* function logFunctionEntrance

    Parameters:
      <1> Game ID
      <2> Name of function

    Appends the parameter string to the log file for this game
  */

  logFunctionEntrance: (gameID, logString)=> {
    var filename = filenameTable[gameID];
    var outputString = '>-' + logString + '\n';
    try{
      fs.appendFileSync(filename, outputString);
    }
    catch(err){
      console.log(`Log operation failed.`);
      console.log(err);
    }
  },

  /* function logFunctionExit

    Parameters:
      <1> Game ID
      <2> Name of function + return value if applicable

    Appends the parameter string to the log file for this game
  */

  logFunctionExit: (gameID, logString)=> {
    var filename = filenameTable[gameID];
    var outputString = '<-' + logString + '\n';
    try{
      fs.appendFileSync(filename, outputString);
    }
    catch(err){
      console.log(`Log operation failed.`);
      console.log(err);
    }
  }
};
