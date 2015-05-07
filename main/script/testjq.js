var $jq = jQuery.noConflict();

var stack_bar_top = {"dir1": "down", "dir2": "right", "push": "top", "spacing1": 0, "spacing2": 0};

var ggmap;

// https://maps.googleapis.com/maps/api/staticmap?center=39.907754,116.397675&zoom=17&size=320x320&scale=2&maptype=satellite&key=AIzaSyAZpUCjk-shqijXiYtbtItICYF7nMVPLZo

function onClickBtnFun_Signin(eventObject)
{
	eventObject.stopPropagation(); 
	eventObject.preventDefault();
	$jq( "#dialog-SignIn" ).dialog( "option", "position", { my: "center", at: "center", of: window } );
	$jq( "#dialog-SignIn" ).dialog( "open" );
}

function onClickBtnFun_Register(eventObject)
{
	eventObject.stopPropagation(); 
	eventObject.preventDefault();
	$jq( "#dialog-Register" ).dialog( "option", "position", { my: "center", at: "center", of: window } );
	$jq( "#dialog-Register" ).dialog( "open" );
}

function myfun_CheckUserNameHasInvalidText(sUserName)
{
	var pInvalidTextList = [" ",",",".","/","\\","-","_","`","~"];
	
	
	var len = pInvalidTextList.length;
	for(var i = 0; i < len; ++ i)
	{
		var s = pInvalidTextList[i];
		var curindex = sUserName.indexOf(s);
		if(curindex != -1)
		{
			return s;
		}
	}
	
	return "";
}

function onRegisterResult(pData)
{
	console.info(pData.msg);
	
	if(pData.code == 200)
	{
		
		new PNotify({
            title: 'Register Ok',
            text: "Welcome New User \""+pData.account+"\" Enter World!!!",
			addclass: "stack-bar-top",
			stack: stack_bar_top,
			remove: true,
			hide: true,
			delay: 1000,
			nonblock: {
				nonblock: true,
				nonblock_opacity: .2
			}
        });
		
		$jq("#btn-Account").text(pData.account);
		$jq("#accountinfo_account").val(pData.account);
		
		localStorage.setItem("SignInAccount",pData.account);
		localStorage.setItem("SignInKey",pData.msg);
	}
	else
	{
		new PNotify({
            title: 'Register Failed',
            text: "\""+pData.account+"\" Register Failed("+pData.code+") "+pData.msg,
			addclass: "stack-bar-top",
			stack: stack_bar_top,
			remove: true,
			hide: true,
			delay: 2000,
			nonblock: {
				nonblock: true,
				nonblock_opacity: .2
			}
        });
	}
}

function onSignInResult(pData)
{
	console.info(pData.msg);
	
	if(pData.code == 200)
	{
		new PNotify({
            title: 'SignIn Ok',
            text: "\""+pData.account+"\" Enter World!!!",
			addclass: "stack-bar-top",
			stack: stack_bar_top,
			remove: true,
			hide: true,
			delay: 1000,
			nonblock: {
				nonblock: true,
				nonblock_opacity: .2
			}
        });
		
		$jq("#btn-Account").text(pData.account);
		$jq("#accountinfo_account").val(pData.account);
		
		
		localStorage.setItem("SignInAccount",pData.account);
		localStorage.setItem("SignInKey",pData.msg);
		
		
		var mypomelo = window.pomelo;
		var host = "54.148.7.1";
		var port = "3010";
		mypomelo.init({host: host,port: port,log: true}, function() {
			var pMsg = {};
			pMsg.username = pData.account;
			
			mypomelo.request("connector.entryHandler.getLastLatLngByAccount", pMsg, function(data) {
				
				mypomelo.disconnect();
				
				console.log(data);
				ggmap.panTo({lat: Number(data.lat), lng: Number(data.lng)});
				
			});
			
		});
	}
	else
	{
		new PNotify({
            title: 'SignIn Failed',
            text: "\""+pData.account+"\" SignIn Failed("+pData.code+") "+pData.msg,
			addclass: "stack-bar-top",
			stack: stack_bar_top,
			remove: true,
			hide: true,
			delay: 2000,
			nonblock: {
				nonblock: true,
				nonblock_opacity: .2
			}
        });
	}
}

function onSignOutResult(pData)
{
	console.info(pData.msg);
	
	if(pData.code == 200)
	{
		new PNotify({
			title: 'Sign Out',
			text: "You Are Leave World!!!",
			addclass: "stack-bar-top",
			stack: stack_bar_top,
			remove: true,
			hide: true,
			delay: 1000,
			nonblock: {
				nonblock: true,
				nonblock_opacity: .2
			}
		});
		
		localStorage.removeItem("SignInAccount");
		localStorage.removeItem("SignInKey");
		$jq("#btn-Account").text("Not SignIn");
		
	}
	else
	{
		new PNotify({
            title: 'SignOut Failed',
            text: "\""+pData.account+"\" SignIn Failed("+pData.code+") "+pData.msg,
			addclass: "stack-bar-top",
			stack: stack_bar_top,
			remove: true,
			hide: true,
			delay: 2000,
			nonblock: {
				nonblock: true,
				nonblock_opacity: .2
			}
        });
	}
	
	localStorage.removeItem("SignInAccount");
	localStorage.removeItem("SignInKey");
	$jq("#btn-Account").text("Not SignIn");
	
	
	
}


// click account btn
function onClickBtnFun_Account(eventObject)
{
	eventObject.stopPropagation(); 
	eventObject.preventDefault();
	
	var sSignInAccount = localStorage.getItem("SignInAccount");
	if(sSignInAccount != undefined)
	{
		$jq( "#dialog-AccountInfo" ).dialog( "option", "position", { my: "center", at: "center", of: window } );
		$jq( "#dialog-AccountInfo" ).dialog( "open" );
	}
	else
	{
		$jq( "#dialog-SignIn" ).dialog( "option", "position", { my: "center", at: "center", of: window } );
		$jq( "#dialog-SignIn" ).dialog( "open" );
	}
}



function entryFun( ) {
	console.log( "document ready" );
	
	
	$jq( "#dialog-SignIn" ).dialog({
      autoOpen: false,
      modal: true,
	  resizable: false,
      show: { effect: "blind", duration: 800 },
	  buttons: [
		{
			text: "SignIn",
			title: "Happy To Enjoy All World!",
			icons: {
				primary: "ui-icon-heart"
			},
			click: function() {
				var sUserInputAccount = $jq("#signin_account").val();
				if(sUserInputAccount.length <= 0)
				{
					new PNotify({
						title: 'Info',
						text: "Please Input Your Account!",
						addclass: "stack-bar-top",
						stack: stack_bar_top,
						remove: true,
						hide: true,
						delay: 2000,
						nonblock: {
							nonblock: true,
							nonblock_opacity: .2
						}
					});
					
					return;
				}
				var sUserInputpwd = $jq("#signin_password").val();
				if(sUserInputpwd.length <= 0)
				{
					new PNotify({
						title: 'Info',
						text: "Please Input Your Password!",
						addclass: "stack-bar-top",
						stack: stack_bar_top,
						remove: true,
						hide: true,
						delay: 2000,
						nonblock: {
							nonblock: true,
							nonblock_opacity: .2
						}
					});
					return;
				}
				
				  
				
				$jq('body').block({ 
					message: '<h1>Wait SignIn...</h1>', 
					css: { border: '3px solid #a00' } 
				});
				
				var mypomelo = window.pomelo;
				var host = "54.148.7.1";
				var port = "3010";
				
				mypomelo.init({host: host,port: port,log: true}, function() {
					var pMsg = {};
					pMsg.username = sUserInputAccount;
					pMsg.password = CryptoJS.MD5(sUserInputAccount+sUserInputpwd).toString();
					pMsg.deviceid = "html";
					
					mypomelo.request("connector.entryHandler.check_SignIn", pMsg, function(data) {
						
						mypomelo.disconnect();
						$jq('body').unblock();
						
						onSignInResult(data);
						
					});
					
				});
			
				$jq( this ).dialog( "close" );
			}
		},
		{
			text: "Register",
			title: "No Account? Now Get It!",
			icons: {
				primary: "ui-icon-heart"
			},
			click: function() {
				$jq( this ).dialog( "close" );
			
				$jq( "#dialog-Register" ).dialog( "option", "position", { my: "center", at: "center", of: window } );
				$jq( "#dialog-Register" ).dialog( "open" );
			}
		}
	  ]
    });
	// $jq("#btn-SignIn").on("click",onClickBtnFun_Signin);
	
	
	$jq( "#dialog-Register" ).dialog({
      autoOpen: false,
      modal: true,
	  resizable: false,
      show: { effect: "blind", duration: 800 },
	  buttons: [
		{
		  text: "Register",
		  icons: {
			primary: "ui-icon-heart"
		  },
		  click: function() {
			
			var sUserInputAccount = $jq("#register_account").val();
			if(sUserInputAccount.length <= 0)
			{
				new PNotify({
					title: 'Info',
					text: "Please Input Your Account!",
					addclass: "stack-bar-top",
					stack: stack_bar_top,
					remove: true,
					hide: true,
					delay: 2000,
					nonblock: {
						nonblock: true,
						nonblock_opacity: .2
					}
				});
				return;
			}
			var sUserInputpwd = $jq("#register_password").val();
			if(sUserInputpwd.length <= 0)
			{
				new PNotify({
					title: 'Info',
					text: "Please Input Your Password!",
					addclass: "stack-bar-top",
					stack: stack_bar_top,
					remove: true,
					hide: true,
					delay: 2000,
					nonblock: {
						nonblock: true,
						nonblock_opacity: .2
					}
				});
				return;
			}
			var sUserInputpwd_ = $jq("#register_againpassword").val();
			if(sUserInputpwd_.length <= 0)
			{
				new PNotify({
					title: 'Info',
					text: "Please Input Your Password Again!",
					addclass: "stack-bar-top",
					stack: stack_bar_top,
					remove: true,
					hide: true,
					delay: 2000,
					nonblock: {
						nonblock: true,
						nonblock_opacity: .2
					}
				});
				return;
			}
			if(sUserInputpwd_ != sUserInputpwd)
			{
				new PNotify({
					title: 'Info',
					text: "Your Password Is Not Equal!",
					addclass: "stack-bar-top",
					stack: stack_bar_top,
					remove: true,
					hide: true,
					delay: 2000,
					nonblock: {
						nonblock: true,
						nonblock_opacity: .2
					}
				});
				return;
			}
			
			var sInvalidText = myfun_CheckUserNameHasInvalidText(sUserInputAccount);
			if(sInvalidText.length > 0)
			{
				new PNotify({
					title: 'Info',
					text: "Account Can't Contain Invalid String: \""+sInvalidText+"\"",
					addclass: "stack-bar-top",
					stack: stack_bar_top,
					remove: true,
					hide: true,
					delay: 2000,
					nonblock: {
						nonblock: true,
						nonblock_opacity: .2
					}
				});
				return;
			}
			
			
			  
			
			$jq('body').block({ 
                message: '<h1>Wait Register...</h1>', 
                css: { border: '3px solid #a00' } 
            });
			
			var mypomelo = window.pomelo;
			var host = "54.148.7.1";
			var port = "3010";
			
			mypomelo.init({host: host,port: port,log: true}, function() {
				var pMsg = {};
				pMsg.username = sUserInputAccount;
				pMsg.password = CryptoJS.MD5(sUserInputAccount+sUserInputpwd).toString();
				pMsg.deviceid = "html";
				
				mypomelo.request("connector.entryHandler.check_Register", pMsg, function(data) {
					
					mypomelo.disconnect();
					$jq('body').unblock();
					
					onRegisterResult(data);
					
				});
			});
			$jq( this ).dialog( "close" );
			
		  }
		},
		{
		  text: "SignIn",
		  title: "Has A Account? Immediately Sign In!",
		  icons: {
			primary: "ui-icon-heart"
		  },
		  click: function() {
			$jq( this ).dialog( "close" );
			
			$jq( "#dialog-SignIn" ).dialog( "option", "position", { my: "center", at: "center", of: window } );
			$jq( "#dialog-SignIn" ).dialog( "open" );
		  }
		}
	  ]
    });
	// $jq("#btn-Register").on("click",onClickBtnFun_Register);
	
	
	$jq( "#dialog-AccountInfo" ).dialog({
      autoOpen: false,
      modal: true,
	  resizable: false,
      show: { effect: "blind", duration: 800 },
	  buttons: [
		{
		  text: "Sign Out",
		  icons: {
			primary: "ui-icon-heart"
		  },
		  click: function() {
			
			
			$jq('body').block({ 
                message: '<h1>Wait Sign Out...</h1>', 
                css: { border: '3px solid #a00' } 
            });
			
			var mypomelo = window.pomelo;
			var host = "54.148.7.1";
			var port = "3010";
			
			mypomelo.init({host: host,port: port,log: true}, function() {
				var pMsg = {};
				pMsg.username = localStorage.getItem("SignInAccount");
				pMsg.acckey = localStorage.getItem("SignInKey");
				
				mypomelo.request("connector.entryHandler.check_SignOut", pMsg, function(data) {
					
					mypomelo.disconnect();
					$jq('body').unblock();
					
					onSignOutResult(data);
					
				});
			});
			$jq( this ).dialog( "close" );
			
		  }
		}
	  ]
    });
	
	$jq("#btn-Account").on("click",onClickBtnFun_Account);
	
	
	var nlast_lat = localStorage.getItem("last_lat");//$jq("body").data("last_lat");
	var nlast_lng = localStorage.getItem("last_lng");//$jq("body").data("last_lng");
	if(nlast_lat == undefined)
	{
		nlast_lat = 41.850033;
		localStorage.setItem("last_lat",nlast_lat)
	}
	if(nlast_lng == undefined)
	{
		nlast_lng = -87.6500523;
		localStorage.setItem("last_lng",nlast_lng)
	}
	
	// setup maps
	var mapOptions = {
		center: new google.maps.LatLng(Number(nlast_lat), Number(nlast_lng)),
		// center: new google.maps.LatLng(41.850033,-87.6500523),
		zoom: 18,
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		// draggable: false,
	};

	ggmap = new google.maps.Map($jq("#map-canvas")[0],mapOptions);
	$jq("#text_zoomlevel").text('zoom:'+mapOptions.zoom);
	$jq("#text_center").text('pos:'+mapOptions.center.toString());

	ggmap.controls[google.maps.ControlPosition.TOP_LEFT].push($jq("#btn-Menu")[0]);
	ggmap.controls[google.maps.ControlPosition.TOP_LEFT].push($jq("#btn-Account")[0]);
	ggmap.controls[google.maps.ControlPosition.BOTTOM_RIGHT].push($jq("#text_zoomlevel")[0]);
	ggmap.controls[google.maps.ControlPosition.BOTTOM_RIGHT].push($jq("#text_center")[0]);
	ggmap.controls[google.maps.ControlPosition.BOTTOM_RIGHT].push($jq("#img_my")[0]);
	
	google.maps.event.addListener(ggmap, 'zoom_changed', function() {
		var zoomLevel = ggmap.getZoom();
		$jq("#text_zoomlevel").text('zoom:'+zoomLevel);
	});
	google.maps.event.addListener(ggmap, 'center_changed', function() {
		var curCenter = ggmap.getCenter();
		$jq("#text_center").text('pos:'+curCenter.toString());
	});
	
	var nOneStep = 0.0005;
	var dirlat = 0.0;
	var dirlng = 0.0;
	var repTime = 0;
	var nCurRepTime = 0;
	var pMarker = null;
	var pClickLatlng = null;
	function fun_OnMoveStepByStep()
	{
		var curCenter = ggmap.getCenter();
		
		// ggmap.setCenter({lat: curCenter.lat()+dirlat, lng: curCenter.lng()+dirlng});
		ggmap.panTo({lat: curCenter.lat()+dirlat, lng: curCenter.lng()+dirlng});
		
		localStorage.setItem("last_lat",curCenter.lat()+dirlat);
		localStorage.setItem("last_lng",curCenter.lng()+dirlng);
		
		if(pMarker)
		{
			pMarker.setPosition(ggmap.getCenter());
		}
		
		
		nCurRepTime = nCurRepTime + 1;
		if(nCurRepTime >= repTime)
		{
			mytimermove.stop();
		}
	};
	
	var mytimermove = $jq.timer(fun_OnMoveStepByStep,1000,false);
	
	function fun_CenterMoveToTarget(targetLatlng,ggmap)
	{
		var curlat = Number(localStorage.getItem("last_lat"))
		var curlng = Number(localStorage.getItem("last_lng"))
		ggmap.panTo({lat:curlat,lng:curlng});
	
		var curCenter = ggmap.getCenter();
		dirlat = targetLatlng.lat()-curCenter.lat();
		dirlng = targetLatlng.lng()-curCenter.lng();
		
		var alllen = Math.sqrt(Math.pow(dirlat,2)+Math.pow(dirlng,2));
		repTime = Math.ceil(alllen / nOneStep);
		nCurRepTime = 0;
		
		dirlat = dirlat / repTime;
		dirlng = dirlng / repTime;
		
		if(pMarker == null)
		{
			var image = {
				url: 'images/icon1.png',
				size: new google.maps.Size(64, 64),
				origin: new google.maps.Point(0,0),
				anchor: new google.maps.Point(32, 32)
			  };
			  var shape = {
				  coords: [0, 0, 64, 64],
				  type: 'rect'
			  };
			
			pMarker = new google.maps.Marker({
				position: curCenter,
				map: ggmap,
				icon: image,
				shape: shape,
			})
		}
		
		
		mytimermove.stop();
		mytimermove.play(true)
		var lineCoordinates = [curCenter,targetLatlng];
		var line = new google.maps.Polyline({
			path: lineCoordinates,
			map: ggmap,
			
		  });
	}
	
	
	google.maps.event.addListener(ggmap, 'click', function(inMouseEvent) {
		// console.log(inMouseEvent);
		pClickLatlng = inMouseEvent.latLng;
		
		$jq("#menu2").circleMenu('close');
		$jq("#menu2").offset({ top: inMouseEvent.pixel.y-16, left: inMouseEvent.pixel.x-16})
		
		// var curCenter = ggmap.getCenter();
		// var targetPos = inMouseEvent.latLng;
		// dirlat = targetPos.lat()-curCenter.lat();
		// dirlng = targetPos.lng()-curCenter.lng();
		
		// var alllen = Math.sqrt(Math.pow(dirlat,2)+Math.pow(dirlng,2));
		// repTime = Math.ceil(alllen / nOneStep);
		// nCurRepTime = 0;
		
		// dirlat = dirlat / repTime;
		// dirlng = dirlng / repTime;
		
		// if(pMarker == null)
		// {
			// var image = {
				// url: 'images/icon1.png',
				// size: new google.maps.Size(64, 64),
				// origin: new google.maps.Point(0,0),
				// anchor: new google.maps.Point(32, 32)
			  // };
			  // var shape = {
				  // coords: [0, 0, 64, 64],
				  // type: 'rect'
			  // };
			
			// pMarker = new google.maps.Marker({
				// position: curCenter,
				// map: ggmap,
				// icon: image,
				// shape: shape,
			// })
		// }
		
		
		// mytimermove.stop();
		// mytimermove.play(true)
		// var lineCoordinates = [curCenter,targetPos];
		// var line = new google.maps.Polyline({
			// path: lineCoordinates,
			// map: ggmap,
			
		  // });
		
	});
	google.maps.event.addListener(ggmap, 'center_changed', function(inMouseEvent) {
		$jq("#menu2").circleMenu('close');
		$jq("#menu2").offset({ top: -100, left: -100})
		
		
		
	});
	google.maps.event.addListener(ggmap, 'zoom_changed', function(inMouseEvent) {
		$jq("#menu2").circleMenu('close');
		$jq("#menu2").offset({ top: -100, left: -100})
	});
	
	
	// var remove_poi = [
		// {
			// "featureType": "poi.park",
			// "elementType": "all",
			// "stylers": [
				// { "visibility": "off" }
			// ]
		// }
	// ];
	// ggmap.setOptions({styles: remove_poi})

	
	// google.maps.event.addListener(ggmap, 'dragstart', function(MouseEvent) {	
		// console.log('dragstart1');
	// });
	
	// google.maps.event.addListener(ggmap, 'drag', function(MouseEvent) {	
		// console.log('drag');
	// });
	// google.maps.event.addListener(ggmap, 'dragend', function(MouseEvent) {	
		// console.log('dragend');
	// });
	
	
	var sSignInAccount = localStorage.getItem("SignInAccount");
	if(sSignInAccount == undefined)
	{
		$jq("#btn-Account").text("Not SignIn");
		$jq( "#dialog-SignIn" ).dialog( "option", "position", { my: "center", at: "center", of: window } );
		$jq( "#dialog-SignIn" ).dialog( "open" );
	}
	else
	{
		$jq("#btn-Account").text(sSignInAccount);
	}
	
	
	PNotify.prototype.options.styling = "jqueryui";
	
	
	$jq(function() {
		$jq('#btn-Menu').dropmenu({
			items:[
					{	name: 'Newest10'	},
					{	name: 'My Post'	}
				],
				showAnim: 'fadeIn',
				duration: 'normal',
				select:		function(item) 
				{ 
					console.info(item); 
					if(item.name == 'Newest10')
					{
						
					}
				}
			});
			
		$jq('#menu2').circleMenu({
                    direction:'full', 
                    trigger:'click',
                    open: function()
					{
						// console.log('menu opened');
					},
                    close: function()
					{
						// console.log('menu closed');
					},
                    init: function()
					{
						// console.log('menu initialized');
					},
                    select: function(evt,index)
					{
						$jq("#menu2").offset({ top: -100, left: -100})
						if(index[0]["innerText"] == "p")
						{
							html2canvas($jq("#map-canvas")[0], {
								onrendered: function(canvas){
									var data = canvas.toDataURL();
									$jq("#img_my")[0].src = data;
								},
								width: 300,
								height: 300
							});
						}
						else if(index[0]["innerText"] == "m")
						{
							fun_CenterMoveToTarget(pClickLatlng,ggmap);
						}
						else if(index[0]["innerText"] == "q")
						{
						}
						else if(index[0]["innerText"] == "l")
						{
						}
					}
                })
		$jq("#menu2").offset({ top: -100, left: -100})		
	});
}

$jq( document ).ready( entryFun );