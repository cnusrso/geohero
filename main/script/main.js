var $jq = jQuery.noConflict();

var stack_bar_top = {"dir1": "down", "dir2": "right", "push": "top", "spacing1": 0, "spacing2": 0};

var ggmap;

var gdirectionsDisplay = new google.maps.DirectionsRenderer();
var gdirectionsService = new google.maps.DirectionsService();

var gSelectRect = new google.maps.Rectangle();

var UserData = {};
// https://maps.googleapis.com/maps/api/staticmap?center=39.907754,116.397675&zoom=17&size=320x320&scale=2&maptype=satellite&key=AIzaSyAZpUCjk-shqijXiYtbtItICYF7nMVPLZo





// click account btn
function onClickBtnFun_Account(eventObject)
{
	eventObject.stopPropagation(); 
	eventObject.preventDefault();
	
	var sSignInAccount = UserData.username;
	$jq( "#dialog-AccountInfo" ).dialog( "option", "position", { my: "center", at: "center", of: window } );
	$jq( "#dialog-AccountInfo" ).dialog( "open" );
	
	$jq("#accountinfo_account").val(sSignInAccount);
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
	
	window.open("signinup.html","_self");
	
}


var nOneStep = 0.0005;
var dirlat = 0.0;
var dirlng = 0.0;
var repTime = 0;
var nCurRepTime = 0;
var pMarker = null;
var pClickLatlng = null;
var pClickMarker = null;
var bCircleMenuIsOpen = false;

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
};


function fun_fromLatLngToPoint(latLng, map) {
	var topRight = map.getProjection().fromLatLngToPoint(map.getBounds().getNorthEast());
	var bottomLeft = map.getProjection().fromLatLngToPoint(map.getBounds().getSouthWest());
	var scale = Math.pow(2, map.getZoom());
	var worldPoint = map.getProjection().fromLatLngToPoint(latLng);
	return new google.maps.Point((worldPoint.x - bottomLeft.x) * scale, (worldPoint.y - topRight.y) * scale);
};

function fun_fromPointToLatLng(inPoint, map) {
	var scale = Math.pow(2, map.getZoom());
	var topRight = map.getProjection().fromLatLngToPoint(map.getBounds().getNorthEast());
	var bottomLeft = map.getProjection().fromLatLngToPoint(map.getBounds().getSouthWest());
	
	var outP = new google.maps.Point(inPoint.x / scale + bottomLeft.x,inPoint.y / scale + topRight.y);

	
	return map.getProjection().fromPointToLatLng(outP);
};

function calcRoute(targetLatLng) {
	
	var curlat = Number(localStorage.getItem("last_lat"))
	var curlng = Number(localStorage.getItem("last_lng"))
	
	var pStart = new google.maps.LatLng(curlat, curlng);
	
	var request = {
		origin: pStart,
		destination: targetLatLng,
		travelMode: google.maps.TravelMode.DRIVING,
		unitSystem: google.maps.UnitSystem.METRIC
	};
	gdirectionsService.route(request, 
		function(response, status) 
		{
			if (status == google.maps.DirectionsStatus.OK) 
			{
				console.log(response);
				gdirectionsDisplay.setDirections(response);
			}
		}
	);
};

function funcSetupMaps()
{
	ggmap.controls[google.maps.ControlPosition.TOP_LEFT].push($jq("#btn-Menu")[0]);
	ggmap.controls[google.maps.ControlPosition.TOP_LEFT].push($jq("#btn-Account")[0]);
	ggmap.controls[google.maps.ControlPosition.BOTTOM_RIGHT].push($jq("#text_zoomlevel")[0]);
	ggmap.controls[google.maps.ControlPosition.BOTTOM_RIGHT].push($jq("#text_center")[0]);
	ggmap.controls[google.maps.ControlPosition.BOTTOM_RIGHT].push($jq("#img_my")[0]);
	
	
	google.maps.event.addListener(ggmap, 'click', function(inMouseEvent) {
		// console.log(inMouseEvent);
		pClickLatlng = inMouseEvent.latLng;
		
		$jq("#menu2").circleMenu('close');
		$jq("#menu2").offset({ top: -100, left: -100})
		
		// $jq('#menu_icon').WCircleMenu('close');
		// $jq("#menu_icon").offset({ top: -200, left: -200})
		
		
		bCircleMenuIsOpen = false;
		
		if(pClickMarker != null)
		{
			pClickMarker.setMap(null);
			pClickMarker = null;
		}			
		

		var image = {
			url: 'images/menucenter.png',
			size: new google.maps.Size(33, 33),
			origin: new google.maps.Point(0,0),
			anchor: new google.maps.Point(16, 16)
		};
		var shape = {
			coords: [16, 16, 16],
			type: 'circle'
		};
		pClickMarker = new google.maps.Marker({
			position: pClickLatlng,
			map: ggmap,
			icon: image,
			shape: shape,
		});
		pClickMarker.setAnimation(google.maps.Animation.DROP);
		google.maps.event.addListener(pClickMarker, 'click', 
			function()
			{
				ggmap.panTo(pClickMarker.getPosition());
				
				window.setTimeout(
					function() {
						// var pMapCanvas = $jq("#map-canvas");
						// var offset = pMapCanvas.offset();
						// var width = pMapCanvas.width();
						// var height = pMapCanvas.height();
						// var centerX = offset.left + width / 2;
						// var centerY = offset.top + height / 2;
						
						var pcenter = fun_fromLatLngToPoint(pClickLatlng,ggmap);
						
						$jq("#menu2").offset({ top: pcenter.y-16, left: pcenter.x-16})
						$jq("#menu2").circleMenu('open');
						
						// $jq("#menu_icon").offset({ top: pcenter.y-16, left: pcenter.x-16})
						// $jq("#menu_icon").WCircleMenu('open');
						
						bCircleMenuIsOpen = true;
					}, 
					1.0
				);
				
			}
		);
		
		
		
	});
	google.maps.event.addListener(ggmap, 'center_changed', function(inMouseEvent) {
		if(bCircleMenuIsOpen)
		{
			$jq("#menu2").circleMenu('close');
			$jq("#menu2").offset({ top: -100, left: -100});
			// $jq('#menu_icon').WCircleMenu('close');
			// $jq("#menu_icon").offset({ top: -200, left: -200})
			bCircleMenuIsOpen = false;
		}
		
		if(pClickMarker != null)
		{
			pClickMarker.setMap(null);
			pClickMarker = null;
		}
		
		var curCenter = ggmap.getCenter();
		$jq("#text_center").text('pos:'+curCenter.toString());
	});
	google.maps.event.addListener(ggmap, 'zoom_changed', function(inMouseEvent) {
		if(bCircleMenuIsOpen)
		{
			$jq("#menu2").circleMenu('close');
			$jq("#menu2").offset({ top: -100, left: -100});
			// $jq('#menu_icon').WCircleMenu('close');
			// $jq("#menu_icon").offset({ top: -200, left: -200})
			bCircleMenuIsOpen = false;
		}
		
		if(pClickMarker != null)
		{
			pClickMarker.setMap(null);
			pClickMarker = null;
		}
		
		var zoomLevel = ggmap.getZoom();
		$jq("#text_zoomlevel").text('zoom:'+zoomLevel);
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
	
	
	// var nStartZoom = 0;
	// var nStepZoom = 1;
	// var nEndZoom = 18;
	// var pZoomToTarget = $jq.timer(
	// function()
	// {
		// if(nStartZoom >= nEndZoom)
		// {
			// pZoomToTarget.stop();
		// }
		
		// ggmap.setZoom(nStartZoom),
		// nStartZoom += nStepZoom;
		
		
	// },
	// 3000,
	// false);
	// pZoomToTarget.play(true);
	
	
	gdirectionsDisplay.setMap(ggmap);
	
};

function funcOnLoadMapsOk() {
	
	// first get last position by account
	var mypomelo = window.pomelo;
	var host = "54.148.7.1";
	var port = "3010";
	mypomelo.init({host: host,port: port,log: true}, function() {
		var pMsg = {};
		pMsg.username = UserData.username;
		
		mypomelo.request("connector.entryHandler.getLastLatLngByAccount", pMsg, function(data) {
			
			mypomelo.disconnect();
			
			console.log(data);
			ggmap.panTo({lat: Number(data.lat), lng: Number(data.lng)});
			ggmap.setZoom(18),
			localStorage.setItem("last_lat",data.lat);
			localStorage.setItem("last_lng",data.lng);
			
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
					position: new google.maps.LatLng(Number(data.lat), Number(data.lng)),
					map: ggmap,
					icon: image,
					shape: shape,
				})
			}
					
			$jq('body').unblock();
			funcSetupMaps();
		});
		
	});

};
	

function entryFun( ) {
	console.log( "document ready" );
	
	UserData.username = localStorage.getItem("SignInAccount");
	UserData.acckey = localStorage.getItem("SignInKey");
	if(UserData.username == undefined)
	{
		window.open("signinup.html","_self");
		return;
	}
	
	$jq("#btn-Account").text(UserData.username);
	$jq("#btn-Account").on("click",onClickBtnFun_Account);
	
	PNotify.prototype.options.styling = "jqueryui";
	
	
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
				var pMsgSetLatLng = {};
				pMsgSetLatLng.username = UserData.username;
				pMsgSetLatLng.lat = localStorage.getItem("last_lat")
				pMsgSetLatLng.lng = localStorage.getItem("last_lng")
				
				
				mypomelo.request("connector.entryHandler.setLastLatLngByAccount", pMsgSetLatLng, function(data) {
					
					if(data.code == 200)
					{
						var pMsg = {};
						pMsg.username = UserData.username;
						pMsg.acckey = UserData.acckey;
						
						mypomelo.request("connector.entryHandler.check_SignOut", pMsg, function(data) {
					
							mypomelo.disconnect();
							$jq('body').unblock();
							
							onSignOutResult(data);
						});
					}
					else
					{
						$jq('body').unblock();
						console.log(data);
					}
					
				});
			});
			
			
			$jq( this ).dialog( "close" );			
		  }
		}
	  ]
    });
	
	// menu op
	$jq('#btn-Menu').dropmenu({
		items:[
				{	name: 'Newest10'	},
				{	name: 'My Post'	},
				{ 	name: 'Go to My Location' },
					{	name: 'Modify Map Type' },
			],
			showAnim: 'fadeIn',
			duration: 'normal',
			select:		function(item) 
			{ 
				console.info(item); 
				if(item.name == 'Newest10')
				{
					
				}
				else if(item.name == 'Go to My Location')
				{
					var curlat = Number(localStorage.getItem("last_lat"))
					var curlng = Number(localStorage.getItem("last_lng"))
					ggmap.panTo({lat:curlat,lng:curlng});
				}
				else if(item.name == 'Modify Map Type')
				{
					if(ggmap.getMapTypeId() == google.maps.MapTypeId.SATELLITE)
					{
						ggmap.setMapTypeId(google.maps.MapTypeId.ROADMAP);
					}
					else
					{
						ggmap.setMapTypeId(google.maps.MapTypeId.SATELLITE);
					}
				}
			}
		});
		
		
		
	$jq('#menu2').circleMenu({
				direction:'full', 
				trigger:'click',
				open: function()
				{
					// console.log('menu opened');
					// ggmap.panTo({lat: pClickLatlng.lat(), lng: pClickLatlng.lng()});
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
					// var sInnerText = index[0]["innerText"];
					var nBtnId = Number(index[0]["id"]);
					
					
					switch(nBtnId)
					{
						case 1:
						{
							var pCenter = ggmap.getCenter();
							var pCenterInView = fun_fromLatLngToPoint(pCenter,ggmap);
							var pRTInView = new google.maps.Point(pCenterInView.x+200,pCenterInView.y-200);
							var pLBInView = new google.maps.Point(pCenterInView.x-200,pCenterInView.y+200);
							var pRT = fun_fromPointToLatLng(pRTInView,ggmap);
							var pLB = fun_fromPointToLatLng(pLBInView,ggmap);
							var rectOptions = {
							  strokeColor: "#FF0000",
							  strokeOpacity: 0.8,
							  strokeWeight: 2,
							  fillColor: "#FF0000",
							  fillOpacity: 0.35,
							  map: ggmap,
							  bounds: new google.maps.LatLngBounds(pLB,pRT),
							  editable: false,
							  draggable:true
							};
							gSelectRect.setOptions(rectOptions);
							google.maps.event.addDomListener(gSelectRect, 'click', 
								function funcOnLoadMapsOk() {
									gSelectRect.setMap(null);
								}
							);
						}break;
						
						case 2:
						{
							fun_CenterMoveToTarget(pClickLatlng,ggmap);
						}break;
						
						case 3:
						{
							calcRoute(pClickLatlng);
						}break;
						
						case 4:
						{
						}break;
						
						case 5:
						{
							if(ggmap.getMapTypeId() == google.maps.MapTypeId.SATELLITE)
							{
								ggmap.setMapTypeId(google.maps.MapTypeId.ROADMAP);
							}
							else
							{
								ggmap.setMapTypeId(google.maps.MapTypeId.SATELLITE);
							}
							
							ggmap.setTilt(0);
						}break;
						
						default:
						{
							
						}
					}
					
				}
			});
	$jq("#menu2").offset({ top: -1000, left: -1000});
	bCircleMenuIsOpen = false;
	
	// $jq('#menu_icon').WCircleMenu({
		// width: '50px',
		// height: '50px',
		// angle_start : 0,
		// delay: 50,
		// distance: 100,
		// angle_interval: Math.PI*2/9,
		// easingFuncShow:"easeOutBack",
		// easingFuncHide:"easeInBack",
		// step:35,
		// itemRotation:360,
	// });

	// $jq('.wcircle-menu-item').off('click').on('click',function(){
		// console.log($jq(this).attr("id"));
		// var nBtnId = Number($jq(this).attr("id"));

		// switch(nBtnId)
		// {
			// case 1:
			// {
				// var pCenter = ggmap.getCenter();
				// var pCenterInView = fun_fromLatLngToPoint(pCenter,ggmap);
				// var pRTInView = new google.maps.Point(pCenterInView.x+200,pCenterInView.y-200);
				// var pLBInView = new google.maps.Point(pCenterInView.x-200,pCenterInView.y+200);
				// var pRT = fun_fromPointToLatLng(pRTInView,ggmap);
				// var pLB = fun_fromPointToLatLng(pLBInView,ggmap);
				// var rectOptions = {
				  // strokeColor: "#FF0000",
				  // strokeOpacity: 0.8,
				  // strokeWeight: 2,
				  // fillColor: "#FF0000",
				  // fillOpacity: 0.35,
				  // map: ggmap,
				  // bounds: new google.maps.LatLngBounds(pLB,pRT),
				  // editable: false,
				  // draggable:true
				// };
				// gSelectRect.setOptions(rectOptions);
				// google.maps.event.addDomListener(gSelectRect, 'click', 
					// function funcOnLoadMapsOk() {
						// gSelectRect.setMap(null);
					// }
				// );
			// }break;
			
			// case 2:
			// {
				// fun_CenterMoveToTarget(pClickLatlng,ggmap);
			// }break;
			
			// case 3:
			// {
				// calcRoute(pClickLatlng);
			// }break;
			
			// case 4:
			// {
			// }break;
			
			// case 5:
			// {
				// if(ggmap.getMapTypeId() == google.maps.MapTypeId.SATELLITE)
				// {
					// ggmap.setMapTypeId(google.maps.MapTypeId.ROADMAP);
				// }
				// else
				// {
					// ggmap.setMapTypeId(google.maps.MapTypeId.SATELLITE);
				// }
				
				// ggmap.setTilt(0);
			// }break;
			
			// default:
			// {
				
			// }
		// }
		
	// });
	
	
	
	// setup maps
	var mapOptions = {
		// center: new google.maps.LatLng(Number(nlast_lat), Number(nlast_lng)),
		zoom: 0,
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		// draggable: false,
		scaleControl: true,
	};
	ggmap = new google.maps.Map($jq("#map-canvas")[0],mapOptions);
	google.maps.event.addDomListener(window, 'load', funcOnLoadMapsOk);
	
	$jq('body').block({ 
                message: '<h1>Wait Go To My Position...</h1>', 
                css: { border: '3px solid #a00' } 
            });
			
};





$jq( document ).ready( entryFun );