




function startmain(){
  var pomelo = require('pomelo');
  /**
   * Init app for client.
   */
  var app = pomelo.createApp();
  app.set('name', 'geohero_amap');

  // app configuration
  app.configure('production|development', 'connector', function(){
    app.set('connectorConfig',
      {
        connector : pomelo.connectors.hybridconnector,
        heartbeat : 3,
        useDict : true,
        useProtobuf : true
      });
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
  //     app.rpc.connector.entryHandler.OnExit();
  //   };
  //   process.on('SIGINT',func_beforeexit);
  //   process.on('SIGTERM',func_beforeexit);
  app.beforeStopHook(function() {
    console.log("\nServer Will Exit!!!");
    // do somethin when server exit...
    var myredis = require("redis"),
    myrediscli = myredis.createClient();
    myrediscli.set('exit_time',(new Date()).toString());
    myrediscli.quit();
  });
  
  // 显示异常。。。
  process.on('uncaughtException', function(err) {
    console.error(' Caught exception: ' + err.stack);
  });
  
  // start app
  console.log("server is run !!!");
  app.start();
}

function myentry(){  
  // clear old redis data....
  var myredis = require("redis"),
  myrediscli = myredis.createClient();
  myrediscli.flushdb( function (err, succeeded) {
    
    console.log("redis flushdb result:",typeof(succeeded),succeeded); // will be true if successfull
    myrediscli.quit();

    startmain();

  });
}






//->>>>>>>>>>>

myentry();










