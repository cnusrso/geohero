
var myapp = null;



function startmain(){

  var pomelo = require('pomelo');
  var myrouteUtil = require('./app/utils/routeUtil');
  /**
   * Init app for client.
   */
  myapp = pomelo.createApp();
  myapp.set('name', 'geohero_'+myapp.getServerId());

  console.info("server begin start ->",myapp.getServerId());

  myapp.configure('production|development', 'gate', function(){
    myapp.set('connectorConfig',
      {
        connector : pomelo.connectors.hybridconnector,
      });
  });

  // config connect server
  myapp.configure('production|development', 'connector', function(){
    myapp.set('connectorConfig',{
      connector : pomelo.connectors.hybridconnector,
      heartbeat : 3,
      useDict : true,
      useProtobuf : true
    });

    // set route gameserver config
    myapp.route('game', myrouteUtil.game);

    myapp.set('_rediscl',require('./app/utils/redisHandler')(myapp));
    myapp.set('_commonutil',require('./app/utils/commonUtil'));
    myapp.set('_tableUtil',require('./app/utils/tableUtil'));
    myapp.set('_databaseUtil',require('./app/utils/databaseOp')());
    myapp.set('_directionUtil',require('./app/utils/directionOp')());
  });

  // config game server...
  myapp.configure('production|development', 'game', function(){
    myapp.set('connectorConfig',{
      connector : pomelo.connectors.hybridconnector,
    });


    myapp.set('_rediscl',require('./app/utils/redisHandler')(myapp));
    myapp.set('_commonutil',require('./app/utils/commonUtil'));
    myapp.set('_tableUtil',require('./app/utils/tableUtil'));
    myapp.set('_databaseUtil',require('./app/utils/databaseOp')());
    myapp.set('_directionUtil',require('./app/utils/directionOp')());

  });

  
  // 显示异常。。。
  process.on('uncaughtException', function(err) {
    console.error(' Caught exception: ' + err.stack);
  });
  //处理退出的事件。。。
  //   var func_beforeexit = function(){
  //     var nDelaySecond = 5;
  //     console.info("\nServer Will Exit After ",nDelaySecond," s");
  //     setInterval(function(){
  //       console.info("\nServer Will Exit After ",--nDelayTime," s");
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
    console.info("Server Will Exit!!!",myapp.getServerId());
    // do somethin when server exit...
    // if(myapp.getServerType() == "connector"){
    //   console.log("myapp.rpc:->",myapp.rpc);
    // }

    // if(myapp.getServerType() == "master"){
    //   var myredis = require("redis"),
    //   myrediscli = myredis.createClient();
    //   myrediscli.set('master_exit_time',(new Date()).toString());
    //   myrediscli.quit();
    // }
    
  });
  
  
  
  // clear old redis data....
  if(myapp.getServerType() == "master"){
    var myredis = require("redis"),
    myrediscli = myredis.createClient();
    myrediscli.flushdb( function (err, succeeded) {
      console.info("redis flushdb result:",typeof(succeeded),succeeded); // will be true if successfull
      myrediscli.quit();

      
      
      
    });
  }
    
  

  
  
  
  // start app
  console.info("server will start ->",myapp.getServerId());
  myapp.start();
  
}






//->>>>>>>>>>>

startmain();










