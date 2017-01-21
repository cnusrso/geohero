// do main op ...
define(['jquery', 'jqueryui', 'pnotify', 'md5', 'blockui'], {

  /* 
    free          自由状态
    selectbirthpt 正在选择出生点
    
  */
  gamestate: "free",

  init: function() {
    var singleton = this;

    gamestate = "free";

    _gdata.model_jq("#dialog-SelectBirthPos").dialog({
      autoOpen: false,
      modal: true,
      resizable: false,
      draggable: true,
      show: {
        effect: "blind",
        duration: 800
      },
      closeOnEscape: false,
      dialogClass: "noclose",
      title: "Info",
      buttons: [{
        text: "GPSPos",
        title: "Use Current GPS Position!",
        icons: {
          primary: "ui-icon-arrowthick-1-e"
        },
        click: function() {
          _gdata.model_util.BlockMsgShow("In Location...");
          _gdata.model_jq("#dialog-SelectBirthPos").dialog("close");
          _gdata.model_map.startGetCurrentPosition(singleton.onGeoLocationResult, singleton);

        }
      }, {
        text: "MapPos",
        title: "Use Position On Map!",
        icons: {
          primary: "ui-icon-arrowreturnthick-1-w"
        },
        click: function() {
          _gdata.model_jq("#dialog-SelectBirthPos").dialog("close");

          // enter state of select position from map 
          gamestate = "selectbirthpt";
        }
      }]
    });

  },
  
  DoNetworkMsg:function(szType,pData){
    
    console.log("NetworkMsg:->",szType,pData);
    
    if(szType == "io-error"){
      _gdata.model_util.BlockMsgHide();
      _gdata.model_notify.showNotify("Net Error", szType);
    } else if(szType == "close"){
      _gdata.model_util.BlockMsgHide();
      _gdata.model_notify.showNotify("Net Error", szType);
    } else if(szType == "heartbeat timeout"){
      _gdata.model_util.BlockMsgHide();
      _gdata.model_notify.showNotify("Net Error", szType);
    } else if(szType == "error"){
      _gdata.model_util.BlockMsgHide();
      _gdata.model_notify.showNotify("Net Error", szType);
    } else if(szType == "onKick"){
      _gdata.model_util.BlockMsgHide();
      // do kick
    } else if(szType == "pushmsg"){
      _gdata.model_notify.showNotify("pushmsg", pData.msg);


    } else {
      
    }
    
      
  },

  showSelectBirthPosDlg: function() {
    _gdata.model_jq("#dialog-SelectBirthPos").dialog("option", "position", {
      my: "center",
      at: "center",
      of: window
    });
    _gdata.model_jq("#dialog-SelectBirthPos").dialog("open");
  },


  onGeoLocationResult: function(sResult, pData, pDataDetail) {
    _gdata.model_util.BlockMsgHide();

    var singleton = this;
    if (sResult == "complete") {
      _gdata.model_map.panTo(pData.position);
      //       _gdata.model_notify.showNotify("Info", "使用："+pDataDetail.regeocode.formattedAddress+" 作为您的初始地点么？");

      _gdata.model_jq("#CommonChoose_Content").html("您当前在(" + pDataDetail.regeocode.formattedAddress + ") 要从这里开始么？");
      _gdata.model_jq("#dialog-CommonChoose").dialog({
        autoOpen: false,
        modal: true,
        resizable: false,
        draggable: true,
        show: {
          effect: "blind",
          duration: 800
        },
        closeOnEscape: false,
        dialogClass: "noclose",
        title: "提示",
        buttons: [{
          text: "使用",
          //         title: "Use Current GPS Position!",
          icons: {
            primary: "ui-icon-arrowthick-1-e"
          },
          click: function() {
            _gdata.model_jq("#dialog-CommonChoose").dialog("close");

            singleton.onSetBirthPosition(pData, pDataDetail);

          }
        }, {
          text: "自己从地图上选",
          //         title: "Use Position On Map!",
          icons: {
            primary: "ui-icon-arrowreturnthick-1-w"
          },
          click: function() {
            _gdata.model_jq("#dialog-CommonChoose").dialog("close");


          }
        }]
      });
      _gdata.model_jq("#dialog-CommonChoose").dialog("open");


      //       _gdata.model_map.addMarker(
      //         pData.position,
      //         pDataDetail.regeocode.formattedAddress,
      //         pData);

      //       var pMarker = new AMap.Marker({
      //             map: _gdata.model_map.maper,
      //             position: pData.position,
      //             icon: "http://webapi.amap.com/theme/v1.3/markers/n/mark_b.png",
      //             draggable: true,
      //             cursor: 'move',
      //             raiseOnDrag: true,
      //             clickable: true
      //         });
      //       pMarker.setLabel({
      //           offset: new AMap.Pixel(20, 20),//修改label相对于maker的位置
      //           content: "Use This Pos?"
      //       });


    } else if (sResult == "error") {

    }
    //     console.log("pData",pData);
    //     console.log("pDataDetail",pDataDetail);

  },

  onSetBirthPosition: function(pData, pDataDetail) {
    
    _gdata.model_util.BlockMsgShow("Set Birth Position...");

    var singleton = this;
    _gdata.model_netmgr.req_SetBirthPosition(
      _gdata.model_userdata.userdata.acckey,
      _gdata.model_userdata.userdata.account,
      pData.position.getLng(),
      pData.position.getLat(),
      pDataDetail.regeocode.formattedAddress,
      function(data) {
        _gdata.model_util.BlockMsgHide();
        if (data.code == 200) {
          _gdata.model_notify.showNotify("Info", "Birth Position Ok");

          // show current position marker.
          _gdata.model_userdata.userdata.curpos = new AMap.LngLat(pData.position.getLng(), pData.position.getLat());
          _gdata.model_map.panTo(_gdata.model_userdata.userdata.curpos);
          _gdata.model_map.addMarker(_gdata.model_userdata.userdata.curpos, _gdata.model_userdata.userdata.account,_gdata.model_userdata.userdata.curpos);

        } else {
          _gdata.model_notify.showNotify("Info", "Birth Position Set Failed");
        }
      },
      singleton
    );
  },
  
  getPoiData: function(pPoiData) {
    var singleton = this;
     _gdata.model_util.BlockMsgShow("...");

    _gdata.model_map.getPoiDetails(pPoiData.id,function(poidetail_status, poidetail_result){
			console.log("poidetail_result",poidetail_status,poidetail_result);
			
      if (poidetail_status === 'complete' && poidetail_result.info === 'OK') {
				var poitypedata = poidetail_result.poiList.pois[0].type;
				var poitypearray = poitypedata.split(";");
				var poiname = poidetail_result.poiList.pois[0].name;
				var poipostext = pPoiData.lnglat.lng+","+pPoiData.lnglat.lat;
				var poiaddress = poidetail_result.poiList.pois[0].address;
				
				var pPoiMainType = poitypearray[0];
				if(poitypearray.length <= 0){
					pPoiMainType = "";
				}
				
				_gdata.model_netmgr.req_GetPoiData(
          _gdata.model_userdata.userdata.acckey,
          _gdata.model_userdata.userdata.account,
          pPoiData.id,
					pPoiMainType,
          function(data) {
            _gdata.model_util.BlockMsgHide();
            console.log("poi data from server",data);
						var pExtDataServer = JSON.parse(data.ext);
						//console.log("pExtDataServer",pExtDataServer);
						var pMaybeMonsterNames = pExtDataServer.monstername;
						
            _gdata.model_jq("#dialog-CommonList").dialog( "option", "title", "巢穴信息" );
            _gdata.model_jq("#dialog-CommonList ul").empty();
            var index = 1;

						
            if (data.code == 200) {
              var pDataServer = JSON.parse(data.msg);
//               var poiname = decodeURI(pDataServer.datas[0]._name);

              if(pDataServer.datas[0].ownerid >= 0){
                _gdata.model_notify.showNotify("Info", "有人占领的巢穴");
								
								var bIsMyBase = _gdata.model_userdata.userdata.id == pDataServer.datas[0].ownerid;
								
								var pOwnerDataServer = JSON.parse(data.owner);
								var pMonsterDataServer = JSON.parse(data.monster);

                _gdata.model_jq("#dialog-CommonList ul").append('<li id=\"'+(index++)+'\" >'+'名字:'+poiname+'<\/li>');
								if(pPoiMainType !== ""){
									_gdata.model_jq("#dialog-CommonList ul").append('<li id=\"'+(index++)+'\" >'+'类型:'+pPoiMainType+'<\/li>');
// 									_gdata.model_jq("#dialog-CommonList ul").append('<li id=\"'+(index++)+'\" >'+'占领金:'+pExtDataServer.basecost+'金币<\/li>');
								}
								if(poiaddress !== "")
									_gdata.model_jq("#dialog-CommonList ul").append('<li id=\"'+(index++)+'\" >'+'地址:'+poiaddress+'<\/li>');
								var sOwnerText = '占有者:'+pOwnerDataServer.name;
								if(bIsMyBase){
									sOwnerText += '(自己)';
								}
                _gdata.model_jq("#dialog-CommonList ul").append('<li id=\"'+(index++)+'\" >'+sOwnerText+'<\/li>');
								
                _gdata.model_jq("#dialog-CommonList ul").append('<li id=\"'+(index++)+'\" >'+'怪物: \n'+pMonsterDataServer.name+'	(生命:'+pMonsterDataServer.hp+'/'+pMonsterDataServer.maxhp+') 级别:'+pMonsterDataServer.lvl+'<\/li>');

								var sBtnText = "攻占";
								if(bIsMyBase === true){
									sBtnText = "确定";
								}
								_gdata.model_jq("#dialog-CommonList").dialog(
									"option", 
									"buttons", 
									[
										{
											text: sBtnText,
											icons: {
												primary: "ui-icon-arrowthick-1-e"
											},
											click: function() {
												_gdata.model_jq("#dialog-CommonList").dialog("close");
												if(bIsMyBase === true){
													return;
												}
												singleton.onReadyAttackOtherPoi(pPoiData.id,poiname);
											}
										}
									]
								);
                _gdata.model_jq("#dialog-CommonList").dialog("open");
								
                return;
               }        
            } else if(data.code == 201) {
              _gdata.model_notify.showNotify("Info", "无人占领的巢穴");

            }

            // 显示空据点界面。
            _gdata.model_jq("#dialog-CommonList ul").append('<li id=\"'+(index++)+'\" >'+'名字:'+poiname+'<\/li>');
						if(pPoiMainType !== ""){
							_gdata.model_jq("#dialog-CommonList ul").append('<li id=\"'+(index++)+'\" >'+'类型:'+pPoiMainType+'<\/li>');
							_gdata.model_jq("#dialog-CommonList ul").append('<li id=\"'+(index++)+'\" >'+'占领金:'+pExtDataServer.basecost+'金币<\/li>');
						}           	
						if(poiaddress !== "")
							_gdata.model_jq("#dialog-CommonList ul").append('<li id=\"'+(index++)+'\" >'+'地址:'+poiaddress+'<\/li>');
            _gdata.model_jq("#dialog-CommonList ul").append('<li id=\"'+(index++)+'\" >'+'无主☞地'+'<\/li>');
            if(pMaybeMonsterNames.length > 0){
							pMaybeMonsterNames.forEach(function(value,ii){
								_gdata.model_jq("#dialog-CommonList ul").append('<li id=\"'+(index++)+'\" >'+'可能产生:('+parseInt(ii+1)+')'+value+'<\/li>');
							});
						}

            _gdata.model_jq("#dialog-CommonList").dialog(
              "option", 
              "buttons", 
              [
                {
                  text: "霸占",
                  icons: {
                    primary: "ui-icon-arrowthick-1-e"
                  },
                  click: function() {
                    _gdata.model_jq("#dialog-CommonList").dialog("close");
                    _gdata.model_notify.showNotify("Info", "开始霸占了！！！");
										singleton.onOccupyEmptyPoi(pPoiData.id,pExtDataServer.basetypeindex,poiname,poipostext);
                  }
                }
              ]
            );

            _gdata.model_jq("#dialog-CommonList").dialog("open");
          },
          singleton
        );
        
        
			} else {
        _gdata.model_util.BlockMsgHide();
        _gdata.model_notify.showNotify("Info", "无法得到巢穴的详细信息");
			}
    },singleton);
    
    
    
  },
  
	// 准备攻击一个他人据点
	onReadyAttackOtherPoi: function(targetpoiid,targetpoiname){
// 		_gdata.model_notify.showNotify("Info", "选择用哪些点攻击！！！");
		
		_gdata.model_util.BlockMsgShow("获取自己的据点...");
		var singleton = this;
    _gdata.model_netmgr.req_getUserPoisData(
      _gdata.model_userdata.userdata.acckey,
      _gdata.model_userdata.userdata.account,
      function(data) {
        _gdata.model_util.BlockMsgHide();
				if(data.code !== 200){
					_gdata.model_notify.showNotify("信息", "获取自己的据点出错:",data.code);
					return;
				}
				var pAllSourceData = JSON.parse(data.msg);
				if(pAllSourceData.count <= 0){
					_gdata.model_notify.showNotify("信息", "你一个据点都没有!");
					return;
				}
				// show dialog....
				var pDlg_ = _gdata.model_jq("#dialog-CommonList");
				var pDlg_ul = _gdata.model_jq("#dialog-CommonList ul");
// 				var winWidth=document.body.clientWidth||document.documentElement.clientWidth
				pDlg_.dialog( "option", "width", 320 );
				var nOldWidth = pDlg_.dialog("option","width");
				console.log("oldwidth",nOldWidth);
				pDlg_.dialog( "option", "title", "点选据点进行攻击！已选(0)个" );
				pDlg_ul.empty();
				
				var pSelectedPoi = new Map();
				var nSelectedPoiNum = 0;
				var index = 1;
				for (var j=0;j<pAllSourceData.count;j++){
					var pName = decodeURI(pAllSourceData.datas[j]._name);
					var pPositions = pAllSourceData.datas[j]._location;
					pSelectedPoi.set(j,0);
					pDlg_ul.append('<li id=\''+(index++)+'\' index=\''+j+'\' location=\''+pPositions+'\'>'+pName+' <\/li>');
// 					+'\n路程:300米 用时:5分钟'
				}
				
				_gdata.model_jq("#dialog-CommonList-List li").click(function() {
					var nIndex = parseInt(this.getAttribute('index'));					
					console.log("you select ",nIndex);
					
					var pTextSel = " (已选)";
					if(pSelectedPoi.get(nIndex) === 0){
						pSelectedPoi.set(nIndex,1);// 选中了这个点
						this.innerHTML += pTextSel;
						nSelectedPoiNum ++;
						
						var ppoipos = this.getAttribute('location');
						console.log("ppoipos",ppoipos);   
						if(ppoipos == null){
							return;
						}
						
						var ppoiposarray = ppoipos.split(",");
						var pposobj = new AMap.LngLat(parseFloat(ppoiposarray[0]), parseFloat(ppoiposarray[1]));
						_gdata.model_map.panTo(pposobj);
						_gdata.model_map.addClickOneMarker(pposobj, "在这里");
						
					} else {
						pSelectedPoi.set(nIndex,0);// 不选这个点
						this.innerHTML = this.innerHTML.substr(0,this.innerHTML.length-pTextSel.length);
						nSelectedPoiNum--;
					}
					pDlg_.dialog( "option", "title", "点选据点进行攻击！"+"已选("+nSelectedPoiNum+")个" );
				});
				pDlg_.dialog("option", "buttons", 
					[
						{
							text: "进攻",
							icons: {
								primary: "ui-icon-arrowthick-1-e"
							},
							click: function() {
								if(nSelectedPoiNum <= 0){
									_gdata.model_notify.showNotify("信息", "没有选择任何据点!");
									return;
								}
								
								// 准备攻方的ID列
								var pSourcePoiIds = [];
								for (var j=0;j<pAllSourceData.count;j++){
									if(pSelectedPoi.get(j) === 0){
										continue;
									}
									pSourcePoiIds.push(pAllSourceData.datas[j].poiid);
								}
								// 发出
								_gdata.model_netmgr.req_readyAttackBase(
									_gdata.model_userdata.userdata.acckey,
									_gdata.model_userdata.userdata.account,
									targetpoiid,
									pSourcePoiIds,
									singleton.onGetReadyAttackOtherPoiResult,
									singleton
								);
								
								pDlg_.dialog("close");
								_gdata.model_util.BlockMsgShow("准备攻击->>"+targetpoiname);
							}
						}
					]
				);
				pDlg_.dialog("open");
					
      },
      singleton
    );
		
		
	},
	
	onGetReadyAttackOtherPoiResult: function(data){
		var singleton = this;
		
		_gdata.model_util.BlockMsgHide();
		
		if(data.code !== 200){
			_gdata.model_notify.showNotify("信息", "发起攻击失败:("+data.code+") ("+data.msg+")");
			return;
		}
		
		var pBattleData = JSON.parse(data.msg);
		console.log("attack result:->",pBattleData);
		_gdata.model_notify.showNotify("信息", "发起攻击成功!");
		
		
		var posarray_target = pBattleData.targetpos.split(',');
		var pos_target = new AMap.LngLat(parseFloat(posarray_target[0]), parseFloat(posarray_target[1]));

		var nCurTime = (new Date()).getTime();
		var nHasCostTime = nCurTime-pBattleData.begintime;
		var nHasCostTime_int = Math.floor(nHasCostTime/1000);
		
		var pDlg_ = _gdata.model_jq("#dialog-CommonList");
		var pDlg_ul = _gdata.model_jq("#dialog-CommonList ul");
		var viewsize = _gdata.model_util.GetViewportSize();
		pDlg_.dialog( "option", "width", viewsize[0]/4 );
		pDlg_.dialog( "option", "title", "战斗开始" );
		pDlg_ul.empty();
		var index = 1;
		var posindex = 0;
		pBattleData.sourceposs.forEach(function(onesourcepos){
			// find distance data by start pos
			for(var i = 0; i < pBattleData.distance.length; ++ i){
				if(pBattleData.distance[i].route.origin != onesourcepos){
					continue;
				}
				
				var poiname = decodeURI(pBattleData.sourcenames[posindex]);
				var nCostTime = parseInt(pBattleData.distance[i].route.paths[0].duration);
				pDlg_ul.append('<li id=\''+(index++)+'\' flag=\'none\'>从 '+poiname+' 出发<\/li>');
				pDlg_ul.append('<li id=\''+(index++)+'\' flag=\'timecounter\'>    离到达还有:'+nCostTime+'秒<\/li>');
				
				// show walk anim...
				var pFullPathPoss = [];//cur paths location array				
				pBattleData.distance[i].route.paths[0].steps.forEach(function(onestep){
					var pCurStepPathArray = onestep.polyline.split(";");
					pCurStepPathArray.forEach(function(onePosText){
						var onePosArray = onePosText.split(",");
						pFullPathPoss.push(new AMap.LngLat(parseFloat(onePosArray[0]),parseFloat(onePosArray[1])));
					});
				});
				
				if(pFullPathPoss.length >= 0){
					var nPathDistance_KM = parseInt(pBattleData.distance[i].route.paths[0].distance)/1000;
					var nPathDuration_Hour = parseInt(pBattleData.distance[i].route.paths[0].duration)/3600;
					var nSpeed = nPathDistance_KM/nPathDuration_Hour;
					_gdata.model_map.addMoveAloneMarker(pFullPathPoss, nSpeed,0,"battleresult:marker:"+i);
					_gdata.model_map.addPolyLine(pFullPathPoss,"battleresult:line:"+i);
				}
				
			}
			posindex++;
		});		
		pDlg_.dialog("option", "buttons", [{
				text: "关闭",
				icons: {
					primary: "ui-icon-arrowthick-1-e"
				},
				click: function() {
					pDlg_.dialog("close");
					// clear battle process data..
					for(var i = 0; i < pBattleData.sourceposs.length; ++ i){
						_gdata.model_map.removeMarker("battleresult:marker:"+i)
						_gdata.model_map.removePolyLine("battleresult:line:"+i)
					}	
				}
			}]
		);
		pDlg_.dialog("open");
	},
	
	onOccupyEmptyPoi: function(npoiid,npoitypeid,spoiname,spoipostext){
		_gdata.model_util.BlockMsgShow("霸占中...");
		
		var singleton = this;
    _gdata.model_netmgr.req_OccupyEmptyBase(
      _gdata.model_userdata.userdata.acckey,
      _gdata.model_userdata.userdata.account,
      npoiid,
			npoitypeid,
			spoiname,
			spoipostext,
      function(data) {
        _gdata.model_util.BlockMsgHide();
        if (data.code == 200) {
          _gdata.model_notify.showNotify("信息", "霸占成功");

        } else {
          _gdata.model_notify.showNotify("信息", "霸占失败("+data.code+")"+data.msg);
        }
      },
      singleton
    );
		
	},
	
  onTeleportToPoi: function(pPoiData) {
    
    _gdata.model_util.BlockMsgShow("Teleport To...");

    var singleton = this;
    _gdata.model_netmgr.req_TeleportToPosition(
      _gdata.model_userdata.userdata.acckey,
      _gdata.model_userdata.userdata.account,
      pPoiData.lnglat.getLng(),
      pPoiData.lnglat.getLat(),
      pPoiData.name,
      function(data) {
        _gdata.model_util.BlockMsgHide();
        if (data.code == 200) {
          _gdata.model_notify.showNotify("Info", "Teleport Ok");

          // show current position marker.
          _gdata.model_userdata.userdata.curpos = pPoiData.lnglat;
          //_gdata.model_map.panTo(_gdata.model_userdata.userdata.curpos);
          _gdata.model_map.addMarker(_gdata.model_userdata.userdata.curpos, _gdata.model_userdata.userdata.account,pPoiData.lnglat);

        } else {
          _gdata.model_notify.showNotify("Info", "Teleport Failed");
        }
      },
      singleton
    );
  },

  onGetUserDataResult: function(pData) {
    // console.info(pData.code);
    var singleton = this;

    if (pData.code == 200) {

			_gdata.model_userdata.userdata.id = pData.data._id;
			_gdata.model_userdata.userdata.money = pData.data.money;
			_gdata.model_userdata.userdata.nickname = pData.data.nickname;
			
      if (pData.data._name == "0") {
        _gdata.model_util.BlockMsgHide();
        
        // not has select birth position
        _gdata.model_notify.showNotify("Info", "Need Select a Birth Position");
        this.showSelectBirthPosDlg();
      } else {
        _gdata.model_util.BlockMsgHide();
        
        // has select birth position
        _gdata.model_notify.showNotify("Info", "Will Go To Last Position");
        var posarray = pData.data._location.split(',');
				
				
        _gdata.model_userdata.userdata.curpos = new AMap.LngLat(parseFloat(posarray[0]), parseFloat(posarray[1]));
        _gdata.model_map.panTo(_gdata.model_userdata.userdata.curpos);
        _gdata.model_map.zoomTo(15);
        _gdata.model_map.addMarker(_gdata.model_userdata.userdata.curpos, _gdata.model_userdata.userdata.account,_gdata.model_userdata.userdata.curpos);
      }

    } else {
      console.warn("GetUserData again!!",pData);
      setTimeout(
        function(){
          _gdata.model_netmgr.req_getUserData(
            _gdata.model_userdata.userdata.acckey, 
            _gdata.model_userdata.userdata.account,
            singleton.onGetUserDataResult, 
            singleton);
        },
        500
      );
    }
  },

	onGetUserPoisData(){
		_gdata.model_util.BlockMsgShow("...");
		var singleton = this;
    _gdata.model_netmgr.req_getUserPoisData(
      _gdata.model_userdata.userdata.acckey,
      _gdata.model_userdata.userdata.account,
      function(data) {
        _gdata.model_util.BlockMsgHide();
				console.log("mypois",data);
        if (data.code == 200) {
					// show dialog....
					var pAllData = JSON.parse(data.msg);
					
					var pDlg_ = _gdata.model_jq("#dialog-CommonList");
					var pDlg_ul = _gdata.model_jq("#dialog-CommonList ul");
					var winWidth=document.body.clientWidth||document.documentElement.clientWidth
					pDlg_.dialog( "option", "width", winWidth/4 );
					pDlg_.dialog( "option", "title", "我的巢穴" );
					pDlg_ul.empty();
					var index = 1;
					pDlg_ul.append('<li id=\''+(index++)+'\'>'+'总个数:'+pAllData.count+' <\/li>');
					
					if(pAllData.count > 0){
						for (var j=0;j<pAllData.count;j++){
							
							var pName = decodeURI(pAllData.datas[j]._name);
							var pPositions = pAllData.datas[j]._location;
							pDlg_ul.append('<li id=\''+(index++)+'\' location=\''+pPositions+'\'>'+pName+' <\/li>');
						}
						_gdata.model_jq("#dialog-CommonList-List li").click(function() {
							var ppoipos = this.getAttribute('location');
							if(ppoipos == null){
								return;
							}
							var ppoiposarray = ppoipos.split(",");
							var pposobj = new AMap.LngLat(parseFloat(ppoiposarray[0]), parseFloat(ppoiposarray[1]));
							_gdata.model_map.panTo(pposobj);
							_gdata.model_map.addClickOneMarker(pposobj, "在这里");
						});
					}else{
						
					}
					pDlg_.dialog(
						"option",
						"buttons", [{
							text: "知道了",
							icons: {
								primary: "ui-icon-arrowthick-1-e"
							},
							click: function() {
								pDlg_.dialog("close");
							}
						}]
					);
					pDlg_.dialog("open");
					
        } else {
					
        }
      },
      singleton
    );
		
	},
	
	// 得到用户当前的战斗数据
	GetUserBattleData: function() {
		_gdata.model_util.BlockMsgShow("...");
		var singleton = this;
    _gdata.model_netmgr.req_getUserBattleData(
      _gdata.model_userdata.userdata.acckey,
      _gdata.model_userdata.userdata.account,
      function(data) {
        _gdata.model_util.BlockMsgHide();
				console.log("mybattle",data);
        if (data.code != 200) {
					_gdata.model_notify.showNotify("信息","得到战斗数据出错:"+data.code+":"+data.msg);
					return;
				}				
				var pAllData = JSON.parse(data.msg);
				if(pAllData.length <= 0){
					_gdata.model_notify.showNotify("信息","当前没有战斗进行");
					return;
				}
				
				var pDlg_ = _gdata.model_jq("#dialog-CommonList");
				var pDlg_ul = _gdata.model_jq("#dialog-CommonList ul");
				var viewsize = _gdata.model_util.GetViewportSize();
				pDlg_.dialog( "option", "width", viewsize[0]/4 );
				pDlg_.dialog( "option", "title", "正在进行的战斗" );
				pDlg_ul.empty();
				// show every battle...
				var index = 0;
				pAllData.forEach(function(onebattle){
					var pTargetName = decodeURI(onebattle.targetname);
					
					pDlg_ul.append('<li id=\''+index+'\'>第'+(index+1)+'场<\/li>');
					
					var index2 = 0;
					onebattle.sourcenames.forEach(function(onesourcename){
						var pSourceName = decodeURI(onesourcename);
						pDlg_ul.append('<li id=\''+index+'\' subid=\''+index2+'\'>    '+pSourceName+' >>> '+pTargetName+'<\/li>');
						index2++;
					});
					
					index++;
				});
				
				// deal click on source poi
				_gdata.model_jq("#dialog-CommonList-List li").click(function() {
					var nBattleIndex = parseInt(this.getAttribute('id'));
// 					var nSourceIndex = parseInt(this.getAttribute('subid'));
					var nCurTime = (new Date()).getTime();
					var nHasCostTime = Math.floor((nCurTime-pAllData[nBattleIndex].begintime)/1000);
					
					_gdata.model_map.removeMarker();
					_gdata.model_map.removePolyLine();
					
					for(var i = 0; i < pAllData[nBattleIndex].distance.length; ++ i){
						// show walk anim...
						var pFullPathPoss = [];//cur paths location array
						var nCurInPos = -1;
						var nAllDistance = 0;
						var nAllTime = 0;		
						pAllData[nBattleIndex].distance[i].route.paths[0].steps.forEach(function(onestep){
							nAllDistance += parseInt(onestep.distance);
							nAllTime += parseInt(onestep.duration);
							var pCurStepPathArray = onestep.polyline.split(";");// 当前路径的数组。
							
							if(nCurInPos == -1){// 找到当前走到哪了。。
// 								console.log("nHasCostTime < nAllTime",nHasCostTime,nAllTime);
								if(nHasCostTime < nAllTime){
									// in current path..
									var nDelayTime = nHasCostTime - (nAllTime-onestep.duration);
									nCurInPos = pFullPathPoss.length+Math.floor(pCurStepPathArray.length*(nDelayTime/onestep.duration));									
								}else{
									// maybe in next.
								}
							}
							
							
							pCurStepPathArray.forEach(function(onePosText){
								var onePosArray = onePosText.split(",");
								
								pFullPathPoss.push(new AMap.LngLat(parseFloat(onePosArray[0]),parseFloat(onePosArray[1])));
							});
							
						});

						if(pFullPathPoss.length >= 0){
							var nPathDistance_KM = parseInt(pAllData[nBattleIndex].distance[i].route.paths[0].distance)/1000;
							var nPathDuration_Hour = parseInt(pAllData[nBattleIndex].distance[i].route.paths[0].duration)/3600;
							var nSpeed = nPathDistance_KM/nPathDuration_Hour;
							console.log("process:",nCurInPos,pFullPathPoss.length);
							if(nCurInPos >= 0){
								_gdata.model_map.addMoveAloneMarker(pFullPathPoss, nSpeed,nCurInPos,"userbattle:marker:"+nBattleIndex+":"+i);
							}else{
								_gdata.model_map.addStaticMarker(pFullPathPoss[pFullPathPoss.length-1], "userbattle:marker:"+nBattleIndex+":"+i);
							}
							_gdata.model_map.addPolyLine(pFullPathPoss,"userbattle:line:"+nBattleIndex+":"+i);
						}
					}					
				});
				pDlg_.dialog("option", "buttons", [{
					text: "知道了",
					icons: {
						primary: "ui-icon-arrowthick-1-e"
					},
					click: function() {
						pDlg_.dialog("close");
						_gdata.model_map.removeMarker();
						_gdata.model_map.removePolyLine();
					}
				}]);
				pDlg_.dialog("open");
				
      },
      singleton
    );
	},

  onMapEvent: function(sType, pPos) {
    var singleton = this;
    console.log("onMapEvent->",sType,pPos);

    if (sType == "click") {
      // click on map.............................................................................
      
    } else if (sType == "movestart") {
      // begin move map .................................................
      _gdata.model_jq("#maincirclemenu").circleMenu('close');
    } else if (sType == "zoomstart") {
      // begin zoom map ..................................................
      _gdata.model_jq("#maincirclemenu").circleMenu('close');
    } else if (sType == "hotspotclick") { 
      // click one hot point .............................................
      if (gamestate == "selectbirthpt") {
        _gdata.model_map.panTo(pPos.lnglat);
        _gdata.model_map.addMarker(pPos.lnglat, "出生点？",pPos);
      } else if (gamestate == "free") {
        _gdata.model_map.panTo(pPos.lnglat);
        _gdata.model_map.addMarker(pPos.lnglat, "click me",pPos);        
      }
    } else if (sType == "clickmarker") {
      // click one marker.................................................

      switch(gamestate)
      {
        case "selectbirthpt":
        {
          _gdata.model_jq("#CommonChoose_Content").html("使用这个位置作为出生点么？");
          _gdata.model_jq("#dialog-CommonChoose").dialog({
            autoOpen: false,
            modal: true,
            resizable: false,
            draggable: true,
            show: {
              effect: "blind",
              duration: 800
            },
            closeOnEscape: false,
            dialogClass: "noclose",
            title: "提示",
            buttons: [{
              text: "是的",
              icons: {
                primary: "ui-icon-arrowthick-1-e"
              },
              click: function() {
                _gdata.model_jq("#dialog-CommonChoose").dialog("close");

                singleton.onSetBirthPosition({
                  position: pPos.lnglat
                }, {
                  regeocode: {
                    formattedAddress: "aaaa"
                  }
                });

              }
            }, {
              text: "放弃",
              icons: {
                primary: "ui-icon-arrowreturnthick-1-w"
              },
              click: function() {
                _gdata.model_jq("#dialog-CommonChoose").dialog("close");
              }
            }]
          });
          _gdata.model_jq("#dialog-CommonChoose").dialog("open");
        }break;

        case "free":
        {
          _gdata.model_userdata.setCurSelectPoi(pPos);
          console.log("clickmarker:",pPos);
          _gdata.model_jq("#maincirclemenu").offset({ top: pPos.pixel.y-16, left: pPos.pixel.x-16});
          _gdata.model_jq("#maincirclemenu").circleMenu('open');
        }break;
      }

    }
  },

  onGetWalkingData: function(status, result) {
    if (status == "complete") {
      console.log(result);
    } else {
      console.log(result);
    }
  },
  
  enter: function() {

    var singleton = this;

    _gdata.model_map.setEventCallbackData(singleton.onMapEvent, singleton);
    _gdata.model_netmgr.setSystemCallback(singleton.DoNetworkMsg);
    
    _gdata.model_util.BlockMsgShow("Get Last Location");

    setTimeout(
      function(){
        var acckey = _gdata.model_userdata.userdata.acckey;
        var username = _gdata.model_userdata.userdata.account;
        _gdata.model_netmgr.req_getUserData(acckey, username, singleton.onGetUserDataResult, singleton);
      },
      200
    );
    

    //     _gdata.model_jq("#btn-Account").click(function(event) {
    //       event.preventDefault();


    //     });

    _gdata.model_jq("#btn-Account").dropmenu({
      items: [{
        name: '我的位置',
        id: 0
      }, {
        name: '退出',
        id: 1
      }, {
        name: '我的巢穴',
				id: 2
      }, {
        name: '我的战斗',
				id: 3
      }, {
        name: 'Store My Position'
      }, {
        name: 'Clean Route'
      }],
      showAnim: 'fadeIn',
      duration: 'normal',
      select: function(item) {
        console.info(item);
        switch (item.id) {
          case 0:
            {
//               _gdata.model_map.panTo(_gdata.model_userdata.userdata.curpos);
//               _gdata.model_map.addMarker(
//                 _gdata.model_userdata.userdata.curpos, 
//                 _gdata.model_userdata.userdata.account,
//                 _gdata.model_userdata.userdata.curpos
//                 );
							_gdata.model_util.BlockMsgShow("获取位置中...");
							_gdata.model_map.startGetCurrentPosition(function(nResult,sData){								
								if(nResult === 0){
									_gdata.model_util.BlockMsgHide();
									var pAddressData = sData.addressComponent;									
									_gdata.model_notify.showNotify("信息","当前位置:"+pAddressData.province+pAddressData.city+pAddressData.district+pAddressData.township);
								} else {
									// agagin get city info..
									_gdata.model_map.getCurrentCity(function(nResult,pData){
										_gdata.model_util.BlockMsgHide();
										if(nResult === 0){
											_gdata.model_notify.showNotify("信息","当前位置:"+pData.city);
											_gdata.model_map.setBounds(pData.bounds);
										}else{
											_gdata.model_notify.showNotify("信息","无法得到位置:"+pData.info);
										}
									},singleton);
								}
							},singleton);
							
							
            }
            break;
          case 1:
            {
              singleton.closeMe();
//               _gdata.procedure_login.enter();
              // todo 
              window.location.reload(true);
            }
            break;
					case 2:{
						singleton.onGetUserPoisData();						
						}break;
					case 3:{
						singleton.GetUserBattleData();
					}break;
          default:
            {

            };
        }

      }
    });
    
    _gdata.model_jq("#dialog-CommonList").dialog({
      autoOpen: false,
      modal: true,
      resizable: false,
      draggable: true,
      height: 300,
      show: {
        effect: "fade",
        duration: 1000
      },
      closeOnEscape: false,
      dialogClass: "noclose",
      title: "提示",
      buttons: [{
        text: "关闭",
        icons: {
          primary: "ui-icon-arrowthick-1-e"
        },
        click: function() {
          _gdata.model_jq("#dialog-CommonList").dialog("close");

        }
      }]
    });
    
		var pCurUl = _gdata.model_jq("#maincirclemenu");
		pCurUl.empty();
		pCurUl.append('<li><a href=\"#\"><\/a><\/li>');
		pCurUl.append('<li id=\"teleport\" ><a href=\"#\" alt=\"Item 1\" title=\"teleport\"  style=\'color:#ff1010\'>传送<\/a><\/li>');
		pCurUl.append('<li id=\"move\" ><a href=\"#\" alt=\"Item 2\" title=\"move to\"  style=\'color:#ff1010\'>移动<\/a><\/li>');
		pCurUl.append('<li id=\"query\" ><a href=\"#\" alt=\"Item 3\" title=\"query info\"  style=\'color:#ff1010\'>详细<\/a><\/li>');
    _gdata.model_jq('#maincirclemenu').circleMenu({
      direction: 'full',
      trigger: 'click',
      open: function() {
        console.log('maincirclemenu opened');
      },
      close: function() {
        console.log('maincirclemenu closed');
        
        setTimeout(
          function(){
            _gdata.model_jq("#maincirclemenu").offset({
              top: -1000,
              left: -1000
            });
          },
          500);
      },
      init: function() {
        console.log('maincirclemenu initialized');
				
      },

      select: function(evt, index) {
        
        
        var nBtnId = index[0].id;
        console.log("aaaaa->",nBtnId);
        switch(nBtnId)
          {
            case "teleport":
              {
//                 singleton.onTeleportToPoi(_gdata.model_userdata.getCurSelectPoi());

              }break;
              
            case "query":
              {
                singleton.getPoiData(_gdata.model_userdata.getCurSelectPoi());
              }break;
              
            case "move":
              {
                var acckey = _gdata.model_userdata.userdata.acckey;
                var username = _gdata.model_userdata.userdata.account;
                _gdata.model_netmgr.req_testGameMsg(acckey, username, function(pData){
                  console.log("testMsg:->",pData);
                }, singleton);
              }break;
          }
        
        setTimeout(
          function(){
            _gdata.model_jq("#maincirclemenu").offset({
              top: -1000,
              left: -1000
            });
          },
          1000);
      }
    });
    _gdata.model_jq('#maincirclemenu').show();
    _gdata.model_jq('#maincirclemenu').offset({ top: -1000, left: -1000});
    
    
		
    
  },// function end

  closeMe: function(){
    
    
    _gdata.model_map.setEventCallbackData(null,null);
    _gdata.model_netmgr.setSystemCallback(null);
    
    _gdata.model_netmgr.disconnectNet();
    
  },
  toNextProcedure: function() {
    this.closeMe();


  },
});