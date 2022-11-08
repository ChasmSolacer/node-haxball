var { Plugin } = require("../../src/index");

module.exports = function(){

  Plugin.call(this, "balanceTeams", true); // "balanceTeams" is plugin's name, "true" means "activated just after initialization". Every plugin should have a unique name.

  var _room = null, teams = [[], [], []], playerTeams = {};

  this.initialize = function(room){
    _room = room;
  };

  this.finalize = function(){
    _room = null;
    teams = null;
    playerTeams = null;
  };

  var balanceTeams = function(){
    // count players for each team
    var specCount = teams[0].length, redCount = teams[1].length, blueCount = teams[2].length;

    // if there is a spectator
    if (specCount>0){

      // if red team has more players, add the player to blue team
      if (redCount>blueCount)
        _room.setPlayerTeam(teams[0][0], 2);
      
      // if blue team has more players, add the player to red team
      else if (blueCount>redCount)
        _room.setPlayerTeam(teams[0][0], 1);
      
      // if player counts are equal for both teams, add the player to a random team
      else
        _room.setPlayerTeam(teams[0][0], 1+Math.floor(Math.random()*2));
    }

    // if there is no spectator
    else{

      // if red team has more than 1 extra player than blue team, move the last red player to blue
      if (redCount>blueCount+1)
        _room.setPlayerTeam(teams[1][teams[1].length-1], 2);

      // if blue team has more than 1 extra player than red team, move the last blue player to red
      else if (blueCount>redCount+1)
        _room.setPlayerTeam(teams[2][teams[2].length-1], 1);
    }
  };

  this.onPlayerJoin = function(id, name, flag, avatar, conn, auth, customData){
    // add the new player to spectators
    teams[0].push(id);

    // update player's team
    playerTeams[id] = 0;

    // balance teeams
    balanceTeams();
  };

  this.onPlayerLeave = function(id, reason, isBanned, byId, customData){
    // remove player from his/her team
    var currentTeam = teams[playerTeams[id]], idx = currentTeam?.findIndex((x)=>(x==id));
    if (idx>=0)
      currentTeam.splice(idx, 1);
    delete playerTeams[id];

    // balance teams
    balanceTeams();
  };

  this.onPlayerTeamChange = function(id, teamId, byId, customData){
    // remove player from his/her old team
    var currentTeam = teams[playerTeams[id]], idx = currentTeam?.findIndex((x)=>(x==id));
    if (idx>=0)
      currentTeam.splice(idx, 1);

    // add player to his/her new team
    teams[teamId].push(id);

    // update player's team
    playerTeams[id] = teamId;

    // balance teams
    balanceTeams();
  };

};