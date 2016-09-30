// define global value..............
_gdata = {
	model_map:null,
	model_jq:null,
	model_datacfg:null,
	model_userdata:null,
	model_util:null,
	model_notify:null,
	model_netmgr:null,
	procedure_login:null,
	procedure_main:null,
};


function entryFun() {
	console.log("entryFun",new Date());
	
	// first enter login procedure....
	_gdata.procedure_login.enter();
}
function entryFun() {
  _gdata.model_jq = jQuery.noConflict();
  
  // begin load js
  // first load map object...
  require(['source/mapmodul_amap'], function(_mymap) {
    console.log("load amap ok", new Date());
    _gdata.model_map = _mymap;
    _gdata.model_map.init('container');
    
    // load game codes...
    require(
      [
        'source/datadefine',
        'source/userdata',
        'source/util',
        'source/notifymodul',
        'source/netmodul_pomelo',
        'source/procedure_loginregist',
        'source/procedure_main'
      ],
      function(_datadefine, _userdata, _util, _notify, _netmgr, _proce_lr, _proce_main) {
        _gdata.model_datacfg = _datadefine;
        _gdata.model_userdata = _userdata;
        _gdata.model_util = _util;
        _gdata.model_notify = _notify;
        _gdata.model_notify.init();
        _gdata.model_netmgr = _netmgr;
        _gdata.model_netmgr.init();

        _gdata.procedure_login = _proce_lr;
        _gdata.procedure_login.init();

        _gdata.procedure_main = _proce_main;
        _gdata.procedure_main.init();


        console.log("load game codes ok", new Date());

        entryFun();
      });
  });
}


entryFun();