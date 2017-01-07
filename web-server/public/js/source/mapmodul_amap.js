// wrap amap...
define(["amap"], {
	maper: null,
	zoom: 11,
	center: {
		lng: 116.397428,
		lat: 39.90923
	},

	placeSearch: null,
	pGeolocation: null,
	pGeoCoder:null,
	bOnGeoLocation: false,
	pCitySearch: null,
	
	pWalkingService: null,
	pDrivingService: null,
	
	
	pFuncEventCallback: null,
	pFuncEventCallbackOwner:null,

	pMarker:null,

	init: function(sContainerName) {


		this.maper = new AMap.Map(sContainerName, {
			resizeEnable: true,
			isHotspot: true 
		});

		var singleton = this;

		//构造地点查询类
		AMap.service(["AMap.PlaceSearch"], function() {
			singleton.placeSearch = new AMap.PlaceSearch({ 
				pageSize: 5,
				pageIndex: 1,
				map: singleton.maper
			});
		});
		// 坐标转详细地址类
		AMap.service(["AMap.Geocoder"], function() {
			singleton.pGeoCoder = new AMap.Geocoder({
						city: "全国",
            radius: 500,
            extensions: "base"
        });
		});
		
		
		//构造步行导航服务类
		AMap.service(["AMap.Walking"], function() {
			singleton.pWalkingService = new AMap.Walking({ 
// 				map: singleton.maper,
				hideMarkers: false
			});
		});
		//构造路线导航类
		AMap.service(["AMap.Driving"], function() {
			singleton.pDrivingService = new AMap.Driving({ 
// 				map: singleton.maper,
				hideMarkers: false
			});
		});
		
		

		this.maper.on('click', function(e) {
			// console.log(e);
			if(singleton.pFuncEventCallback != null)
				{
					if(singleton.pFuncEventCallbackOwner != null)
						singleton.pFuncEventCallback.call(singleton.pFuncEventCallbackOwner,"click",e);
					else
						singleton.pFuncEventCallback.call("click",e);	
				}
    	});
		this.maper.on('hotspotclick', function(result) {
// 			console.log("hotspotclick:", result);
			if(singleton.pFuncEventCallback != null)
				{
					if(singleton.pFuncEventCallbackOwner != null)
						singleton.pFuncEventCallback.call(singleton.pFuncEventCallbackOwner,"hotspotclick",result);
					else
						singleton.pFuncEventCallback.call("hotspotclick",result);	
				}
			

		});
		this.maper.on('movestart', function(e) {
			// console.log(e);
			if(singleton.pFuncEventCallback != null)
				{
					if(singleton.pFuncEventCallbackOwner != null)
						singleton.pFuncEventCallback.call(singleton.pFuncEventCallbackOwner,"movestart",e);
					else
						singleton.pFuncEventCallback.call("movestart",e);	
				}
    });
		this.maper.on('zoomstart', function(e) {
			// console.log(e);
			if(singleton.pFuncEventCallback != null)
				{
					if(singleton.pFuncEventCallbackOwner != null)
						singleton.pFuncEventCallback.call(singleton.pFuncEventCallbackOwner,"zoomstart",e);
					else
						singleton.pFuncEventCallback.call("zoomstart",e);	
				}
    });
		


		this.maper.plugin('AMap.Geolocation', function() {
			singleton.pGeolocation = new AMap.Geolocation({
				enableHighAccuracy: true, //是否使用高精度定位，默认:true
				timeout: 10000, //超过10秒后停止定位，默认：无穷大
				buttonOffset: new AMap.Pixel(10, 20), //定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
				zoomToAccuracy: true, //定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
				buttonPosition: 'RB'
			});
			
		});
		
		// 城市查找类
		this.maper.plugin('AMap.CitySearch',function(){
			singleton.pCitySearch = new AMap.CitySearch();
		});


	},

	setEventCallbackData:function(pCallback,pCallbackOwner) {
		this.pFuncEventCallback = pCallback;
		this.pFuncEventCallbackOwner = pCallbackOwner;
		
	},
	
	getPoiDetails: function(poiid, pCallback, pCallbackOwner) {
		this.placeSearch.getDetails(poiid, function(status, result) {
			
// 			console.log("getPoiDetails:", status, result);
			
			
			if(pCallbackOwner != null){
				pCallback.call(pCallbackOwner,status,result);
			} else {
				pCallback.call(status,result);	
			}
		});
	},
	
	startGetWalkingData: function(from,to,pCallback,pCallbackOwner){
		var singleton = this;
		this.pWalkingService.search(from,to,function(status,result){
			
			if(pCallback != null)
				{
					if(pCallbackOwner != null)
						pCallback.call(pCallbackOwner,status,result);
					else
						pCallback.call(status,result);	
				}
			
		})
	},
	
	startGetDrivingData: function(from,to,pCallback,pCallbackOwner){
		var singleton = this;
		this.pDrivingService.search(from,to,function(status,result){
			
			if(pCallback != null)
				{
					if(pCallbackOwner != null)
						pCallback.call(pCallbackOwner,status,result);
					else
						pCallback.call(status,result);	
				}
			
		})
	},
	
	// 得到当前所处的城市信息。
	getCurrentCity: function(pCallback,pCallbackOwner){
		this.pCitySearch.getLocalCity(function(status, result) {
				if (status === 'complete' && result.info === 'OK') {
						if (result && result.city && result.bounds) {
							if(pCallbackOwner != null)
								pCallback.call(pCallbackOwner,0,result);
							else
								pCallback.call(0,result);
							
// 								var cityinfo = result.city;
// 								var citybounds = result.bounds;
// 								document.getElementById('tip').innerHTML = '您当前所在城市：'+cityinfo;
// 								//地图显示当前城市
// 								map.setBounds(citybounds);
						}
				} else {
					if(pCallbackOwner != null)
						pCallback.call(pCallbackOwner,1,result);
					else
						pCallback.call(1,result);
				}
		});
	},
	
	startGetCurrentPosition: function(pCallback, CallbackOwner) {
		var singleton = this;
		AMap.event.addListenerOnce(this.pGeolocation, 'complete', function(data) {
// 			var str = ['定位成功'];
// 			str.push('经度：' + data.position.getLng());
// 			str.push('纬度：' + data.position.getLat());
// 			str.push('精度：' + data.accuracy + ' 米');
// 			str.push('是否经过偏移：' + (data.isConverted ? '是' : '否'));
// 			console.log("geolocation:" + str);
			singleton.bOnGeoLocation = false;
			singleton.maper.removeControl(singleton.pGeolocation);
			
			if(CallbackOwner != null)
				pCallback.call(CallbackOwner,0,data);
			else
				pCallback.call(0,data);
			

// 			// 由位置得到详细信息
// 			singleton.pGeoCoder.getAddress(data.position, function(status, result) {
// 				if (status === 'complete' && result.info === 'OK') {
// 					singleton.bOnGeoLocation = false;
// 					if (pCallback != null && CallbackOwner != null) {
// 						pCallback.call(CallbackOwner, 0, data,result);
// 					}
// 				}
// 			});
			
		}); //返回定位信息
		
		AMap.event.addListenerOnce(this.pGeolocation, 'error', function(data) {
			singleton.bOnGeoLocation = false;
			singleton.maper.removeControl(singleton.pGeolocation);
			if(CallbackOwner != null)
				pCallback.call(CallbackOwner,1,data);
			else
				pCallback.call(1,data);
		}); //返回定位出错信息
		
		// 为了可以自动定位到当前位置临时显示地图的定位按钮
		singleton.maper.addControl(singleton.pGeolocation);
		this.pGeolocation.getCurrentPosition();
		this.bOnGeoLocation = true;
	},
	
	StepMove:function(lngstep,latstep)
	{
		this.maper.panTo(this.maper.getCenter().offset(lngstep,latstep));
	},
	
	zoomTo:function(nZoom)
	{
		this.maper.setZoom(nZoom);
	},
	
	setBounds:function(pBounds)
	{
		this.maper.setBounds(pBounds);
	},
	panTo:function(pos)
	{
		this.maper.panTo(pos);
		// this.maper.setZoom(15);
		
// 		var singleton = this;
// 		var timercount = 5;
// 		var timernum = 0;
// 		var mytimermove = _gdata.model_jq.timer(
// 			function(){
// 				timernum++;
// 				if(timernum >= timercount)
// 					{
// 						mytimermove.stop();
// 						mytimermove = null;
// 					}
				
// 				singleton.maper.zoomIn();
// 			},
// 			200,
// 			true
// 		);
		
	},
	
	showPolyline:function(pathArray){
		
		//定义折线对象
		var polyline=new AMap.Polyline({
				path:pathArray,     //设置折线的节点数组
				strokeColor:"#111111",
				strokeOpacity:0.9,
				strokeWeight:9,
				strokeStyle:"dashed",
				strokeDasharray:[10,5]
		});
		polyline.setMap(this.maper);//地图上添加折线
		return polyline;
	},
	
	hidePolyline:function(pPolyObj){
		pPolyObj.setMap(null);
	},
	
	

	readyMarker:function(pos){
		var singleton = this;

		if(singleton.pMarker != null)
		{
			if(singleton.pMarker.visible)
				singleton.pMarker.hide();
		}

		if(singleton.pMarker == null)
		{
			singleton.pMarker = new AMap.Marker({
					map: this.maper,
					position: pos,
					icon: "http://webapi.amap.com/theme/v1.3/markers/n/mark_b.png",
					draggable: false,
					cursor: 'move',
					raiseOnDrag: false,
					clickable: true
			});
		}
		else
		{
			singleton.pMarker.setPosition(pos);
			singleton.pMarker.show();
		}
	},
	
	addClickOneMarker:function(pos,szLabel){
		this.readyMarker(pos);
		
		var singleton = this;
		singleton.pMarker.setLabel({
				offset: new AMap.Pixel(20, 20),//修改label相对于maker的位置
				content: szLabel
		});
		
		// 处理点击事件
		AMap.event.addListenerOnce(singleton.pMarker, 'click', function(data) {
			singleton.pMarker.hide();
		});
		AMap.event.addListenerOnce(singleton.pMarker, 'touchend', function(data) {
			singleton.pMarker.hide();
		});
		return singleton.pMarker;		
	},
	
	addMarker:function(pos,szLabel,pExtData)
	{
		this.readyMarker(pos);
		
		var singleton = this;
		//singleton.pMarker.setTitle(szLabel);
		singleton.pMarker.setLabel({
				offset: new AMap.Pixel(20, 20),//修改label相对于maker的位置
				content: szLabel
		});
		singleton.pMarker.setExtData(pExtData);
		
		// 处理点击事件
		AMap.event.addListenerOnce(singleton.pMarker, 'click', function(data) {
			
			var extdata = singleton.pMarker.getExtData();
			extdata.pixel = data.pixel;
			singleton.pMarker.hide();
			if(singleton.pFuncEventCallback != null)
			{
				if(singleton.pFuncEventCallbackOwner != null)
					singleton.pFuncEventCallback.call(singleton.pFuncEventCallbackOwner,"clickmarker",extdata);
				else
					singleton.pFuncEventCallback.call("clickmarker",extdata);	
			}
		});
		AMap.event.addListenerOnce(singleton.pMarker, 'touchend', function(data) {
			var extdata = singleton.pMarker.getExtData();
			extdata.pixel = data.pixel;
			singleton.pMarker.hide();
			if(singleton.pFuncEventCallback != null)
			{
				if(singleton.pFuncEventCallbackOwner != null)
					singleton.pFuncEventCallback.call(singleton.pFuncEventCallbackOwner,"clickmarker",extdata);
				else
					singleton.pFuncEventCallback.call("clickmarker",extdata);	
			}
		});
		
		return singleton.pMarker;
	},

});