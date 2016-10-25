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
	
	pWalkingService: null,
	
	
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
				map: singleton.maper,
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
			// console.log("poi search begin:", result);
			if(singleton.pFuncEventCallback != null)
				{
					if(singleton.pFuncEventCallbackOwner != null)
						singleton.pFuncEventCallback.call(singleton.pFuncEventCallbackOwner,"hotspotclick",result);
					else
						singleton.pFuncEventCallback.call("hotspotclick",result);	
				}
			
// 			singleton.placeSearch.getDetails(result.id, function(status, result) {
// 				if (status === 'complete' && result.info === 'OK') {
// 					console.log("poi details:", result);
// 				} else {
// 					console.log("poi details failed:", status, result);
// 				}
// 			});
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
		
		


	},

	setEventCallbackData:function(pCallback,pCallbackOwner) {
		this.pFuncEventCallback = pCallback;
		this.pFuncEventCallbackOwner = pCallbackOwner;
		
	},
	
	startGetWalkingData: function(from,to,pCallback,pCallbackOwner){
		var singleton = this;
		this.pWalkingService.search(from,to,function(status,result){
			
			if(singleton.pCallback != null)
				{
					if(singleton.pCallbackOwner != null)
						singleton.pCallback.call(singleton.pCallbackOwner,status,result);
					else
						singleton.pCallback.call(status,result);	
				}
			
		})
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
			
			// 由位置得到详细信息
			singleton.pGeoCoder.getAddress(data.position, function(status, result) {
				if (status === 'complete' && result.info === 'OK') {
					singleton.bOnGeoLocation = false;
					if (pCallback != null && CallbackOwner != null) {
						pCallback.call(CallbackOwner, "complete", data,result);
					}
				}
			});
			
		}); //返回定位信息
		
		AMap.event.addListenerOnce(this.pGeolocation, 'error', function(data) {
			singleton.bOnGeoLocation = false;
			if(pCallback != null && CallbackOwner != null)
			{
				pCallback.call(CallbackOwner, "error", data);
			}
		}); //返回定位出错信息
		
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

	addMarker:function(pos,szLabel,pExtData)
	{
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