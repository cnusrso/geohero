
var myapp = null;



function startmain(){

  var pomelo = require('pomelo');
  var myrouteUtil = require('./app/utils/routeUtil');
  /**
   * Init app for client.
   */
  myapp = pomelo.createApp();
  myapp.set('name', 'geohero_'+myapp.getServerId());

  console.log("server begin start ->",myapp.getServerId());

  myapp.set('connectorConfig',
  {
    connector : pomelo.connectors.hybridconnector,
    heartbeat : 3,
    useDict : true,
    useProtobuf : true
  });
  
  // app configuration connector server
  myapp.configure('production|development', 'connector', function(){
    
  });

  // config game server
  myapp.configure('production|development', 'game', function(){
    
  });

  // set route gameserver config
  myapp.route('game', myrouteUtil.game);

  
  // 显示异常。。。
  process.on('uncaughtException', function(err) {
    console.error(' Caught exception: ' + err.stack);
  });
  //处理退出的事件。。。
  //   var func_beforeexit = function(){
  //     var nDelaySecond = 5;
  //     console.log("\nServer Will Exit After ",nDelaySecond," s");
  //     setInterval(function(){
  //       console.log("\nServer Will Exit After ",--nDelayTime," s");
  //     },1000);
  //     setTimeout(function(){
  //         process.exit(1);
  //      }, 5000);

  //     // do somethin when server exit...
  //     myapp.rpc.connector.entryHandler.OnExit();
  //   };
  //   process.on('SIGINT',func_beforeexit);
  //   process.on('SIGTERM',func_beforeexit);
  myapp.beforeStopHook(function() {
    console.log("Server Will Exit!!!",myapp.getServerId());
    // do somethin when server exit...
    if(myapp.getServerType() == "connector"){
      var myredis = require("redis"),
      myrediscli = myredis.createClient();
      myrediscli.set('exit_time',(new Date()).toString());
      myrediscli.quit();
    }
    
  });
  
  
  
  // clear old redis data....
  if(myapp.getServerType() == "master"){
    var myredis = require("redis"),
    myrediscli = myredis.createClient();
    myrediscli.flushdb( function (err, succeeded) {
      console.log("redis flushdb result:",typeof(succeeded),succeeded); // will be true if successfull
      myrediscli.quit();

      
      
      
    });
  }
    
  

  
  
  
  // start app
  console.log("server will start ->",myapp.getServerId());
  myapp.start();
  
}






//->>>>>>>>>>>

startmain();










