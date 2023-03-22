module.exports = function(API){
  const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, Callback, Utils, Room, Replay, Query, RoomConfig, Plugin, Renderer, Errors, Language, Impl } = API;

  Object.setPrototypeOf(this, Plugin.prototype);
  Plugin.call(this, "autoPlay_mixed_inmemory_multiple", true, { // "autoPlay_mixed_inmemory_multiple" is plugin's name, "true" means "activated just after initialization". Every plugin should have a unique name.
    version: "0.2",
    author: "abc",
    description: `This is an auto-playing bot that has 2 different modes. 
    - followBall mode always follows the ball blindly, and kicks it whenever it is nearby without any direction checking. 
    - defensive mode follows the ball if it is near enough, otherwise goes back and tries to be just in the midpoint of ball and his team's goal line; and kicks the ball whenever it is nearby without any direction checking.
    This bot is capable of creating/removing fake bot players(id descending from 65535) in host's memory and controlling all of them at the same time using fake events.
    Available commands:
    - !add_bot [type = {-1, 0, 1}] [active = {0, 1}] [count] [name="in-memory-bot"] [flag="tr"] [avatar="XX"] [conn="fake-ip-do-not-believe-it"] [auth="fake-auth-do-not-believe-it"]: Adds a new bot with given properties. 0<[count]<=100, [type] = {-1: standing still, 0: followBall, 1: defensive}.
    - !remove_bot [count]: Removes the first [count] added bots that is still not removed. 0<[count]<=100.
    - !max_bot_count [count]: Sets the maximum allowed concurrent bot count to [count].
    - !bot_active [id] [active = {0, 1}]: Changes the activity of the bot player whose playerId is [id].
    - !bot_type [id] [type = {-1, 0, 1}]: Sets the bot type of the bot player whose playerId is [id]. [type] = {-1: standing still, 0: followBall, 1: defensive}.`,
    allowFlags: AllowFlags.CreateRoom // We allow this plugin to be activated on CreateRoom only.
  });

  // parameters are exported so that they can be edited outside this class.
  this.minCoordAlignDelta = this.defineVariable({
    name: "minCoordAlignDelta",
    description: "Minimum delta value for coordinate alignment", 
    type: VariableType.Number,
    value: 0.5, 
    range: {
      min: 0,
      max: 10,
      step: 0.5
    }
  });

  this.minKickDistance = this.defineVariable({
    name: "minKickDistance",
    description: "Minimum distance between ball and bot player for the bot player to start kicking the ball", 
    type: VariableType.Number,
    value: 8, 
    range: {
      min: 0,
      max: 15,
      step: 0.5
    }
  });

  this.maxDistanceToFollowBallCoeff = this.defineVariable({
    name: "maxDistanceToFollowBallCoeff",
    description: "Coefficient of max distance between ball and player for the bot to follow ball; otherwise it goes back to defense.", 
    type: VariableType.Number,
    value: 0.2, 
    range: {
      min: 0,
      max: 1,
      step: 0.01
    }
  });

  this.maxConcurrentBotCount = this.defineVariable({
    name: "maxConcurrentBotCount",
    description: "Maximum number of concurrently running bots.", 
    type: VariableType.Integer,
    value: 100, 
    range: {
      min: 1,
      max: Infinity,
      step: 1
    }
  });

  this.botsActive = this.defineVariable({
    name: "botsActive",
    description: "Whether all the bots are active or not.", 
    type: VariableType.Boolean,
    value: true
  });

  var room = null, that = this, dummyPromise = Promise.resolve(), originalRoomData;

  // is needed for ball follow logic to pause.
  // notice that this is being updated not only onPositionsReset
  var lastPositionsReset = 0;

  // move bot in random Y direction
  // to prevent stucking on hitting a ball on a same spot in a same manner.
  // it also fixes a bug when the bot doesn't move after positions resets
  // BUT instead, it creates a new bug... This is not the solution... Must change...
  var moveInRandomY = function(bot){
    if (bot){
      if (!bot.active)
        return;
      dummyPromise.then(()=>{ // this is just a way of doing this outside onGameTick callback.
        room.fakeSendPlayerInput(/*input:*/ Utils.keyState(0, [1, -1][Math.floor(Math.random() * 2)], false), /*byId:*/ bot.id); // unlike room.setKeyState, this function directly emits a keystate message.
      });
      return;
    }
    bots.forEach((bot)=>{
      if (!bot.active)
        return;
      dummyPromise.then(()=>{ // this is just a way of doing this outside onGameTick callback.
        room.fakeSendPlayerInput(/*input:*/ Utils.keyState(0, [1, -1][Math.floor(Math.random() * 2)], false), /*byId:*/ bot.id); // unlike room.setKeyState, this function directly emits a keystate message.
      });
    });
  };

  this.initialize = function(_room){
    room = _room;
    originalRoomData = room.state; // this object pointer never changes while inside a room, so we can store it here.
  };

  this.finalize = function(){
    room = null;
    originalRoomData = null;
  };

  var smallestBotId = 65535, largestBotId = 65535, bots = [];

  var addBot = function(active, type, count, name, flag, avatar, conn, auth){
    for (var i=0;i<count;i++){
      if (bots.length >= that.maxConcurrentBotCount)
        break;
      bots.push({
        id: smallestBotId, 
        active: active,
        type: type,
        keyState: 0
      });
      room.fakePlayerJoin(smallestBotId--, name || "in-memory-bot", flag || "tr", avatar || "XX", conn || "fake-ip-do-not-believe-it", auth || "fake-auth-do-not-believe-it");
    }
  };

  var removeBot = function(count){
    for (var i=0;i<count;i++){
      if (smallestBotId < largestBotId){
        bots.splice(bots.findIndex((x)=>(x.id==largestBotId)), 1);
        room.fakePlayerLeave(largestBotId--);
      }
      else
        break;
    }
  };

  this.onOperationReceived = function(type, msg, globalFrameNo, clientFrameNo, customData){
    switch (type){
      case OperationType.SendChat:{
        if (customData.isCommand){
          var byPlayer = originalRoomData.na(msg.byId);
          if (!byPlayer.isAdmin)
            return true;
          var arr = customData.data;
          switch (arr[0]){
            case "!add_bot": // usage: !add_bot [type = {-1, 0, 1}] [active = {0, 1}] [count] [name] [flag] [avatar] [conn] [auth]
              var x = parseInt(arr[2]), y = parseInt(arr[3]);
              if (!(x>=-1 || x<=1) || (y<=0 || y>100))
                return;
              addBot((arr[1]!="0"), x, y, arr[4], arr[5], arr[6], arr[7], arr[8]);
              break;
            case "!remove_bot": // usage: !remove_bot [count]
              var x = parseInt(arr[1]);
              if (x<=0 || x>100)
                return;
              removeBot(x);
              break;
            case "!max_bot_count":{ // usage: !max_bot_count [count]
              var x = parseInt(arr[1]);
              if (isNaN(x) || x<0)
                return;
              that.maxConcurrentBotCount = x;
              break;
            }
            case "!bot_active":{ // usage: !bot_active [id] [active = {0, 1}]
              var id = parseInt(arr[1]);
              var bot = bots.findIndex((x)=>(x.id==id));
              if (bot)
                bot.active = (arr[2]=="1");
              break;
            }
            case "!bot_type":{ // usage: !bot_type [id] [type = {-1, 0, 1}]
              var id = parseInt(arr[1]);
              var type = parseInt(arr[2]);
              if (!(type>=-1 || type<=1))
                return;
              var bot = bots.findIndex((x)=>(x.id==id));
              if (bot)
                bot.type = type;
              break;
            }
            case "!bots_active":{ // usage: !bots_active [active]
              that.botsActive = (arr[1]=="1");
              break;
            }
          }
          //return false; // do not block this event from being processed. it is done automatically in onAfterOperationReceived. 
        }
        break;
      }
    }
    return true;
  };

  var update = function(bot){
    var { state, gameState, gameStateExt } = room;
    gameState = gameStateExt || gameState;
    var cp = state.na(bot.id);
    var playerDisc = cp?.disc;
    if (!playerDisc)
      return;
    var teamId = cp.team.id, opponentTeamId = 3 - teamId;
    var goals = state.stadium.goals, ball = gameState.physicsState.discs[0];

    var targetX, targetY, sqrDistBetweenBallAndPlayer = (ball.pos.x-playerDisc.pos.x) * (ball.pos.x-playerDisc.pos.x) + (ball.pos.y-playerDisc.pos.y) * (ball.pos.y-playerDisc.pos.y);
    switch (bot.type){
      case 0:{ // always follow ball
        targetX = ball.pos.x;
        targetY = ball.pos.y;
        break;
      }
      case 1:{ // wait at defense + follow ball when near it
        var maxDistanceToFollowBall = that.maxDistanceToFollowBallCoeff * state.stadium.width;
        //var b = false;
    
        if (sqrDistBetweenBallAndPlayer > ((playerDisc.radius + ball.radius + maxDistanceToFollowBall) * (playerDisc.radius + ball.radius + maxDistanceToFollowBall))){
          var myGoal = goals.filter((g)=>(g.team.id==teamId))[0]; //, opponentGoal = goals[oppositeTeamId - 1];
          if (!myGoal)
            return;
          var MPofMyGoalX = (myGoal.p0.x + myGoal.p1.x) / 2, MPofMyGoalY = (myGoal.p0.y + myGoal.p1.y) / 2;
          targetX = (ball.pos.x + MPofMyGoalX) / 2;
          targetY = (ball.pos.y + MPofMyGoalY) / 2;
        }
        else{
          targetX = ball.pos.x;
          targetY = ball.pos.y;
          //b = true;
        }
        break;
      }
      default:
        return;
    }
    
    var deltaX = targetX - playerDisc.pos.x, deltaY = targetY - playerDisc.pos.y, dirX, dirY, kick;
    if (Math.abs(deltaX) < that.minCoordAlignDelta)
      dirX = 0;
    else 
      dirX = Math.sign(deltaX);
    if (Math.abs(deltaY) < that.minCoordAlignDelta)
      dirY = 0;
    else
      dirY = Math.sign(deltaY);

    //f(ball.pos.x, ball.pos.y, playerDisc.pos.x, playerDisc.pos.y, myGoal.p0.x, myGoal.p0.y, myGoal.p1.x, myGoal.p1.y)

    //var angle_PlayerToBall = Math.atan2(ball.pos.y-playerDisc.pos.y, ball.pos.x-playerDisc.pos.x);
    //var angle_BallToGoalDisc1 = Math.atan2(myGoal.p0.y-ball.pos.y, myGoal.p0.x-ball.pos.x);
    //var angle_BallToGoalDisc2 = Math.atan2(myGoal.p1.y-ball.pos.y, myGoal.p1.x-ball.pos.x);

    var maxSqrDist = (playerDisc.radius + ball.radius + that.minKickDistance) * (playerDisc.radius + ball.radius + that.minKickDistance);
    kick = (sqrDistBetweenBallAndPlayer < maxSqrDist);
    //console.log(bot.id, sqrDistBetweenBallAndPlayer, maxSqrDist, kick);

    // apply current keys
    var keyState = Utils.keyState(dirX, dirY, kick);
    dummyPromise.then(()=>{ // this is just a way of doing this outside onGameTick callback.
      // sending keystate on EVERY game tick causes desync when you deactivate game's browser tab. 
      // this happens because requestAnimationFrame is being used. 
      // therefore, we are trying to limit consequent sending.
      if (keyState!=bot.keyState || kick!=cp.isKicking){ // isKicking: whether x key is active in-game (the circle around players is painted white if isKicking is true)
        if ((keyState==bot.keyState) && kick && !cp.isKicking) // if keyStates are the same and we are trying to kick, but the x key is not active in game,
          room.fakeSendPlayerInput(keyState & -17, bot.id); // we have to release x key before pressing it again. (keyState & -17) changes only the 5th(kick) bit of keyState to 0.
        room.fakeSendPlayerInput(keyState, bot.id); // unlike room.setKeyState, this function directly emits a keystate message.
        bot.keyState = keyState;
      }
    });
  };

  this.onGameStart = function(){
    lastPositionsReset = Date.now();
    moveInRandomY();
  };

  this.onGameTick = function(customData){
    if (!that.botsActive)
      return;

    // do not apply ball follow logic for maybe 150ms.
    // is needed for moveInRandomY() to work
    if (Date.now() - lastPositionsReset < 150) return;

    bots.forEach((bot)=>{
      if (!bot.active)
        return;
      update(bot);
    });
  };

  this.onPlayerTeamChange = function(id){
    var bot = bots.find((x)=>x.id==id);
    if (bot) {
      lastPositionsReset = Date.now();
      moveInRandomY(bot);
    }
  };

  this.onPositionsReset = function(){
    lastPositionsReset = Date.now();
    moveInRandomY();
  };
};
