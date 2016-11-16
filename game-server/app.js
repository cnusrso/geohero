




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


    app.beforeStopHook(function(app,cb){
  //     var logger = require('pomelo-logger').getLogger('log', __filename, process.pid);
  //     process.env.LOGGER_LINE = true;
  //     logger.info('app will stop!!!!!!!!!!');
      app.rpc.connector.entryHandler.OnExit();


      cb();
    });
  });

  // start app
  app.start();

  process.on('uncaughtException', function (err) {
    console.error(' Caught exception: ' + err.stack);
  });
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
console.log("i am run !!!");
myentry();










