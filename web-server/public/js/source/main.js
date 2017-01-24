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

window.onerror = function(message, file, line, col, error) {
	console.log("onerror:->", message, file, line, col, error);

	return false;
};

var _gStartTime = new Date().getTime();

// window.onbeforeunload = function(e) {
// 		e.returnValue   =   "是否关闭？";
// 		return "aa";
// }

function entryFun() {
	console.log("entryFun",new Date().getTime()-_gStartTime);
	
	// first enter login procedure....
	_gdata.procedure_login.enter();
}


function loadFun() {
	// define base lib
	require.config({　　　　
		baseUrl: "js",
		paths: {
			"amap": "http://webapi.amap.com/maps?v=1.3&key=8a385884899dc9937cae3e807a55cdb6",
			
			"jquery": "lib/jquery-2.1.3.min",			
	//		"jquery": "http://ajax.aspnetcdn.com/ajax/jQuery/jquery-3.1.0.min",

 			"jqueryui": "lib/jquery-ui-1.12.0.custom/jquery-ui.min",
//			"jqueryui": "http://ajax.aspnetcdn.com/ajax/jquery.ui/1.11.4/jquery-ui.min",
			
			"pnotify": "lib/pnotify.custom.min",
			"md5": "lib/md5",
			"blockui": "lib/blockui/jquery.blockUI",
			
			"dropmenu": "lib/dropmenu/jquery.dropmenu",
			"circlemenu": "lib/circlemenu/circlemenu",
			
			"jquerytimer": "lib/jquery.timer"
		},
	});
	
	
	
	// begin load js.....
	
	console.log("0 begin load", _gStartTime);
	
	try{
		
	// load jquery lib first...
	require(['jquery', 'jqueryui'], function() {
		console.log("1 load jquery & ui ok", new Date().getTime()-_gStartTime);
		_gdata.model_jq = jQuery.noConflict();
		
		// load other lib...
		require(['jquerytimer', 'dropmenu', 'circlemenu', 'pnotify', 'md5', 'blockui', 'amap'], function() {
			console.log("2 load other lib ok", new Date().getTime()-_gStartTime);
			
			// first load map object...
			require(['source/mapmodul_amap'], function(_mymap) {
				console.log("3 load amap ok", new Date().getTime()-_gStartTime);
				_gdata.model_map = _mymap;
				_gdata.model_map.init('container');

				// hide loading img..
				var ploadingpage = document.getElementById("loadingpage");
				ploadingpage.parentNode.removeChild(ploadingpage);
				
				// load logic codes...
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
						console.log("4 load logic codes ok", new Date().getTime()-_gStartTime);
						
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

						

						entryFun();
					});// load game code..
			});// load map object
		});// load jquery timer
	});// load bas libs
	
	}catch(e){
		console.log("trycatch:->",e);
	}finally{
		
	}
		
}

loadFun();