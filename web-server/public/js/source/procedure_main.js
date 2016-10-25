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
  
  onTeleportToPoi: function(pPoiData) {
    
    _gdata.model_util.BlockMsgShow("Teleport To...");

    var singleton = this;
    _gdata.model_netmgr.req_TeleportToPosition(
      _gdata.model_userdata.userdata.acckey,
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
          _gdata.model_netmgr.req_getUserData(_gdata.model_userdata.userdata.acckey, singleton.onGetUserDataResult, singleton);
        },
        500
      );
    }
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
        _gdata.model_netmgr.req_getUserData(_gdata.model_userdata.userdata.acckey, singleton.onGetUserDataResult, singleton);
      },
      1000
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
        name: 'Go to My Location'
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
              _gdata.procedure_login.enter();
            }
            break;
          default:
            {

            };
        }

      }
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
    _gdata.model_jq("#btn-Account").off("click");
    
    _gdata.model_map.setEventCallbackData(null,null);
    _gdata.model_netmgr.setSystemCallback(null);
    
    _gdata.model_netmgr.disconnectNet();
    
    
  },
  toNextProcedure: function() {
    this.closeMe();


  },
});