var { Plugin } = require("../../src/index");

module.exports = function(){

  Plugin.call(this, "breakConnection", true); // "breakConnection" is plugin's name, "true" means "activated just after initialization". Every plugin should have a unique name.

  var connectionShouldBreak = {};

  var breakConnection = function(byPlayerId, playerId){
    if (isNaN(byPlayerId) || isNaN(playerIdToBeControlled)) // parameters must be integers
      return;
    /*
    if (!breakConnectionPermitted[byPlayerId]) // example for custom permission logic
      return;
    */
    connectionShouldBreak[playerId] = true; // mark player
  };

  this.onOperationReceived = function(obj, msg, customData){ // this is host-only

    var playerId = operation.getValue(msg, "byPlayerId"); // find out who sent this message
    if (connectionShouldBreak[playerId]) // if player is marked
      throw ""; // connection is broken here. playerId will leave by himself without triggering a kick/ban event.
    
    switch (operation.type){
      case OperationType.SendChat:{ // if someone sent a chat message
        /*
        var m = operation.getValue(msg, "text");
        if (m.startsWith("!")){  // custom chat logic for extra commands
        */
        if (customData.isCommand){ // same as above 2 lines.
          var arr = customData.data; // same as var arr = m.trimEnd().split(" ");
          switch (arr[0]){
            case "!breakKick":
              breakConnection(playerId, parseInt(arr[1]));
              break;
          }
          return false; // block this event from being further processed and sent to clients
        }
        break;
      }
    }
    return true;
  };

  this.onPlayerLeave = function(id, reason, isBanned, byId, customData){
    // free extra memory allocated
    delete connectionShouldBreak[id];
  };
  
};