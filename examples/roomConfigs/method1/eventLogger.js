function roomCallback(room){ // examples start from here.

  this.onOperationReceived = function(obj, msg, globalFrameNo, clientFrameNo, customData){
    console.log("onOperationReceived...", obj, msg, globalFrameNo, clientFrameNo, customData);
    return true;
  };

  this.onRoomLink = function(link, customData){
    console.log("onRoomLink...", link, customData);
  };

  this.onPlayerBallKick = function(playerId, customData){
    console.log("onPlayerBallKick...", playerId, customData);
  };

  this.onTeamGoal = function(teamId, customData){
    console.log("onTeamGoal...", teamId, customData);
  };

  this.onGameEnd = function(winningTeamId, customData){
    console.log("onGameEnd...", winningTeamId, customData);
  };

  this.onGameTick = function(customData){
    //console.log("onGameTick...", customData);
  };

  this.onPlayerSyncChange = function(playerId, value, customData){
    console.log("onPlayerSyncChange...", playerId, value, customData);
  };

  this.onAnnouncement = function(msg, color, style, sound, customData){
    console.log("onAnnouncement...", msg, color, style, sound, customData);
  };

  this.onAutoTeams = function(playerId1, teamId1, playerId2, teamId2, byId, customData){
    console.log("onAutoTeams...", playerId1, teamId1, playerId2, teamId2, byId, customData);
  };

  this.onScoreLimitChange = function(value, byId, customData){
    console.log("onScoreLimitChange...", value, byId, customData);
  };

  this.onTimeLimitChange = function(value, byId, customData){
    console.log("onTimeLimitChange...", value, byId, customData);
  };

  this.onPlayerAdminChange = function(id, isAdmin, byId, customData){
    console.log("onPlayerAdminChange...", id, isAdmin, byId, customData);
  };

  this.onPlayerAvatarChange = function(id, value, customData){
    console.log("onPlayerAvatarChange...", id, value, customData);
  };

  this.onPlayerTeamChange = function(id, teamId, byId, customData){
    console.log("onPlayerTeamChange...", id, teamId, byId, customData);
  };

  this.onStadiumChange = function(stadium, byId, customData){
    console.log("onStadiumChange...", stadium, byId, customData);
  };

  this.onTeamsLockChange = function(value, byId, customData){
    console.log("onTeamsLockChange...", value, byId, customData);
  };

  this.onPlayerObjectCreated = function(playerObj, customData){
    console.log("onPlayerObjectCreated...", playerObj, customData);
  };

  this.onPlayerJoin = function(playerObj, customData){
    console.log("onPlayerJoin...", playerObj, customData);
  };

  this.onGamePauseChange = function(isPaused, byId, customData){
    console.log("onGamePauseChange...", isPaused, byId, customData);
  };

  this.onPlayerChat = function(id, message, customData){
    console.log("onPlayerChat...", id, message, customData);
  };

  this.onPlayerInputChange = function(id, value, customData){
    console.log("onPlayerInputChange...", id, value, customData);
  };

  this.onPlayerChatIndicatorChange = function(id, value, customData){
    console.log("onPlayerChatIndicatorChange...", id, value, customData);
  };

  this.onPlayerLeave = function(playerObj, reason, isBanned, byId, customData){
    console.log("onPlayerLeave...", playerObj, reason, isBanned, byId, customData);
  };

  this.onSetDiscProperties = function(id, type, data1, data2, customData){
    console.log("onSetDiscProperties...", id, type, data1, data2, customData);
  };

  this.onKickRateLimitChange = function(min, rate, burst, byId, customData){
    console.log("onKickRateLimitChange...", min, rate, burst, byId, customData);
  };

  this.onGameStart = function(byId, customData){
    console.log("onGameStart...", byId, customData);
  };

  this.onKickOff = function(customData){
    console.log("onKickOff...", customData);
  };

  this.onLocalFrame = function(localFrameNo, customData){
    //console.log("onLocalFrame...", localFrameNo, customData);
  };

  this.onGameStop = function(byId, customData){
    console.log("onGameStop...", byId, customData);
  };

  this.onPingData = function(array, customData){
    console.log("onPingData...", array, customData);
  };

  this.onExtrapolationChange = function(value, customData){
    console.log("onExtrapolationChange...", value, customData);
  };

  this.onHandicapChange = function(value, customData){
    console.log("onHandicapChange...", value, customData);
  };

  this.onBansClear = function(customData){
    console.log("onBansClear...", customData);
  };

  this.onRoomRecaptchaModeChange = function(on, customData){
    console.log("onRoomRecaptchaModeChange...", on, customData);
  };

  this.onRoomPropertiesChange = function(props, customData){
    console.log("onRoomPropertiesChange...", props, customData);
  };

  this.onTeamColorsChange = function(teamId, value, byId, customData){
    console.log("onTeamColorsChange...", teamId, value, byId, customData);
  };

  this.onTimeIsUp = function(customData){
    console.log("onTimeIsUp...", customData);
  };

  this.onPositionsReset = function(customData){
    console.log("onPositionsReset...", customData);
  };

  this.onRoomRecordingChange = function(value, customData){
    console.log("onRoomRecordingChange...", value, customData);
  };

  this.onPluginActiveChange = function(plugin, customData){
    console.log("onPluginActiveChange...", plugin, customData);
  };

  this.onCollisionDiscVsDisc = function(discId1, discPlayerId1, discId2, discPlayerId2, customData){
    console.log("onCollisionDiscVsDisc...", discId1, discPlayerId1, discId2, discPlayerId2, customData);
  };

  this.onCollisionDiscVsSegment = function(discId, discPlayerId, segmentId, customData){
    console.log("onCollisionDiscVsSegment...", discId, discPlayerId, segmentId, customData);
  };

  this.onCollisionDiscVsPlane = function(discId, discPlayerId, planeId, customData){
    console.log("onCollisionDiscVsPlane...", discId, discPlayerId, planeId, customData);
  };

  this.onCustomEvent = function(type, data, byId, customData){
    console.log("onCustomEvent...", type, data, byId, customData);
  };

  this.onConfigUpdate = function(oldRoomConfigObj, newRoomConfigObj, customData){
    console.log("onConfigUpdate...", oldRoomConfigObj, newRoomConfigObj, customData);
  };

  this.onRendererUpdate = function(oldRendererObj, newRendererObj, customData){
    console.log("onRendererUpdate...", oldRendererObj, newRendererObj, customData);
  };

  this.onPluginUpdate = function(oldPluginObj, newPluginObj, customData){
    console.log("onPluginUpdate...", oldPluginObj, newPluginObj, customData);
  };

};
