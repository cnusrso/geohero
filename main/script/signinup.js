var $jq = jQuery.noConflict();

var stack_bar_top = {"dir1": "down", "dir2": "right", "push": "top", "spacing1": 0, "spacing2": 0};

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
	$jq( "#dialog-SignUp" ).dialog( "option", "position", { my: "center", at: "center", of: window } );
	$jq( "#dialog-SignUp" ).dialog( "open" );
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

function onSignUpResult(pData)
{
	console.info(pData.msg);
	
	if(pData.code == 200)
	{
		
		new PNotify({
            title: 'SignUp Ok',
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
		
		localStorage.setItem("SignInAccount",pData.account);
		localStorage.setItem("SignInKey",pData.msg);
		
		window.open("main.html","_self");
	}
	else
	{
		new PNotify({
            title: 'SignUp Failed',
            text: "\""+pData.account+"\" SignUp Failed("+pData.code+") "+pData.msg,
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
		
		localStorage.setItem("SignInAccount",pData.account);
		localStorage.setItem("SignInKey",pData.msg);
		
		
		window.open("main.html","_self");
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



function entryFun( ) {
	console.log( "document ready" );
	
	PNotify.prototype.options.styling = "jqueryui";
	
	
	
	$jq( "#dialog-SignIn" ).dialog({
      autoOpen: true,
      modal: true,
	  resizable: false,
	  draggable: false,
      show: { effect: "blind", duration: 800 },
	  closeOnEscape: false,
	  dialogClass: "noclose",
	  title: "Welcome back,hero!",
	  buttons: [
		{
			text: "SignIn",
			title: "Happy To Enjoy All World!",
			icons: {
				primary: "ui-icon-arrowthick-1-e"
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
			text: "SignUp",
			title: "No Account? Now Get It!",
			icons: {
				primary: "ui-icon-arrowreturnthick-1-w"
			},
			click: function() {
				$jq( this ).dialog( "close" );
			
				$jq( "#dialog-SignUp" ).dialog( "option", "position", { my: "center", at: "center", of: window } );
				$jq( "#dialog-SignUp" ).dialog( "open" );
			}
		}
	  ]
    });
	
	
	$jq( "#dialog-SignUp" ).dialog({
      autoOpen: false,
      modal: true,
	  resizable: false,
	  width: 350,
	  draggable: false,
      show: { effect: "blind", duration: 800 },
	  closeOnEscape: false,
	  dialogClass: "noclose",
	  title: "New to geographer hero?",
	  buttons: [
		{
		  text: "SignUp",
		  icons: {
			primary: "ui-icon-arrowthick-1-e"
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
                message: '<h1>Wait SignUp...</h1>', 
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
			primary: "ui-icon-arrowreturnthick-1-w"
		  },
		  click: function() {
			$jq( this ).dialog( "close" );
			
			$jq( "#dialog-SignIn" ).dialog( "option", "position", { my: "center", at: "center", of: window } );
			$jq( "#dialog-SignIn" ).dialog( "open" );
		  }
		}
	  ]
    });
	
	
}

$jq( document ).ready( entryFun );