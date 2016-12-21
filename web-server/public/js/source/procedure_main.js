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
    _gdata.model_notify.showNotify("Net Error", szType);
    console.log("NetworkMsg:->",szType,pData);
    
    if(szType == "io-error"){
      _gdata.model_util.BlockMsgHide();
    } else if(szType == "close"){
      _gdata.model_util.BlockMsgHide();
    } else if(szType == "heartbeat timeout"){
      _gdata.model_util.BlockMsgHide();
    } else if(szType == "error"){
      _gdata.model_util.BlockMsgHide();
    } else if(szType == "onKick"){
      _gdata.model_util.BlockMsgHide();
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
												_gdata.model_notify.showNotify("Info", "开始攻占了！！！");
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
						"buttons", 
						[
							{
								text: "知道了",
								icons: {
									primary: "ui-icon-arrowthick-1-e"
								},
								click: function() {
									pDlg_.dialog("close");
								}
							}
						]
					);
					pDlg_.dialog("open");
					
        } else {
					
        }
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
        name: 'Modify Map Type'
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
              _gdata.model_map.panTo(_gdata.model_userdata.userdata.curpos);
              _gdata.model_map.addMarker(
                _gdata.model_userdata.userdata.curpos, 
                _gdata.model_userdata.userdata.account,
                _gdata.model_userdata.userdata.curpos
                );
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
                singleton.onTeleportToPoi(_gdata.model_userdata.getCurSelectPoi());

              }break;
              
            case "query":
              {
                singleton.getPoiData(_gdata.model_userdata.getCurSelectPoi());
              }break;
              
            case "move":
              {
                
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