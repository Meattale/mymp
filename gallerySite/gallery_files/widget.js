var VVC_DOMAIN = 'http://vsevcredit.ru';
var VVC_PORT = '443';

if(!VVC_SETTINGS) VVC_SETTINGS = {};

VVC_SETTINGS.color = VVC_SETTINGS.css ? VVC_SETTINGS.css : 'red';

document.write('<script id="VVC_SOCKET_IO" type="text/javascript" src="'+VVC_DOMAIN+':'+VVC_PORT+'/socket.io/socket.io.js"></script>'+
               '<link rel="stylesheet" type="text/css" href="'+VVC_DOMAIN+'/widget/light.css"/>');

function CVVC()
{
    var se = document.getElementsByTagName('SCRIPT');
    var selen = se.length;
    for(var i=0;i<selen;i++)
    {
        if(se[i].src.toLowerCase().indexOf('http://test.vsevcredit.ru')==0)
        {
            VVC_DOMAIN = 'http://test.vsevcredit.ru';
            VVC_PORT = '8000'; break;
        }
        if(se[i].src.toLowerCase().indexOf('http://dev.vsevcredit.ru')==0)
        {
            VVC_DOMAIN = 'http://dev.vsevcredit.ru';
            VVC_PORT = '8001'; break;
        }
        if(se[i].src.toLowerCase().indexOf('http://www.vvc.dev')==0
           || se[i].src.toLowerCase().indexOf('http://vvc.dev')==0)
        {
            VVC_DOMAIN = 'http://www.vvc.dev';
            VVC_PORT = '8001'; break;
        }
    }

    this.socket     = false;
    this.after      = false;
    this.sid        = false;
    this.aid        = '';
    this.freezePane = false;
    this.formPane   = false;
    this.cons       = false;
    this.goods      = [];
    this.total      = 0;
    this.shop_title = '';
    this.shop_comm  = 0;
    this.wish_pays  = {};

    this.sale_id = 0;
    this.promo_title = false;


    this.styleList = ['black','blue','green','navy','orange','red','violet'];
    this.stylesCount = 5;

    var me = this;

    this.initSocket = function(f)
    {
        this.freeze();

        if(document.all && !window.opera && !document.querySelector)
   	    {
   	    	this.browserError();
   	    	return;
   	    }

        this.waitWindow('Идёт соединение с сервером');


        if(this.socket)
        {
            if(typeof(f)=='function') f();
            return true;
        }
        if(typeof(io)!='undefined' && typeof(io.connect)=='function')
        {
            this.socket = io.connect(VVC_DOMAIN+':'+VVC_PORT);
            if(this.socket)
            {
                this.socket.on('connect', function(){me.socket.on('message',function(m){me.onMessage(m);});});
                this.socket.on('error', function(){me.socket=false;io=false;me.initSocket()});
                if(typeof(f)=='function')
                {
                    if(document.all && !window.opera) window.setTimeout(f,1000);
                    else f();
                }
                return true;
            }
        }
        var sc = document.getElementById('VVC_SOCKET_IO');
        if (sc && sc.parentNode)
        {
            var p = sc.parentNode;
            p.removeChild(sc);
            delete(sc);
        }
        sc = document.createElement('SCRIPT');
        sc.id = 'VVC_SOCKET_IO';
        sc.src = VVC_DOMAIN+':'+VVC_PORT+'/socket.io/socket.io.js?'+Math.random();
        document.body.appendChild(sc);

        this.errWindow();
        return false;
    };

    this.browserError = function()
    {
   		this.formPane.innerHTML = '<div id="VVC_WAIT_PANE"><div id="VVC_WAIT_BTN_PANE">Система <b>"Всё в кредит"</b> поддерживает<br/><br/> Internet Explorer начиная с <b>8й</b> версии.<br/><br/>'+
   		                          'Пожалуйста, установите <a href="http://windows.microsoft.com/ru-RU/internet-explorer/products/ie/home/" target="_blank">обновление</a>,'+
   		                          ' а еще лучше,<br/><br/>используйте другой браузер, например:<br/><br/>'+
   		                          '<a href="http://www.google.com/intl/ru/chrome/browser/" target="_blank">Google Chrome</a> или '+
   		                          '<a href="http://mozilla-russia.org/" target="_blank">Fire Fox</a><br/><br/>'+
   		                          '<a href="#" onclick="VVC.unfreeze()" style="text-decoration:none;border-bottom: 1px dotted;">Закрыть это сообщение</a></div></div>';
   	    this.formPane.style.display = 'block';
   	    this.lineUp();
    };

    this.finalPage = function(m)
    {
        var url = m.url ? "window.location.href='"+m.url+"'" : '';
        this.$('VVC_WAIT_BTN_PANE').innerHTML = 'Заказ № <b>'+m.id+'</b> успешно сформирован. В ближайшее время с Вами свяжется наш специалист.';
        this.$('VVC_FORM_USER').innerHTML = '<a id="VVC_LINK" href="'+VVC_DOMAIN+'/session/order/?uid='+m.uid+'&id='+m.id+'&hash='+
                                            m.hash+'" target="_blank" onclick="VVC.unfreeze();'+url+'"><img width="272" height="39" src="'+VVC_DOMAIN+
            		                        '/widget/img/tocab.png" alt="" border="0"/></a>';
    };

    this.waitWindow = function(msg)
    {
   		this.formPane.innerHTML = '<div id="VVC_WAIT_PANE"><img width="180" height="50" src="'+VVC_DOMAIN+
   		                          '/widget/img/logo1.png" alt=""/><img id="VVC_WAIT_IMAGE" width="50" height="50" src="'+
   		                          VVC_DOMAIN+'/widget/img/load.png" alt=""/><div id="VVC_WAIT_BTN_PANE">'+msg+
   		                          '</div></div>';
   	    this.formPane.style.display = 'block';
   	    this.lineUp();
    };

    this.errWindow = function(msg)
    {
   		this.formPane.innerHTML = '<div id="VVC_WAIT_PANE"><img width="180" height="50" src="'+VVC_DOMAIN+
   		                          '/widget/img/logo1.png" alt="" style="float:left;"/><img width="15" height="15" src="'+
   		                          VVC_DOMAIN+'/widget/img/close.png" alt="" title="Отмена" style="float:right;cursor:pointer;" onclick="VVC.unfreeze()"/>'+
   		                          '<div id="VVC_WAIT_BTN_PANE"><div>Cервер временно недоступен.</div><div style="margin-top:10px;">Это ненадолго.</div>'+
   		                          '<div style="margin-top:10px;width:480px;">Попытка повторного соединения состоится через '+
   		                          '<span id="VVC_RECONNECT_SECONDS">10 секунд</span>.</div></div></div>';
        me.errTimer = window.setTimeout(me.errRepeat,1000);
   	    this.formPane.style.display = 'block';
   	    this.lineUp();
    };

    this.errRepeat = function()
    {
        if(me.errTimer) window.clearTimeout(me.errTimer);
        if(me.$('VVC_WAIT_IMAGE'))
        {
        	me.initSocket(me.shopInfo);
        	return;
        }
        var el = me.$('VVC_RECONNECT_SECONDS');
        if(!el) return;
        var s = parseInt(el.innerHTML) - 1;
        if(isNaN(s)) me.initSocket(me.shopInfo);
        else
        {
	        switch(s)
	        {
	        	case 0: me.waitWindow('Идёт соединение с сервером'); break;
	        	case 1: el.innerHTML = '1 секунду'; break;
	        	case 2: case 3: case 4: el.innerHTML = s + ' секунды'; break;
	        	default: el.innerHTML = s + ' секунд'; break;
	        }
	        window.setTimeout(me.errRepeat,1000);
        }
    };

    this.focusElement = function(id)
    {
        me.elIdForFocus = id;
        window.setTimeout(me.doFocusElement,100);
    };
    this.elIdForFocus = '';
    this.doFocusElement = function()
    {
    	var el = me.$(me.elIdForFocus);
    	if(el) try{el.focus();el.select();}catch(e){};
    };

    this.isPhoneEntered = function()
    {
    	var el = me.$('vvc_phone');
    	if(el)
    	{
    	    var num = me.VERIFY.toDigStr(el.value);
    	    if(num.length==10)
    	    {
                el.disabled = true;
                me.$('VVC_WAIT_PHONE_IMAGE').style.visibility = '';
                me.send({'act':'check_phone','phone':num});
    	    }
    	    else
    	    {
    	        if(num.length>0 && me.$('VVC_FORM_USER'))
    	        {
    	        	me.$('VVC_FORM_USER').innerHTML = '';
    	        }
    	        window.setTimeout(me.isPhoneEntered,100);
    	    }
    	}
    };

    this.showAction = function()
    {
   		    me.formPane.innerHTML = '<div id="VVC_WAIT_PANE"><img width="180" height="50" src="'+VVC_DOMAIN+
   		                            '/widget/img/logo1.png" alt="" style="float:left;"/><img width="15" height="15" src="'+
   		                            VVC_DOMAIN+'/widget/img/close.png" alt="" title="Отмена" style="float:right;cursor:pointer;" onclick="VVC.unfreeze()"/>'+
   		                            '<div id="VVC_WAIT_BTN_PANE">'+
   		                            '<div><span style="color:#96AF22"><b style="font-size:20px;">Внимание, проводится акция!</b></span></div>'+
   		                            '<div style="margin-top:10px;"><b>'+me.promo_title+'</b></div>'+
   		                            '<div style="margin-top:10px;text-align:right;"><a href="'+VVC_DOMAIN+'/sales/'+me.sale_id+'" target="_blank" id="VVC_LINK">Подробно об условиях акции</a></div>'+
                                    '<div style="margin-top:10px;text-align:right;">Введите ваш промо-код: <input type="text" id="VVC_PROMO_CODE" class="VVC_REG_FORM_INPUT" /></div>'+
                                    '</div>'+

                                    '<img src="'+VVC_DOMAIN+'/widget/img/skip.png" alt="" height="39" width="164" style="margin-right:200px;cursor:pointer;" onclick="VVC.onStartFormLight(true);"/>'+
                                    '<img src="'+VVC_DOMAIN+'/widget/img/sendpromo.png" alt="" height="39" width="272" style="cursor:pointer;" onclick="VVC.onCheckPromo();"/>'+

   		                            '</div>';
     	    me.formPane.style.display = 'block';
    	    me.lineUp();
    	    me.focusElement('VVC_PROMO_CODE');
    };

    this.topMenuList = [0,0,1];
    this.topMenu = function()
    {
        var s = '';
        for(var i=0;i<me.topMenuList.length;i++)
        {
        	s += '<img id="VVC_MENU_ITEM_'+i+'" src="'+VVC_DOMAIN+'/widget/img/menu_'+i+'_'+me.topMenuList[i]+
        	     '.png" width="175" height="33" alt="" style="cursor:'+(me.topMenuList[i] ? 'default':'pointer')+
        	     ';float:right;margin:0px;" onclick="VVC.menuAction('+i+')"/>';
        }
        if (me.$('VVC_TOP_MENU')) me.$('VVC_TOP_MENU').innerHTML = s;
        return '<div style="text-align:left;margin-top:-20px;height:33px;" id="VVC_TOP_MENU">'+s+'</div>';
    };

    this.menuAction = function(num)
    {
        this.storeWishPay();
        if(me.topMenuList[num]) return;
        var el = me.$('VVC_MAIN_PANE');
        if(!el) return;
        for(var i=0;i<me.topMenuList.length;i++)
        {
            me.topMenuList[i] = 0;
            me.$('VVC_MENU_ITEM_'+i).style.cursor = 'pointer';
        }
        me.topMenuList[num] = 1;
        me.$('VVC_MENU_ITEM_'+num).style.cursor = 'default';

        me.topMenu();
        switch(num)
        {
        	case 0:
        	{
        	    el.innerHTML = me.onlineCons();
        	    me.focusElement('VVC_ONLINE_CHAT_MESSAGE');
        	    me.send({act:'chat'});
        	    me.stopBlinkCons = true;
        	    break;
        	}
        	case 1:
        	{
                if(!me.CALC) me.CALC = new CCreditCalc();
                el.innerHTML = me.CALC.html(me.total);
                if(typeof(me.wish_pays.first_pay)!='undefined')
                {
                    me.$('VVC_CALC_PAY1').value = me.formatMoney(me.wish_pays.first_pay/100);
                    me.$('VVC_CALC_MONTH').value = me.wish_pays.month_count;
                    me.CALC.calc();
                }
            }
            break;
        	case 2: el.innerHTML = me.goodsList(); break;
        }
        me.lineUp();
    };

    this.onlineCons = function()
    {
        return '<table width="100%"><tr><td rowspan="2" valign="top"><div id="VVC_ONLINE_CHAT"></div></td><td valign="top">'+
        '<textarea id="VVC_ONLINE_CHAT_MESSAGE" onkeyup="VVC.chat(event)"></textarea></td></tr><tr><td  valign="bottom">'+
        '<img id="VVC_CONS_BTN_SEND" src="'+VVC_DOMAIN+'/widget/img/btn_send.png" alt="" width="105" height="32" onclick="VVC.chat()" title="Ctrl+Enter"/>'+
        '</td></tr></table>';
    };

    this.onStartFormLight = function(sf)
    {
        if(me.sale_id && me.promo_title===false)
        {
            me.send({act:'promo_info'});
            return;
        }
        me.freeze();
        me.formPane.style.display = 'none';
        if(me.sale_id && me.promo_title && typeof(sf)=='undefined')
        {
            me.showAction();
            return;
        }

        var ml = (document.all && !window.opera && document.querySelector && !document.addEventListener) ? 10 : 19;

        me.formPane.innerHTML = '<div id="VVC_BASE_PANE"><div style="height:58px;"><img width="180" height="50" src="'+VVC_DOMAIN+
	                            '/widget/img/logo1.png" alt="" style="float:left;"/><img width="15" height="15" src="'+
	                            VVC_DOMAIN+'/widget/img/close.png" alt="" title="Отмена" style="float:right;cursor:pointer;" onclick="VVC.unfreeze()"/></div>'+
	                            me.topMenu()+'<div id="VVC_MAIN_PANE">'+me.goodsList()+'</div>'+
	                            '<div id="VVC_WAIT_BTN_PANE">Введите номер вашего мобильного телефона: '+
                                '<input type="text" class="VVC_REG_FORM_INPUT" name="phone" id="vvc_phone" value="(___) - ___ - __ - __" maxlength="'+ml+'"/>'+
	                            '<img id="VVC_WAIT_PHONE_IMAGE" width="50" height="50" src="'+VVC_DOMAIN+'/widget/img/load.png" alt="" style="float:right;visibility:hidden"/>'+
	                            '</div><div id="VVC_FORM_USER"></div>'+
	                            '</div>';
        me.formPane.style.display = 'block';
        //////////////////////////////////////////////////////////////////////////
        if(document.all && !window.opera && document.querySelector && !document.addEventListener)
   	    {
            window.setTimeout(function()
            {            	me.$('vvc_phone').focus();
                me.$('vvc_phone').value = '';
                me.isPhoneEntered();
            	me.lineUp();
            },100);
   	    }
        else
        {
	        MaskedInput(
	        {
	            elm: me.$('vvc_phone'),
	            allowed: '0123456789',
	            format: '(___) - ___ - __ - __',
	            separator: '\/:-. ()'
	        });
            window.setTimeout(function(){            	me.$('vvc_phone').focus();
            	me.VERIFY.setCaretPosition(me.$('vvc_phone'), 1);
            	me.isPhoneEntered();
            	me.lineUp();
            },100);
        }
        ///////////////////////////////////////////////////////////////////////////
    };

    this.anotherPhone = function()
    {
        var el = me.$('vvc_region');
        if(el)
        {
            me.vvcName = me.$('vvc_name').value;
            me.vvcSurname = me.$('vvc_surname').value;
            for(var i in me.regions) me.regions[i][1] = i==el.value ? 1 : 0;
        }
        me.$('VVC_FORM_USER').innerHTML = '';
        me.$('vvc_phone').disabled = false;
        if(document.all && !window.opera && document.querySelector && !document.addEventListener)
        {
            me.$('vvc_phone').value = '';
            me.$('vvc_phone').focus();
        }
        else
        {
            me.$('vvc_phone').value = '(___) - ___ - __ - __';
            me.$('vvc_phone').focus();
            me.VERIFY.setCaretPosition(me.$('vvc_phone'), 1);
        }
        me.isPhoneEntered();
        me.lineUp();
    };

    this.onSMSPWD = function()
    {
    	var el = me.$('vvc_phone');
    	if(el)
    	{
	    	me.$('VVC_WAIT_PHONE_IMAGE').style.visibility = '';
	        me.$('VVC_FORM_USER').innerHTML = '';
	        me.lineUp();
    	    var num = me.VERIFY.toDigStr(el.value);
    	    if(num.length==10) me.send({act:'sms',phone:num});
    	}
    	else me.onStartFormLight(true);
    };

    this.onCheckPhone = function(t,sms)
    {
    	if(!me.$('VVC_WAIT_PHONE_IMAGE')) return;
    	me.$('VVC_WAIT_PHONE_IMAGE').style.visibility = 'hidden';
    	switch(t)
    	{
    		case 'admin': case 'shop': case 'bank':
    		{
                me.$('VVC_FORM_USER').innerHTML = '<div>Телефон <b>'+me.$('vvc_phone').value+'</b> используется в административных целях.</div>'+
                                                  '<div style="margin-top:10px;">Для оформления покупок используйте другой номер.</div>';
    			me.$('vvc_phone').disabled = false;
    			me.$('vvc_phone').value = '(___) - ___ - __ - __';
    			me.$('vvc_phone').focus();
    			me.VERIFY.setCaretPosition(me.$('vvc_phone'), 1);
                me.isPhoneEntered();
                me.lineUp();
    			break;
    		}
    		case 'user':
    		{
                me.$('VVC_FORM_USER').innerHTML = 'Ваш пароль в системе "Всё в кредит": <input id="vvc_pwd" type="password" class="VVC_REG_FORM_INPUT" name="pwd" onkeypress="if(VVC.$(\'VVC_BLINK_PWD\'))VVC.$(\'VVC_BLINK_PWD\').innerHTML=\'\'"/>'+
                                                  '<div style="margin-top:10px;">'+
                                                  '<table width="100%"><tr>'+
                                                  '<td align="left" style="text-align:left"><img width="215" height="39" src="'+VVC_DOMAIN+'/widget/img/phone2.png" alt="" style="cursor:pointer;" onclick="VVC.anotherPhone()"/></td>'+
                                                  ( typeof(sms)!='undefined' ? '<td align="center" style="text-align:center"><blink id="VVC_BLINK_PWD" title="Скрыть" style="cursor:pointer;" onclick="this.innerHTML=\'\'">Пароль отправлен по SMS, ожидайте</blink></td>' :
                                                  '<td align="center" style="text-align:center"><img width="249" height="39" src="'+VVC_DOMAIN+'/widget/img/sms.png" alt="" style="cursor:pointer;" onclick="VVC.onSMSPWD()"/></td>'
                                                  )+
                                                  '<td align="right" style="text-align:right"><img width="183" height="39" src="'+VVC_DOMAIN+'/widget/img/request.png" alt="" style="cursor:pointer;" onclick="VVC.onAuthUser()"/></td>'+
                                                  '</tr></table>'
                                                  '</div>';
                me.focusElement('vvc_pwd');
                me.lineUp();
    			break;
    		}
    		default:
    		{
                var opt = '', sel;
                for(var i in me.regions)
                {
                    sel = me.regions[i][1] ? ' selected="selected"' : '';
                    opt += '<option style="text-align:left" value="'+i+'"'+sel+'>'+me.regions[i][0]+'</option>';
                }
                opt += '<option style="text-align:left" value="0">Другой</option>';

                me.vvcName = me.vvcName ? me.vvcName : '';
                me.vvcSurname = me.vvcSurname ? me.vvcSurname : '';

                me.$('VVC_FORM_USER').innerHTML = '<table width="100%" id="VVC_REG_FORM_TABLE">'+
                                                  '<tr>'+
                                                  '<td>Представьтесь, пожалуйста:</td>'+
                                                  '<td align="right">Имя</td>'+
                                                  '<td><input id="vvc_name" type="text" class="VVC_REG_FORM_INPUT" value="'+me.vvcName+'"/></td>'+
                                                  '</tr>'+

                                                  '<tr>'+
                                                  '<td colspan="2" align="right">Фамилия</td>'+
                                                  '<td><input id="vvc_surname" type="text" class="VVC_REG_FORM_INPUT" value="'+me.vvcSurname+'"/></td>'+
                                                  '</tr>'+

                                                  '<tr>'+
                                                  '<td colspan="2" align="right">Регион</td>'+
                                                  '<td><select id="vvc_region" type="text" class="VVC_REG_FORM_INPUT">'+opt+'</select></td>'+
                                                  '</tr>'+

                                                  '<tr><td colspan="3">&nbsp;</td></tr><tr>'+
                                                  '<td align="left" style="text-align:left"><img width="215" height="39" src="'+VVC_DOMAIN+'/widget/img/phone2.png" alt="" style="cursor:pointer;" onclick="VVC.anotherPhone()"/></td>'+
                                                  '<td></td>'+
                                                  '<td align="right" style="text-align:right"><img width="183" height="39" src="'+VVC_DOMAIN+'/widget/img/request.png" alt="" style="cursor:pointer;" onclick="VVC.registerUser()"/></td>'+

                                                  '</tr></table>'
                                                  '</div>';
                me.focusElement('vvc_name');
    			break;
    		}
    	}
    };

    this.registerUser = function()
    {
        this.vvcName = this.VERIFY.trim(this.$('vvc_name').value);
        if(!this.vvcName.length || (/[^А-яЁё\-]/).test(this.vvcName))
        {
        	alert('Сообщите, пожалуйста, своё имя. В этом поле допустимы только русские буквы');
            this.$('vvc_name').focus(); this.$('vvc_name').select();
            return;
        }
        this.vvcSurname = this.VERIFY.trim(this.$('vvc_surname').value);
        if(!this.vvcSurname.length || (/[^А-яЁё\-]/).test(this.vvcSurname))
        {
        	alert('Сообщите, пожалуйста, свою фамилию. В этом поле допустимы только русские буквы');
            this.$('vvc_surname').focus(); this.$('vvc_surname').select();
            return;
        }
        this.send({act     : 'register',
                   name    : this.vvcName,
                   surname : this.vvcSurname,
                   region  : this.$('vvc_region').value,
                   phone   : this.VERIFY.toDigStr(this.$('vvc_phone').value)
                 });
        me.$('VVC_FORM_USER').innerHTML = '';
       	me.$('VVC_WAIT_PHONE_IMAGE').style.visibility = '';
    };

    this.onAuthUser = function()
    {
    	var pwd = me.$('vvc_pwd').value;
   	    var num = me.VERIFY.toDigStr(me.$('vvc_phone').value);
   	    me.$('VVC_FORM_USER').innerHTML = '';
    	me.$('VVC_WAIT_PHONE_IMAGE').style.visibility = '';
    	me.send({act:'auth',phone:num,pwd:pwd});
    };

    me.stopBlinkCons = false;
    this.blinkCons = function()
    {
        if(!me.stopBlinkCons)
        {
            var el = me.$('VVC_MENU_ITEM_0');
            if(!el) return;
           	el.src = VVC_DOMAIN+'/widget/img/menu_0_'+(el.src.indexOf('_0_1')>-1?'0':'1')+'.png';
            me.cons = window.setTimeout(me.blinkCons, 800);
        }
        else me.topMenu();
    };

    this.onOrderCreate = function()
    {
       	this.$('VVC_FORM_USER').innerHTML = 'Идёт создание заказа. Пожалуйста подождите';
        var g = {}, len = this.goods.length;
        for(var i=0;i<len;i++) g[i] = this.goods[i];
        this.send({act           : 'order_create',
                   w_first_pay   : this.wish_pays.first_pay,
                   w_month_count : this.wish_pays.month_count,
                   w_monthly_pay : this.wish_pays.monthly_pay,
                   aid           : this.aid,
                   shop          : VVC_SETTINGS.shop_id,
                   list          : g,
                   amount        : this.total,
                   shop_uid      : VVC_SETTINGS.user_id,
                   num           : VVC_SETTINGS.order_id});
    };

    this.onMessage = function(m)
    {
        if(typeof(m.act)=='undefined') m.act = '';
        switch(m.act)
        {
            case 'approved_by_shop':
            {
                if(m.sid==this.sid) this.send({aid:this.aid,act:'bank'});
                break;
            }
            case 'bank':
            {
                this.finalPage(m);
                break;
            }
            case 'chat':
            {
               var mf = this.$('VVC_ONLINE_CHAT');
               if(!mf)
               {
                   this.stopBlinkCons = false;
                   this.blinkCons();
                   return;
               }
               var d = m.data, s = '';
               for(var i=d.length-1;i>-1;i--)
               {
                   if(d[i].sid)
                   {
                       s += '<div style="padding:5px;"><b>'+d[i].sid+':</b> '+d[i].text+'</div>';
                   }
                   else
                   {
                       s += '<div style="padding:5px;color:#999;"><b>Вопрос:</b> '+d[i].text+'</div>';
                   }
               }
               mf.innerHTML = s;
               break;
            }
            case 'pwd_error':
            {
            	me.$('VVC_WAIT_PHONE_IMAGE').style.visibility = 'hidden';
            	alert('Пароль неверный');
            	this.onCheckPhone('user');
            	break;
            }
            case 'auth_ok':
            {
                this.aid = m.aid;
                this.onOrderCreate();
            	break;
            }
            case 'check_phone':
            {
                this.onCheckPhone(m.user,m.sms);
            	break;
            }
            case 'crush':
            {
                this.freeze();
        		this.formPane.innerHTML = '<div id="VVC_WAIT_PANE"><img width="180" height="50" src="'+VVC_DOMAIN+
   		                          '/widget/img/logo1.png" alt="" style="float:left;"/><img width="15" height="15" src="'+
   		                          VVC_DOMAIN+'/widget/img/close.png" alt="" title="Закрыть" style="float:right;cursor:pointer;" onclick="VVC.unfreeze()"/>'+
   		                          '<div id="VVC_WAIT_BTN_PANE"><div>Сожалеем, произошла ошибка идентификации магазина.</div>'+
   		                          '<div style="margin-top:10px;">Сервис недоступен до устранения интернет-магазином технической проблемы.</div></div></div>';
        	    this.formPane.style.display = 'block';
        	    this.lineUp();
                break;
            }
            case 'sid':
            {
                this.sid = m.sid;
                break;
            }
            case 'start':
            {
                this.regions = {};
                if(m.city)
                {
                    var sel = 1;
                    for(var j in m.city)
                    {
                        this.regions[j] = [m.city[j],sel];
                        sel = 0;
                    }
                }
                if(m.title) this.shop_title = m.title;
                if(m.sale_id) this.sale_id = m.sale_id;
                this.shop_comm = m.comm/100;
                if(isNaN(this.shop_comm)) this.shop_comm = 0;
                this.onStartFormLight();
                break;
            }
            case 'regerror':
            {
                this.onRegerrorForm();
                break;
            }
            case 'auth':
            {
                if(m.aid)
                {
                    this.aid = m.aid;
                    this.user = m.name;
                    this.onOrderConfirmForm();
                }
                else
                {
                    this.onLoginForm(true);
                }
                break;
            }
            case 'cancel_by_shop':
            {
                if(m.sid==this.sid) this.showForm('result','<br/><br/>Извините, требуемого товара нет в наличии<br/><br/>','Ошибка');
                break;
            }
            case 'cancel_by_bank':
            {
                if(m.sid==this.sid) this.showForm('result','<br/><br/>Извините, ни один банк-партнер системы "Всё в кредит" не дал одобрения на обслуживание Вашего заказа<br/><br/>','Ошибка');
                if(typeof(VVC_SETTINGS.response)=='function') VVC_SETTINGS.response({
                                                              user_id    : m.shop_uid,
                                                              order_id   : m.num,
                                                              vvc_status : 'cancel'});
                break;
            }
            case 'approved_by_bank':
            {
                if(typeof(VVC_SETTINGS.response)=='function') VVC_SETTINGS.response({
                                                              user_id      : m.shop_uid,
                                                              order_id     : m.num,
                                                              vvv_order_id : m.vvc_id,
                                                              vvc_status   : 'success',
                                                              vvc_bank     : m.title});
                break;
            }
            case 'app':
            {
                this.startFillApp();
                break;
            }
            case 'form':
            {
                var step = parseInt(m.html.split('name="step" value="')[1]);
                if(isNaN(step))
                {
                    this.startFillApp();
                }
                else
                {
                    var btn_prev = step==1 ? 'VVC.startFillApp()' : "VVC.send({act:'form',aid:"+this.aid+",step:"+(step-1)+"})";
                    while(m.html.indexOf('VVC_DOMAIN')>-1) m.html = m.html.replace('VVC_DOMAIN',VVC_DOMAIN);
                    this.formPane.innerHTML = '<div id="VVC_MAIM_PANE"><div id="VVC_TOP_2">'+
                                  '<img id="VVC_BTN_CLOSE" src="'+VVC_DOMAIN+'/widget/img/close.png" alt="" title="Закрыть" onclick="if(confirm(\'Прекратить оформление покупки?\'))VVC.unfreeze()"/>'+
                                  '</div><div id="VVC_STEP_PANE" style="background:url('+VVC_DOMAIN+'/widget/img/step'+step+'.png);"></div>'+

                                  '<div id="VVC_APP_FORM_PANE"><div id="VVC_APP_FORM_PANE_LEFT">'+m.html+'</div>'+

                                  '<div id="VVC_INFO_PANE_RIGHT">'+
                                  '<div id="VVC_BTN_ON_CONS" style="margin-top:20px;" onclick="VVC.onOnline()"></div><div id="VVC_BTN_ON_CALL" onclick="VVC.callOrder();"></div>'+
                                  '</div>'+

                                  '<div style="text-align:center;">'+
                                  '<img src="'+VVC_DOMAIN+'/widget/img/btn_back.png" alt="" height="52" width="88" style="margin-top:20px;margin-right:200px;cursor:pointer;" '+
                                       'onclick="VVC.VERIFY.DT.close();'+btn_prev+'"/>'+
                                  '<img src="'+VVC_DOMAIN+'/widget/img/btn_next.png" alt="" height="52" width="88" style="cursor:pointer;margin-top:20px;" '+
                                       'onclick="VVC.VERIFY.DT.close();VVC.VERIFY.verForm(VVC.$(\'VVC_APP_FORM\'));"/>'+
                                  '</div>'+

                                  '</div>'+this.banksPane()+

                                  '</div><div style="display:'+(this.cons?'inline':'none')+';" id="VVC_ONLINE">'+this.onlineCons()+'</div>';
                }
                this.lineUp();
                this.setForms();
                break;
            }
            case 'promo':
            {
                this.promo_title = m.title;
                this.onStartFormLight();
                break;
            }
            case 'promo_check':
            {
                if(m.result>0)
                {
                    alert('Ваш промо-код успешно зарегистрирован. Желаем приятной покупки со скидкой!');
                    this.onStartFormLight(true);
                }
                else
                {
                    alert('К сожалению, такой промо-код не найден. Пожалуйста, проверьте правильность введенной информации');
                    var el = this.$('VVC_PROMO_CODE');
                    if(el)
                    {
                        el.focus();
                        el.select();
                    }
                }
                break;
            }
        }
        return false;
    };

    this.setForms = function()
    {
        var value, mask, e, elements, forms = document.forms;

        for (var i = 0, c = forms.length; i < c; i++)
        {
            elements = forms[i].elements;

            for (var j = 0, l = elements.length; j < l; j++)
            {
                e = elements[j];
                mask = e.getAttribute('mask');

                switch (mask)
                {
                    case 'phone':
                    {
                        value = e.value;
                        this.maskedInput(e, '(___) - ___ - __ - __');
                        e.value = this.formatByMask(value, '(___) - ___ - __ - __');
                        break;
                    }
                    case 'passport':
                    {
                        value = e.value;
                        this.maskedInput(e, '__ __ № ______');
                        e.value = value;
                        break;
                    }
                    default:
                    {
                        break;
                    }
                }
            }
        }
    }

    this.maskedInput = function(e, f)
    {
        MaskedInput(
        {
            elm: e,
            allowed: '0123456789',
            format: f,
            separator: '\/:-. ()№'
        });
    }

    this.formatByMask = function(value, mask)
    {
        for (var i = 0, c = value.length; i < c; i++)
        {
            mask = mask.replace('_', value[i]);
        }

        return mask;
    }

    this.onStartForm = function(sf)
    {
        if(me.sale_id && me.promo_title===false)
        {
            me.send({act:'promo_info'});
            return;
        }

        me.freeze();
        if(me.aid)
        {
            me.onOrderConfirmForm();
            return;
        }

        me.formPane.style.display = 'none';

        if(me.sale_id && me.promo_title && typeof(sf)=='undefined')
        {
            me.showForm('', me.goodsList()+'<div style="margin:10px;text-align:center;">'+
                    '<b><span style="color:#F00">Внимание, акция!</span> '+me.promo_title+'</b>'+
                    '<br/><br/>Введите ваш промо-код: <input type="text" id="VVC_PROMO_CODE" class="VVC_REG_FORM_INPUT" />'+
                    '<br/><br/><a href="'+VVC_DOMAIN+'/sales/'+me.sale_id+'" target="_blank" id="VVC_LINK">Подробно об условиях акции</a>'+
                    '</div>',
                    '<div style="text-align:center;">'+
                    '<img src="'+VVC_DOMAIN+'/widget/img/btn_back.png" alt="" title="У меня нет купона с промо-кодом" height="52" width="88" style="margin-right:200px;cursor:pointer;" onclick="VVC.onStartForm(true);"/>'+
                    '<img src="'+VVC_DOMAIN+'/widget/img/btn_next.png" alt="" title="Зарегистрировать промо-код" height="52" width="88" style="cursor:pointer;" onclick="VVC.onCheckPromo();"/>'+
                    '</div>');
            return;
        }


        if(!me.CALC) me.CALC = new CCreditCalc();
        me.showForm('', me.goodsList()+me.CALC.html(me.total),
                    '<div style="text-align:center;">'+(sf===true ?
                    '<img src="'+VVC_DOMAIN+'/widget/img/btn_back.png" alt="" height="52" width="88" style="margin-right:200px;cursor:pointer;" onclick="VVC.onStartForm();"/>' :
                    '<img src="'+VVC_DOMAIN+'/widget/img/btn_back_gray.png" alt="" height="52" width="88" style="margin-right:200px;"/>')+
                    '<img src="'+VVC_DOMAIN+'/widget/img/btn_next.png" alt="" height="52" width="88" style="cursor:pointer;" onclick="VVC.storeWishPay();VVC.onAuthTypeForm();"/>'+
                    '</div>');

        if(me.wish_pays)
        {
            me.$('VVC_CALC_PAY1').value = me.formatMoney(me.wish_pays.first_pay/100);
            me.$('VVC_CALC_MONTH').value = me.wish_pays.month_count;
            me.CALC.calc();
        }
    };

    this.onCheckPromo = function()
    {
        var val = this.VERIFY.trim(this.$('VVC_PROMO_CODE').value);
        if(val) me.send({act:'promo_check',code:val});
        else
        {
            this.$('VVC_PROMO_CODE').focus();
            this.$('VVC_PROMO_CODE').value = '    ';
            this.$('VVC_PROMO_CODE').select();
        }
    };

    this.banksPane = function()
    {
        return '<div id="VVC_BANKS_PANE"><div id="VVC_BANKS_PANE_2">'+
        '<a target="_blank" href="'+VVC_DOMAIN+'/bank"><img src="'+VVC_DOMAIN+'/widget/img/banks/rs.png" alt="" height="40" style="margin-right:200px;margin-top:10px;" border="0"/></a>'+
        '<a target="_blank" href="'+VVC_DOMAIN+'/bank"><img src="'+VVC_DOMAIN+'/widget/img/banks/otp.png" alt="" height="40" style="margin-right:200px;margin-top:10px;" border="0"/></a>'+
        '<a target="_blank" href="'+VVC_DOMAIN+'/bank"><img src="'+VVC_DOMAIN+'/widget/img/banks/home.png" alt="" height="40" style="margin-top:10px;" border="0"/></a>'+
        '</div></div>';
    };

    this.startFillApp = function()
    {
        this.showForm('',this.goodsList()+
         '<div id="VVC_START_FILL_APP">Для получения кредита на покупку Вам необходимо указать некоторые сведения о себе. '+
         'Анкета заполняется один раз, впоследствие ее данные будут использоваться при любой Вашей покупке с использованием сервиса "Всё в кредит".'+
         'Если Вам удобнее сообщить эти сведения по телефону, позвоните на номер <b>+7 (495) 540-42-42</b> или '+
         '<a href="#" id="VVC_LINK" onclick="VVC.callOrder();return false;">закажите звонок</a> на свой телефон от оператора сервиса "Всё в кредит".'+
         'Дополнить или изменить свои анкетные данные Вы можете в любой момент в <a href="'+VVC_DOMAIN+'/cab" target="_blank" id="VVC_LINK">личном кабинете</a><br/><br/>'+
         '<div style="text-align:center;"><input type="checkbox" id="VVC_BUTTON_AGREEMENT"/> '+
         '<label id="VVC_BUTTON_AGREEMENT_LABEL" for="VVC_BUTTON_AGREEMENT">Я соглашаюсь с <a href="'+VVC_DOMAIN+
         '/agreement" target="_blank" id="VVC_LINK">условиями</a> по обработке данных о себе</label></div>'+
         '</div>',

         '<div style="text-align:center;">'+
         '<img src="'+VVC_DOMAIN+'/widget/img/btn_back.png" alt="" height="52" width="88" style="margin-right:200px;cursor:pointer;" onclick="if(confirm(\'Отложить заполнение анкеты?\'))VVC.send({act:\'skip_app\',aid:VVC.aid})"/>'+
         '<img src="'+VVC_DOMAIN+'/widget/img/btn_next.png" alt="" height="52" width="88" style="cursor:pointer;" '+
         'onclick="if(!VVC.$(\'VVC_BUTTON_AGREEMENT\').checked){alert(\'Необходимо ознакомиться и согласиться с условиями по обработке данных\')}else{VVC.send({act:\'form\',aid:VVC.aid})}"/>'+
         '</div>'
        );
    };

    this.onBuy = function(g,delay)
    {
        if(g && !me.tmp_goods)
        {
            me.tmp_goods = g;
            delay = parseInt(delay);
            if(isNaN(delay) || delay<1) delay = 0;
            window.setTimeout(me.onBuy,delay*100);
        }
        else if(me.tmp_goods)
        {
            me.buy(me.tmp_goods);
            me.tmp_goods = false;
        }
    };

    this.buy = function(g)
    {
        if(typeof(VVC_SETTINGS)=='undefined' || typeof(VVC_SETTINGS.shop_id)=='undefined') return this.onMessage({act:'crush'});

        if(typeof(VVC_SETTINGS.img)=='undefined')
        {
             if(!VVC_SETTINGS.css || VVC_SETTINGS.css=='red')
             {
                 VVC_SETTINGS.img = '_red';
             }
             else
             {
                 VVC_SETTINGS.img = '';
             }
        }

        VVC_SETTINGS.shop_id = parseInt(VVC_SETTINGS.shop_id);
        if(isNaN(parseInt(VVC_SETTINGS.shop_id))) return this.onMessage({act:'crush'});
        if(typeof(VVC_SETTINGS.user_id)=='undefined') VVC_SETTINGS.user_id = 0;
        if(typeof(VVC_SETTINGS.order_id)=='undefined') VVC_SETTINGS.order_id = 0;
        if(typeof(VVC_SETTINGS.response)!='function') VVC_SETTINGS.response = function(){};
        if(typeof(g)=='undefined')
        {
            this.freeze();
            this.showForm('result','Не выбрано ни одного товара','Ошибка');
            return;
        }
        this.goods = typeof(g.length)=='undefined' ? [g] : g;
        this.initSocket(this.shopInfo);
    };

    this.shopInfo = function()
    {
        var m = {act:'shop',aid:me.aid,shop_id:VVC_SETTINGS.shop_id};
        if(VVC_SETTINGS.vvc_order_id && VVC_SETTINGS.hash)
        {
            m.vvc_order_id = VVC_SETTINGS.vvc_order_id;
            m.hash = VVC_SETTINGS.hash;
        }
        me.send(m);
    };

    this.storeWishPay = function()
    {
        if(!this.wish_pays) this.wish_pays = {};
        if(this.$('VVC_CALC_PAY1'))
        {
            this.wish_pays.first_pay   = parseInt(this.$('VVC_CALC_PAY1').value * 100);
            this.wish_pays.month_count = parseInt(this.$('VVC_CALC_MONTH').value);
            this.wish_pays.monthly_pay = parseInt(this.$('VVC_CALC_PAY2').innerHTML * 100);
        }
    };

    this.onAuthTypeForm = function()
    {
        me.freeze();
        if(me.aid)
        {
            me.onOrderConfirmForm();
            return;
        }
        me.showForm('', me.goodsList(),
                    '<div style="text-align:center;">'+
                    '<div style="margin-bottom:25px;"><img src="'+VVC_DOMAIN+'/widget/img/btn_reg.png" alt="" height="39" width="433" style="cursor:pointer;margin-top:30px;" onclick="VVC.onRegForm()"/></div>'+
                    '<div style="margin-bottom:25px;"><img src="'+VVC_DOMAIN+'/widget/img/btn_log.png" alt="" height="39" width="433" style="cursor:pointer;" onclick="VVC.onLoginForm()"/></div>'+
                    '<div><img src="'+VVC_DOMAIN+'/widget/img/btn_back.png" alt="" height="52" width="88" style="cursor:pointer;" onclick="VVC.onStartForm()"/></div>'+
                    '</div>');

    };

    this.onLoginForm = function(err)
    {
        this.showForm('', this.goodsList()+'<br/>'+
        '<form action="#" id="VVC_LOGIN_FORM" onsubmit="return VVC.login(this)">'+
        '<table width="99%" cellspacing="0" cellpadding="0" id="VVC_REG_FORM_TABLE">'+
        '<tr><td id="VVC_REG_FORM_TABLE_TD_LABEL" width="50%">Телефон</td>'+
        '<td width="50%" id="VVC_REG_FORM_TABLE_TD"><input type="text" class="VVC_REG_FORM_INPUT" name="phone" id="vvc_phone" maxlength="19" value="(___) ___ - __ - __"/></td></tr>'+
        '<tr><td id="VVC_REG_FORM_TABLE_TD_LABEL" width="50%">Пароль</td>'+
        '<td width="50%" id="VVC_REG_FORM_TABLE_TD"><input type="password" class="VVC_REG_FORM_INPUT" name="pwd"/></td></tr>'+
        '</table></form>'+(err ? '<div id="VVC_REG_FORM_ERR">Неверная пара телефон/пароль</div>' : ''),
        '<div style="text-align:center;">'+
        '<div style="margin-bottom:20px;"><a href="'+VVC_DOMAIN+'/cab/pass" id="VVC_LINK" target="_blank" title="Форма напоминания пароля. Откроется в новом окне">Забыли пароль, или он не пришел по SMS или на e-mail?</a></div>'+
        '<img src="'+VVC_DOMAIN+'/widget/img/btn_back.png" alt="" height="52" width="88" style="margin-right:200px;cursor:pointer;" onclick="VVC.onAuthTypeForm();"/>'+
        '<img src="'+VVC_DOMAIN+'/widget/img/btn_next.png" alt="" height="52" width="88" style="cursor:pointer;" onclick="VVC.login(VVC.$(\'VVC_LOGIN_FORM\'))"/>'+
        '</div>'
        );

        MaskedInput(
        {
            elm: document.getElementById('vvc_phone'),
            allowed: '0123456789',
            format: '(___) - ___ - __ - __',
            separator: '\/:-. ()'
        });

        window.setTimeout(function(){me.$('vvc_phone').focus(); me.VERIFY.setCaretPosition(me.$('vvc_phone'), 1);},100);
    };

    this.login = function(f)
    {
        this.send({act:'login',phone:this.VERIFY.toDigStr(f.phone.value),pwd:f.pwd.value});
        this.showForm('wait','Идет проверка учетной записи');
        return false;
    };

    this.onRegForm = function(err,fio,phone,email)
    {
        err = err ? '<div id="VVC_REG_FORM_ERR">'+err+'</div>' :
                    '<div id="VVC_REG_FORM_NOTE">Для создания учетной записи заполните все поля формы:</div>';
        fio = fio ? fio : '';
        phone = phone ? phone : '(___) ___ - __ - __';
        email = email ? email : '';

        this.showForm('',

        this.goodsList()+'<form action="/" id="VVC_REG_FORM" onsubmit="return VVC.reg(this)">'+err+'<table width="99%" cellspacing="0" cellpadding="0" id="VVC_REG_FORM_TABLE">'+
        '<tr><td id="VVC_REG_FORM_TABLE_TD_LABEL" width="50%">Имя и фамилия</td>'+
        '<td width="50%" id="VVC_REG_FORM_TABLE_TD"><input type="text" class="VVC_REG_FORM_INPUT" id="vvc_fio" name="title" value="'+fio+'"/></td></tr>'+
        '<tr><td id="VVC_REG_FORM_TABLE_TD_LABEL" width="50%">Мобильный телефон</td>'+
        '<td width="50%" id="VVC_REG_FORM_TABLE_TD"><input type="text" class="VVC_REG_FORM_INPUT" name="phone" id="vvc_phone_input" maxlength="19" value="'+phone+'"/></td></tr>'+
        '<tr><td id="VVC_REG_FORM_TABLE_TD_LABEL">Электронная почта</td>'+
        '<td width="50%" id="VVC_REG_FORM_TABLE_TD"><input type="text" class="VVC_REG_FORM_INPUT" name="email" value="'+email+'"/></td></tr>'+
        '</table></form>',
        '<div style="text-align:center;">'+
        '<img src="'+VVC_DOMAIN+'/widget/img/btn_back.png" alt="" height="52" width="88" style="margin-right:200px;cursor:pointer;margin-top:10px;" onclick="VVC.onAuthTypeForm();"/>'+
        '<img src="'+VVC_DOMAIN+'/widget/img/btn_next.png" alt="" height="52" width="88" style="cursor:pointer;margin-top:10px;" onclick="VVC.reg(VVC.$(\'VVC_REG_FORM\'))"/>'+
        '</div>'
        );

        var phoneInput = document.getElementById('vvc_phone_input');

        MaskedInput(
        {
            elm: phoneInput,
            allowed: '0123456789',
            format: '(___) ___ - __ - __',
            separator: '\/:-. ()'
        });

        phoneInput.value = phone;

        window.setTimeout(function(){me.$('vvc_fio').focus()},100);
        return false;
    };

    this.onRegerrorForm = function()
    {
        me.showForm('',
        '<div id="VVC_REG_ERROR_PANE">Учётная запись с таким номером телефона и/или адресом электронной почты уже существует.<br/><br/>'+
        'Вам необходимо осуществить <a href="#" id="VVC_LINK" onclick="VVC.onLoginForm();return false;">вход в систему</a> '+
        ' с этими учетными данными, используя пароль к ним. <br/><br/>'+
        'Если вы не помните пароль, воспользуйтесь <a href="'+VVC_DOMAIN+'/cab/pass" id="VVC_LINK" target="_blank" title="Форма напоминания пароля. Откроется в новом окне">'+
        'формой его напоминания</a><br/><br/>Если вы просто ошиблись при вводе телефона или e-mail, нажмите "Вперед", чтобы повторить регистрацию<br/><br/></div>',
        '<div style="text-align:center;">'+
        '<img src="'+VVC_DOMAIN+'/widget/img/btn_back.png" alt="" height="52" width="88" style="margin-right:200px;cursor:pointer;margin-top:10px;" onclick="VVC.onRegForm();"/>'+
        '<img src="'+VVC_DOMAIN+'/widget/img/btn_next.png" alt="" height="52" width="88" style="cursor:pointer;margin-top:10px;" onclick="VVC.onRegForm();"/>'+
        '</div>'
        );
    };

    this.reg = function(f)
    {
        var fio = this.VERIFY.trim(f.title.value);
        if(!fio.length) return this.onRegForm('Укажите ваши имя и фамилию','',f.phone.value,f.email.value);
        var e = fio.split(' '), len = e.length;
        fio = '';
        for(var i=0;i<len;i++)
        {
            e[i] = this.VERIFY.trim(e[i]);
            fio += (fio.length ? ' ' : '') + (e[i].length ? e[i] : '');
        }
        e = fio.split(' '), len = e.length;
        for(var i=0;i<len;i++)
        {
            if(!this.VERIFY.verify(e[i],'rus')) return this.onRegForm('В имени и фамилии допустимы только русские буквы',fio,f.phone.value,f.email.value);
        }
        if(!this.VERIFY.verify(f.phone.value,'phone')) return this.onRegForm('Укажите номер вашего мобильного телефона',fio,f.phone.value,f.email.value);
        if(!this.VERIFY.verify(f.email.value,'email')) return this.onRegForm('Укажите адрес вашей электронной почты',fio,f.phone.value,f.email.value);

        this.send({act:'reg', title : this.VERIFY.trim(f.title.value),
                   phone            : this.VERIFY.toDigStr(f.phone.value),
                   email            : (this.VERIFY.trim(f.email.value)).toLowerCase() });
        this.showForm('wait','Идет создание учетной записи');
        return false;
    };

    this.submitData = function(d)
    {
        d.act = 'form';
        d.aid = this.aid;
        this.send(d);
    };

    this.onOrderConfirmForm = function()
    {
        this.showForm('', this.goodsList()+'<div id="VVC_HELLO">Здравствуйте, '+this.user+'!<br/><br/>'+
        'Пожалуйста, подождите, пока система не завершит проверку Вашего заказа.<br/><br/>'+
        '<img width="50" height="50" src="'+VVC_DOMAIN+'/widget/img/load.png"/><br/><br/>'+
        'Это займет не более 1 минуты.'+
        '</div>');

       	var g = {}, len = this.goods.length;
        for(var i=0;i<len;i++) g[i] = this.goods[i];
        this.send({act           : 'order_create',
                   w_first_pay   : this.wish_pays.first_pay,
                   w_month_count : this.wish_pays.month_count,
                   w_monthly_pay : this.wish_pays.monthly_pay,
                   aid           : this.aid,
                   shop          : VVC_SETTINGS.shop_id,
                   list          : g,
                   amount        : this.total,
                   shop_uid      : VVC_SETTINGS.user_id,
                   num           : VVC_SETTINGS.order_id});

    };

    this.send = function(m)
    {
        if(this.socket) this.socket.json.send(m);
    };

    this.$ = function(id)
    {
        return document.getElementById(id);
    };

    this.goodsList = function()
    {
        var g = me.goods;
        var len = g.length, num = 0, odd;
        var lst = '';
        me.total = 0;
        for(var i=0;i<len;i++)
        {
            odd = num%2 ? 'C4C5C5' : 'B1B2B2';
            if(typeof(g[i].amount)=='undefined' || g[i].amount*100<1) continue;
            if(typeof(g[i].title)=='undefined' || !g[i].title) g[i].title = 'Без названия';
            if(typeof(g[i].count)=='undefined') g[i].count = 1;
            me.total += g[i].amount * g[i].count;
            num++;
            lst += '<tr><td width="10%" id="VVC_GOODS_TABLE_TD" style="background:#'+odd+';">'+num+'</td>'+
            '<td width="50%" id="VVC_GOODS_TABLE_TD_LEFT" style="background:#'+odd+';">'+g[i].title+'</td>'+
            '<td width="20%" id="VVC_GOODS_TABLE_TD" style="background:#'+odd+';">'+g[i].count+'</td>'+
            '<td width="20%" id="VVC_GOODS_TABLE_TD" style="background:#'+odd+';">'+me.formatMoney(g[i].amount)+'</td></tr>';
        }
        if(num==0)
        {
            me.showForm('result','Не выбрано ни одного товара','Ошибка');
            return false;
        }

        me.total += me.total*me.shop_comm/100;
        me.total = parseInt(me.total*100)/100;
        comm = me.shop_comm!=0 ? ' с учётом комиссии магазина '+me.shop_comm+'% ' : '';

        return '<div style="width:753px;"><table id="VVC_GOODS_TABLE_HEAD" width="100%" cellspacing="0" cellpadding="0"><tr>'+
               '<td width="10%" id="VVC_GOODS_TABLE_TD_HEAD">№</td>'+
               '<td width="50%" id="VVC_GOODS_TABLE_TD_HEAD_LEFT"><i>Название</i></td>'+
               '<td width="20%" id="VVC_GOODS_TABLE_TD_HEAD"><i>Количество</i></td>'+
               '<td width="20%" id="VVC_GOODS_TABLE_TD_HEAD"><i>Цена, руб.</i></td>'+
               '</tr></table>'+

               '<div id="VVC_GOODS_TABLE_SCROLL"><table width="100%" cellspacing="0" cellpadding="0" id="VVC_GOODS_TABLE">'+lst+'</table></div>'+

               '<table width="100%" cellspacing="0" cellpadding="0" id="VVC_GOODS_TABLE_FOOT"><tr>'+
               '<td width="70%" id="VVC_GOODS_TABLE_FOOT_TD_RIGHT">Итого'+comm+':</td>'+
               '<td width="30%" id="VVC_GOODS_TABLE_FOOT_TD">'+me.formatMoney(me.total)+'</td></tr></table></div>';
    };

    this.formatMoney = function(s)
    {
        var am = parseInt(s*100)/100 - parseInt(s);
        if(am==0) am = parseInt(s) + '.00';
        else
        {
            am = parseInt(am*100) - parseInt(am*10)*10;
            am = am==0 ? s + '0' : s;
        }
        return am;
    };

    this.freeze = function()
    {
        if(!this.freezePane)
        {
            var f = document.createElement('DIV');
            f.id = 'VVC_FREEZE';
            f.style.display      = 'none';
            f.style.zIndex       = 9998;
            f.style.position     = 'absolute';
            f.style.filter       = 'alpha(opacity=50)';
            f.style.MozOpacity   = 0.5;
            f.style.KhtmlOpacity = 0.5;
            f.style.opacity      = 0.5;
            f.style.top          = '0px';
            f.style.left         = '0px';
            f.style.margin       = '0px';
            f.style.width        = '100%';
            f.style.height       = '100%';
            f.style.top          = '0px';
            f.style.left         = '0px';
            f.style.background   = '#000';
            document.body.appendChild(f);
            this.freezePane = f;
            if(!this.formPane)
            {
                f = document.createElement('DIV');
                f.style.display      = 'none';
                f.style.zIndex       = 9999;
                f.style.padding      = '10px';
                f.style.position     = 'absolute';
                document.body.appendChild(f);
                this.formPane = f;
            }
            if(window.addEventListener)
            {
                window.addEventListener('resize',this.lineUp,false);
                window.addEventListener('scroll',this.lineUp,false);
            }
            else if(window.attachEvent)
            {
                window.attachEvent('onresize',this.lineUp);
                window.attachEvent('onscroll',this.lineUp);
            }
            else
            {
                window.onresize = this.lineUp;
                window.onscroll = this.lineUp;
            }
        }
        this.freezePane.style.display = 'block';
        this.lineUp();
    };

    this.lineUp = function()
    {
        if(me.freezePane && me.freezePane.style.display!='none')
        {
            me.freezePane.style.display = 'none';
            var d = me.pageSize();
            me.freezePane.style.width = d.width+'px';
            me.freezePane.style.height = d.height+'px';
            me.freezePane.style.display = 'block';
            if(me.formPane && me.formPane.style.display!='none')
            {
                me.formPane.style.left = parseInt((d.windowWidth - me.formPane.offsetWidth)/2 + d.scrollLeft) + 'px';
                me.formPane.style.top = parseInt((d.windowHeight - me.formPane.offsetHeight)/2 + d.scrollTop) + 'px';
            }
        }
    };

    this.pageSize = function()
    {
       var xScroll, yScroll;

       if (window.innerHeight && window.scrollMaxY) {
               xScroll = document.body.scrollWidth;
               yScroll = window.innerHeight + window.scrollMaxY;
       } else if (document.body.scrollHeight > document.body.offsetHeight){
               xScroll = document.body.scrollWidth;
               yScroll = document.body.scrollHeight;
       } else if (document.documentElement && document.documentElement.scrollHeight > document.documentElement.offsetHeight){
               xScroll = document.documentElement.scrollWidth;
               yScroll = document.documentElement.scrollHeight;
       } else {
               xScroll = document.body.offsetWidth;
               yScroll = document.body.offsetHeight;
       }

       var windowWidth, windowHeight;
       if (self.innerHeight) {
               windowWidth = self.innerWidth;
               windowHeight = self.innerHeight;
       } else if (document.documentElement && document.documentElement.clientHeight) {
               windowWidth = document.documentElement.clientWidth;
               windowHeight = document.documentElement.clientHeight;
       } else if (document.body) {
               windowWidth = document.body.clientWidth;
               windowHeight = document.body.clientHeight;
       }

       if(yScroll < windowHeight){
               pageHeight = windowHeight;
       } else {
               pageHeight = yScroll;
       }

       if(xScroll < windowWidth){
               pageWidth = windowWidth;
       } else {
               pageWidth = xScroll;
       }

       var de = document.documentElement;
       var clientHeight = self.innerHeight || ( de && de.clientHeight ) || document.body.clientHeight;
       var clientWidth = self.innerWidth || ( de && de.clientWidth ) || document.body.clientWidth;

       var st = document.documentElement.scrollTop || document.body.scrollTop;
       var sl = document.documentElement.scrollLeft || document.body.scrollLeft;

       return {width       : pageWidth  , height       : pageHeight  ,
               clientWidth : clientWidth, clientHeight : clientHeight,
               windowWidth : windowWidth, windowHeight : windowHeight,
               scrollTop   : st         , scrollLeft   : sl};
    };

    this.unfreeze = function()
    {
        if(this.freezePane)
        {
            this.send({'act':'logout'});
            this.aid = false;
            this.wish_pays = {};
            this.topMenuList = [0,0,1];
            this.freezePane.style.display = 'none';
            this.formPane.style.display = 'none';
        }
    };

    this.showForm = function(tp,msg,btn)
    {
        if(!this.formPane) return;
        tp = tp ? tp : '';
        msg = msg ? msg : '';
        btn = btn ? btn : '';
        switch(tp)
        {
            case 'wait':
            {
                msg = '<div id="VVC_WAIT_PANE"><div id="VVC_WAIT_BTN_PANE"><img width="50" height="50" src="'+VVC_DOMAIN+'/widget/img/load.png" alt=""/></div>'+msg+'</div>';
                break;
            }
            case 'result': case 'message':
            {
                msg = '<div id="VVC_MESSAGE_PANE">'+msg+'</div>';
                break;
            }
            default:
            {
                msg = '<div id="VVC_INFO_PANE"><div id="VVC_INFO_PANE_LEFT">'+msg+'</div><div id="VVC_INFO_PANE_RIGHT">'+
                      '<div id="VVC_BTN_ON_CONS" onclick="VVC.onOnline()"></div><div id="VVC_BTN_ON_CALL" onclick="VVC.callOrder();"></div>'+
                      '</div>'+btn+'</div>';
                break;
            }
        }

        this.formPane.innerHTML = '<div id="VVC_MAIM_PANE"><div id="VVC_TOP_1"><img id="VVC_BTN_CLOSE" src="'+VVC_DOMAIN+
                                  '/widget/img/close.png" alt="" title="Закрыть" onclick="if(confirm(\'Прекратить оформление покупки?\'))VVC.unfreeze()"/>'+
                                  '</div>'+ msg + this.banksPane() + '</div><div style="display:'+(this.cons?'inline':'none')+';" id="VVC_ONLINE">'+this.onlineCons()+'</div>';

        if(this.cons) this.send({act:'chat'});
        this.formPane.style.display = 'block';
        this.lineUp();
    };

    this.onOnline = function()
    {
        return;
        if(!this.socket)
        {
            this.cons = false;
            this.$('VVC_ONLINE').innerHTML = '';
            this.$('VVC_ONLINE').style.display = 'none';
            return;
        }
        this.cons = !this.cons;
        this.$('VVC_ONLINE').innerHTML = this.onlineCons();
        if(this.cons)
        {
            this.send({act:'chat'});
            this.$('VVC_ONLINE').style.display = 'inline';
        }
        else
        {
            this.$('VVC_ONLINE').style.display = 'none';
        }
        this.lineUp();
    };

    this.chat = function(ev)
    {
        if(typeof(ev)!='undefined')
        {
            if(!ev.ctrlKey || ev.keyCode!=13) return;
        }
        var mf = this.$('VVC_ONLINE_CHAT_MESSAGE');
        if(!mf) return;
        var mess = this.VERIFY.trim(this.VERIFY.stripTags(mf.value));
        if(mess) this.send({act:'chat',text:mess});
        mf.value = '';
    };

    this.callOrder = function()
    {
        if(!me.aid)
        {
            alert('Чтобы заказать звонок, необходимо авторизоваться или зарегистрироваться. '+
                  'Пройдите, пожалуйста, необходимые для этого шаги, или воспользуйтесь онлайн-консультантом, задав вопрос в текстовом виде');
            if(!this.cons) this.onOnline();
            return;
        }
        if(confirm('На указанный Вами номер телефона в ближайшее время поступит звонок консультанта. Заказать звонок?'))
        {
            this.send({act:'call',aid:this.aid});
            alert('Спасибо! Заказ звонка принят.');
        }
    };

/////////////////////////////////////////////////
/////////////////////////////////////////////////
/////////////////////////////////////////////////
    this.initButtons = function()
    {
        if(!document.body)
        {
            window.setTimeout(me.initButtons,100);
            return;
        }

        if(typeof(VVC_SETTINGS.img)=='undefined')
        {
             if(!VVC_SETTINGS.css || VVC_SETTINGS.css=='red')
             {
                 VVC_SETTINGS.img = '_red';
             }
             else
             {
                 VVC_SETTINGS.img = '';
             }
        }

        var el = document.body.getElementsByTagName('DIV');
        var len = el.length;
        for(var i=0;i<len;i++)
        {
            var e = el[i];
            if(!e.id || e.id.indexOf('VVC_BUTTON_')<0 || e.style.display!='none') continue;
            try{eval('var arg = '+e.innerHTML)}catch(er){continue;}
            if(typeof(arg.length)=='undefined') arg = [arg];
            var a = 0, total_amount = 0;
            for(var j=0;j<arg.length;j++)
            {
                if(typeof(arg[j].amount)=='undefined') continue;
                if(typeof(arg[j].count)=='undefined') arg[j].count=1;
                var p = parseInt(arg[j].amount*100*arg[j].count);
                if(isNaN(p)) continue;
                a += p;
                total_amount += arg[j].amount;
            }
            VVC.CS[e.id] = arg;
            a = parseInt(a/2400);
            if(a==0) continue;

            if(e.id.indexOf('_IMAGE')>0)
            {
                e.innerHTML = '<img src="'+e.title+'" border="0" style="cursor:pointer" onclick="VVC.buy(VVC.CS[\''+e.id+'\'])"/>';
                e.title = 'Купить в кредит от '+a+' рублей в месяц';
                e.style.display = '';
                continue;
            }

            var btnColor = VVC_SETTINGS.color, btnStyle = 1, btnRound = e.id.indexOf('_ROUND')>0 ? 'r' : '';
            for(var j=0;j<me.styleList.length;j++)
            {
                if(e.id.indexOf('_COLOR'+me.styleList[j].toUpperCase())>0) btnColor = me.styleList[j];
            }
            for(var j=1;j<=me.stylesCount;j++)
            {
                if(e.id.indexOf('_STYLE'+j)>0) btnStyle = j;
            }

            e.className = 'vvc_site_button_'+btnStyle;
            e.style.background = 'url('+VVC_DOMAIN+'/widget/'+btnColor+'/'+btnStyle+''+btnRound+'.gif)';

            switch(btnStyle)
            {
                case 1: default:
                {
                    if(e.id.indexOf('_COUNT')>0)
                    {
                        e.innerHTML = '<div style="height:5px;overflow:hidden;">&nbsp;</div><div style="font-size:12px;height:22px;overflow:hidden;">'+
                        '<input type="text" maxlength="3" id="'+e.id+'_count" class="vvc_site_input" value="1" onclick="this.select()" onkeyup="'+
                        'if(isNaN(parseInt(this.value))||parseInt(this.value)<0)this.value=1;VVC.$(\''+e.id+'_price\').innerHTML=parseInt(this.value*'+total_amount+'/24)"/>'+
                        ' шт. от <span id="'+e.id+'_price">'+a+'</span> р/мес</div>'+
                        (e.id.indexOf('_NOCLICK')>0 ? '' :
                        '<div style="height:73px;cursor:pointer;" onclick="var p=parseInt(VVC.$(\''+e.id+'_count\').value);if(isNaN(p)||p<1)p=1;VVC.$(\''+
                        e.id+'_count\').value=p;VVC.CS.'+e.id+'[0].count=p;VVC.buy(VVC.CS.'+e.id+')"></div>');
                    }
                    else
                    {
                        e.style.textAlign = 'center';
                        if(e.id.indexOf('_NOCLICK')<0)
                        {
                            e.style.cursor = 'pointer';
                            e.onclick = function(){ VVC.buy( VVC.CS[this.id]) };
                        }
                        e.innerHTML = '<div style="padding-top:3px;width:99%;overflow:hidden;text-align:center;">от '+a+' р/мес</div>';
                    }
                    break;
                }
                case 2:
                {
                    if(e.id.indexOf('_COUNT')>0)
                    {
                        e.innerHTML =
                        (e.id.indexOf('_NOCLICK')>0 ?  '<div style="height:38px;">&nbsp;</div>' :
                        '<div style="height:38px;overflow:hidden;cursor:pointer;" onclick="var p=parseInt(VVC.$(\''+e.id+'_count\').value);if(isNaN(p)||p<1)p=1;VVC.$(\''+
                        e.id+'_count\').value=p;VVC.CS.'+e.id+'[0].count=p;VVC.buy(VVC.CS.'+e.id+')">&nbsp;</div>')+

                        '<div style="font-size:12px;height:22px;overflow:hidden;">'+
                        '<input type="text" maxlength="3" id="'+e.id+'_count" class="vvc_site_input" value="1" onclick="this.select()" onkeyup="'+
                        'if(isNaN(parseInt(this.value))||parseInt(this.value)<0)this.value=1;VVC.$(\''+e.id+'_price\').innerHTML=parseInt(this.value*'+total_amount+'/24)"/>'+
                        ' шт. от <span id="'+e.id+'_price">'+a+'</span> р/мес</div>'+

                        (e.id.indexOf('_NOCLICK')>0 ? '' :
                        '<div style="height:40px;cursor:pointer;" onclick="var p=parseInt(VVC.$(\''+e.id+'_count\').value);if(isNaN(p)||p<1)p=1;VVC.$(\''+
                        e.id+'_count\').value=p;VVC.CS.'+e.id+'[0].count=p;VVC.buy(VVC.CS.'+e.id+')"></div>');
                    }
                    else
                    {
                        e.style.textAlign = 'center';
                        if(e.id.indexOf('_NOCLICK')<0)
                        {
                            e.style.cursor = 'pointer';
                            e.onclick = function(){ VVC.buy( VVC.CS[this.id]) };
                        }
                        e.innerHTML = '<div style="padding-top:35px;width:99%;overflow:hidden;text-align:center;">от '+a+' р/мес</div>';
                    }
                    break;
                }
                case 3:
                {
                    if(e.id.indexOf('_COUNT')>0)
                    {
                        e.innerHTML =
                         (e.id.indexOf('_NOCLICK')>0 ? '<div style="height:60px;">&nbsp;</div>' :
                        '<div style="height:60px;overflow:hidden;cursor:pointer;" onclick="var p=parseInt(VVC.$(\''+e.id+'_count\').value);if(isNaN(p)||p<1)p=1;VVC.$(\''+
                        e.id+'_count\').value=p;VVC.CS.'+e.id+'[0].count=p;VVC.buy(VVC.CS.'+e.id+')">&nbsp;</div>')+

                        '<div style="font-size:16px;height:40px;overflow:hidden;">'+
                        '<input type="text" maxlength="3" id="'+e.id+'_count" class="vvc_site_input" value="1" onclick="this.select()" onkeyup="'+
                        'if(isNaN(parseInt(this.value))||parseInt(this.value)<0)this.value=1;VVC.$(\''+e.id+'_price\').innerHTML=parseInt(this.value*'+total_amount+'/24)"/>'+
                        ' шт. от <span id="'+e.id+'_price">'+a+'</span> р/мес</div>';
                    }
                    else
                    {
                        e.style.textAlign = 'center';
                        if(e.id.indexOf('_NOCLICK')<0)
                        {
                            e.style.cursor = 'pointer';
                            e.onclick = function(){ VVC.buy( VVC.CS[this.id]) };
                        }
                        e.innerHTML = '<div style="padding-top:50px;width:99%;overflow:hidden;text-align:center;">от '+a+' р/мес</div>';
                    }
                    break;
                }
                case 4: case 5:
                {
                    if(e.id.indexOf('_COUNT')>0)
                    {
                        e.innerHTML = '<div style="margin-left:10px;padding-top:9px;overflow:hidden;text-align:center;width:195px;height:20px;font-size:16px;float:left;">'+
                        '<input type="text" maxlength="3" id="'+e.id+'_count" class="vvc_site_input" value="1" onclick="this.select()" onkeyup="'+
                        'if(isNaN(parseInt(this.value))||parseInt(this.value)<0)this.value=1;VVC.$(\''+e.id+'_price\').innerHTML=parseInt(this.value*'+total_amount+'/24)"/>'+
                        ' шт. от <span id="'+e.id+'_price">'+a+'</span> р/мес</div>'+
                         (e.id.indexOf('_NOCLICK')>0 ? '' :
                        '<div style="cursor:pointer;float:left;height:40px;width:150px;" onclick="var p=parseInt(VVC.$(\''+e.id+
                        '_count\').value);if(isNaN(p)||p<1)p=1;VVC.$(\''+e.id+'_count\').value=p;VVC.CS.'+e.id+'[0].count=p;VVC.buy(VVC.CS.'+e.id+')"></div>');
                    }
                    else
                    {
                        e.style.cursor = 'pointer';
                        if(e.id.indexOf('_NOCLICK')<0)
                        {
                            e.style.cursor = 'pointer';
                            e.onclick = function(){ VVC.buy( VVC.CS[this.id]) };
                        }
                        e.innerHTML = '<div style="margin-left:10px;padding-top:8px;overflow:hidden;text-align:left;width:195px;height:20px;">В кредит от '+a+' р/мес</div>';
                    }
                    break;
                }
            }
            e.style.display = '';
        }
        if(me.iter>0)
        {
            window.setTimeout(me.initButtons,(6-me.iter)*100);
            me.iter--;
        }
    };

    this.VERIFY = new VVCVerify();
    this.iter = 5;
    this.CS = {};
    this.initButtons();
};


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function VVCDtPicker()
{
    this.minYear = 1935;
    this.y, this.m, this.d, this.w, this.el, this.pane = false, this.ms = false;

    this.monthSelect = document.createElement('SELECT');
    this.yearSelect = document.createElement('SELECT');
    this.daySelect = document.createElement('DIV');

    var me = this;

    this.offsetPosition = function(el)
    {
        var oL=0, oT=0, w=el.offsetWidth, h=el.offsetHeight;
        do {oL += el.offsetLeft; oT += el.offsetTop;} while (el = el.offsetParent);
        return {left:oL, top:oT, width:w, height:h};
    };

    this.addZero = function(s)
    {
        s = parseInt(s);
        if(s<10) s = '0'+s;
        return s;
    };

    this.yearOptions = function(options)
    {
        var s, minYear, maxYear;

        if (options)
        {
            if (options.minYear !== undefined) minYear = options.minYear;
            else minYear = this.minYear;

            if (options.maxYear !== undefined) maxYear = options.maxYear;
            else maxYear = (new Date()).getFullYear();
        }
        else
        {
            minYear = this.minYear;
            maxYear = (new Date()).getFullYear();
        }

        this.yearSelect.style.fontSize = '12px';
        this.yearSelect.style.marginLeft = '15px';

        for(var i=this.minYear;i<=maxYear;i++)
        {
            s = document.createElement('OPTION');
            s.value = i;
            s.innerHTML = i;
            s.selected = (this.y==i);
            this.yearSelect.appendChild(s);
        }
    };

    this.monthOptions = function()
    {
        this.monthSelect.style.float = 'left';
        this.monthSelect.style.fontSize = '12px';
        var s, mn = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
        for(var i=0;i<12;i++)
        {
            s = document.createElement('OPTION');
            s.value = i;
            s.innerHTML = mn[i];
            s.selected = (this.m==i);
            this.monthSelect.appendChild(s);
        }
    };

    this.changeMonth = function()
    {
        this.m = this.monthSelect.value;
        this.rander(false);
    };

    this.changeYear = function()
    {
        this.y = this.yearSelect.value;
        this.rander(false);
    };

    this.init = function(el,timeMode,options)
    {
        if(this.pane && this.pane.style.display!='none' && this.el===el)
        {
            this.pane.style.display = 'none';
            return;
        }

        this.el = el;
        el.style.cursor = 'pointer';
        var now = new Date();

        var e = el.value.split('.');
        if(e[0].indexOf('0')==0) e[0] = e[0].replace('0','');
        e[0] = parseInt(e[0]); if(isNaN(e[0])) e[0] = now.getDate();
        if(typeof(e[1])=='undefined') e[1] = now.getMonth(); else
        {
            if(e[1]!='10') e[1] = e[1].replace('0','');
            e[1] -= 1;
        }
        if(typeof(e[2])=='undefined' || isNaN(parseInt(e[2]))) e[2] = now.getFullYear();
        if(e[2]<this.minYear) e[2] = this.minYear;
        if(e[2]>now.getFullYear()) e[2] = now.getFullYear();

        try{var d = new Date(e[2],e[1],e[0]);}catch(e){var d = new Date()}
        this.y = d.getFullYear();
        this.m = d.getMonth();
        this.w = d.getDay();
        this.d = d.getDate();

        el.value = this.addZero(this.d)+'.'+this.addZero(this.m+1)+'.'+this.y;

        if(!this.pane)
        {
            var f = document.createElement('DIV');
            f.style.display      = 'none';
            f.style.zIndex       = 10000;
            f.style.position     = 'absolute';
            f.style.background   = '#FFF';
            f.style.border       = '#030 1px solid';
            f.style.padding      = '3px';
            f.style.width        = '180px';

            var f2 = document.createElement('DIV');
            f2.style.textAlign = 'right';
            f2.style.fontSize = '12px';
            f2.style.padding = '3px';

            this.monthOptions();
            this.yearOptions(options);
            this.daySelect.innerHTML = this.rander(true);

            f2.appendChild(this.monthSelect);
            f2.appendChild(this.yearSelect);

            f.appendChild(f2);
            f.appendChild(this.daySelect);

            this.monthSelect.onchange = function(){me.changeMonth()};
            this.monthSelect.onkeyup = function(){me.changeMonth()};
            this.yearSelect.onchange = function(){me.changeYear()};
            this.yearSelect.onkeyup = function(){me.changeYear()};

            document.body.appendChild(f);
            this.pane = f;
        }
        else
        {
            this.monthSelect.value = this.m;
            this.yearSelect.value = this.y;
            this.rander();
        }

        var pos = this.offsetPosition(el);
        this.pane.style.top = pos.top + pos.height + 1 + 'px';
        this.pane.style.left = pos.left - 188 + pos.width + 'px';
        this.pane.style.display = 'block';
    };

    this.close = function()
    {
        if(this.pane && this.pane.style.display!='none')
        {
            this.pane.style.display = 'none';
        }
    };

    this.rander = function(ret)
    {
        if(ret===false)
        {
            if(this.d>28)
            {
                var maxDay = this.getLastMonthDay();
                if(this.d>maxDay)
                {
                    this.d = maxDay;
                }
            }
            this.w = (new Date(this.y,this.m,this.d)).getDay();
        }

        var s = '<table style="font-size:12px;" width="100%" cellspacing="1" cellpadding="1">';
        if(!this.ms)
        {
            var dd = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
            s += '<tr style="background:#060;color:#FFF;">';
            for(var i=0;i<7;i++) s += '<td width="14%" align="center" '+(i>4?'style="background:#F60"':'')+'>'+dd[i]+'</td>';
            s += '</tr>';
            this.ms = s;
        }
        else s = this.ms;

        var maxDay = this.getLastMonthDay();
        var e = this.el.value.split('.');
        if(e[1]!=10) e[1] = e[1].replace('0','');
        var curM = parseInt(e[1]) - 1;
        var curY = parseInt(e[2]);
        var now = new Date();

        for(var n=0;n<6;n++)
        {
            var ns = this.getWeekMonday(n);
            var bg = n%2 ? '#EEE' : '#DDD';
            if(ns>maxDay) break;
            s += "\n"+'<tr>';
            for(var i=ns;i<ns+7;i++)
            {
                if(i<1 || i>maxDay)
                {
                    s += '<td style="background:'+bg+'"></td>';
                }
                else
                {
                    if(i==this.d && this.m==curM && this.y==curY)
                        s += '<td align="center" style="background:#F00;color:#FFF;">'+i+'</td>';
                    else if(i==now.getDate() && this.m==now.getMonth() && this.y==now.getFullYear())
                        s += '<td title="Сегодня" align="center" style="cursor:pointer;color:#060;background:'+bg+'" onmouseover="this.style.color=\'#F00\'" '+
                             'onmouseout="this.style.color=\'#060\'" onclick="VVC.VERIFY.DT.setDay(this)">'+i+'</td>';
                    else
                        s += '<td align="center" style="cursor:pointer;color:#000;background:'+bg+'" onmouseover="this.style.color=\'#F00\'" '+
                             'onmouseout="this.style.color=\'#000\'" onclick="VVC.VERIFY.DT.setDay(this)">'+i+'</td>';
                }
            }
            s += '</tr>';
        }
        s += '</table>';
        if(ret===true) return s;
        this.daySelect.innerHTML = s;
    };

    this.setDay = function(el)
    {
        this.y = this.yearSelect.value;
        this.m = this.monthSelect.selectedIndex;
        this.d = parseInt(el.innerHTML);
        if(isNaN(this.d) || this.d<1)
        {
            this.d = 1;
        }
        else if(this.d>28)
        {
            var maxDay = this.getLastMonthDay();
            if(this.d>maxDay) this.d = maxDay;
        }
        this.w = (new Date(this.y,this.m,this.d)).getDay();
        this.el.value = this.addZero(this.d)+'.'+this.addZero(+this.m+1)+'.'+this.y;
        this.close();
    };

    this.getLastMonthDay = function()
    {
        for(var i=31;i>28;i--)
        {
            var ok = true;
            try{var d = new Date(this.y,this.m,i)}catch(e){var ok=false;}
            if(ok && this.m==d.getMonth()) return i;
        }
        return 31;
    };

    this.getWeekMonday = function(n)
    {
        var d = this.d - this.w + 1;
        while(d>7) d -= 7; if(d>1) d -= 7;
        while (d<(n*7 - 5)) d += 7;
        return d;
    };
};




///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function VVCVerify()
{
    this.fPhone = '(___) ___ - __ - __';
    this.fPassport = '__ __ № ______';

    this.elem = {};

    var me = this;

    this.reg = function(id,name,tp)
    {
        if(tp=='none') return;
        this.elem[id] = {name:name,tp:tp};
    };

    this.verForm = function(f)
    {
        var el = f.getElementsByTagName('INPUT'), elem = {}, len = el.length, fel = {};
        for(var i=0;i<len;i++)
        {
            if(el[i].name && el[i].name.indexOf('f_')>-1)
            {
                fel[el[i].name] = el[i];
                continue;
            }
            if(el[i].type.toUpperCase()!='HIDDEN' || !el[i].id || el[i].id.indexOf('f_')==-1) continue;
            elem[el[i].id] = el[i].value;
        }
        for(var i in elem)
        {
            el = fel[i];
            if(!el || el.disabled) continue;

            var dv = VVC.$(el.id.replace('ctrl','div'));
            if(!dv || dv.style.display == 'none') continue;

            var err_el = VVC.$(el.id.replace('ctrl','error'));

            switch(elem[i])
            {
                case 'def':
                {
                    el.value = this.trim(el.value);
                    if(!el.value.length)
                    {
                        if(err_el)
                        {
                            err_el.innerHTML = 'Необходимо заполнить';
                            el.style.borderColor = '#F00';
                        }
                        return this.hlErr(el);
                    }
                    else
                    {
                        if(err_el)
                        {
                            err_el.innerHTML = '<img src="'+VVC_DOMAIN+'/widget/img/ok.png" alt=""/>';
                            el.style.borderColor = '#090';
                        }
                    }
                    break;
                }
                case 'rus':
                {
                    el.value = this.trim(el.value);
                    if(!el.value.length || (/[^А-яЁё\-]/).test(el.value))
                    {
                        if(err_el)
                        {
                            err_el.innerHTML = 'Необходимо заполнить, допустимы только русские буквы';
                            el.style.borderColor = '#F00';
                        }
                        return this.hlErr(el);
                    }
                    else
                    {
                        if(err_el)
                        {
                            err_el.innerHTML = '<img src="'+VVC_DOMAIN+'/widget/img/ok.png" alt=""/>';
                            el.style.borderColor = '#090';
                        }
                    }
                    break;
                }
                case 'lat':
                {
                    el.value = this.trim(el.value);
                    if(!el.value.length || (/[^A-z0-9\-]/).test(el.value))
                    {
                        if(err_el)
                        {
                            err_el.innerHTML = 'Необходимо заполнить, допустимы только латинские символы и цифры';
                            el.style.borderColor = '#F00';
                        }
                        return this.hlErr(el);
                    }
                    else
                    {
                        if(err_el)
                        {
                            err_el.innerHTML = '<img src="'+VVC_DOMAIN+'/widget/img/ok.png" alt=""/>';
                            el.style.borderColor = '#090';
                        }
                    }
                    break;
                }
                case 'email':
                {
                    el.value = this.trim(el.value.toLowerCase());
                    if( ! (/^([a-z0-9_-]+.)*[a-z0-9_-]+@([a-z0-9][a-z0-9-]*[a-z0-9].)+[a-z]{2,4}$/i).test(el.value) )
                    {
                        if(err_el)
                        {
                            err_el.innerHTML = 'Неверный адрес электронной почты';
                            el.style.borderColor = '#F00';
                        }
                        return this.hlErr(el);
                    }
                    else
                    {
                        if(err_el)
                        {
                            err_el.innerHTML = '<img src="'+VVC_DOMAIN+'/widget/img/ok.png" alt=""/>';
                            el.style.borderColor = '#090';
                        }
                    }
                    break;
                }
                case 'phone':
                {
                    if(this.toDigStr(el.value).length!=10)
                    {
                        if(err_el)
                        {
                            err_el.innerHTML = 'Необходимо ввести номер телефона';
                            el.style.borderColor = '#F00';
                        }
                        return this.hlErr(el);
                    }
                    else
                    {
                        if(err_el)
                        {
                            err_el.innerHTML = '<img src="'+VVC_DOMAIN+'/widget/img/ok.png" alt=""/>';
                            el.style.borderColor = '#090';
                        }
                    }
                    break;
                }
                case 'pas':
                {
                    if(this.toDigStr(el.value).length!=10)
                    {
                        if(err_el)
                        {
                            err_el.innerHTML = 'Необходимо ввести номер паспорта';
                            el.style.borderColor = '#F00';
                        }
                        return this.hlErr(el);
                    }
                    else
                    {
                        if(err_el)
                        {
                            err_el.innerHTML = '<img src="'+VVC_DOMAIN+'/widget/img/ok.png" alt=""/>';
                            el.style.borderColor = '#090';
                        }
                    }
                    break;
                }
                case 'dig_length':
                {
                    el.value = this.toDigStr(el.value);
                    if(el.value.length!=el.maxLength)
                    {
                        if(err_el)
                        {
                            err_el.innerHTML = 'В номере должно быть '+el.maxLength+' цифр';
                            el.style.borderColor = '#F00';
                        }
                        return this.hlErr(el);
                    }
                    else
                    {
                        if(err_el)
                        {
                            err_el.innerHTML = '<img src="'+VVC_DOMAIN+'/widget/img/ok.png" alt=""/>';
                            el.style.borderColor = '#090';
                        }
                    }
                    break;
                }
                case 'dig':
                {
                    el.value = this.toDigStr(el.value);
                    if(el.value.length==0) el.value = 0;
                    break;
                }
            }
        }

        var d = {};
        for(var i in fel)
        {
            var id = i.replace('f_','');
            if(typeof(elem[i])!='undefined')
            {
                switch(elem[i])
                {
                    case 'phone': case 'pass':
                    {
                        d[id] = this.toDigStr(fel[i].value);
                        break;
                    }
                    case 'date': case 'bdate':
                    {
                        var e = fel[i].value.split('.');
                        if(typeof(e[2])!='undefined') d[id] = (e[2]-0)+'-'+(e[1]-0)+'-'+(e[0]-0);
                        break;
                    }
                    default:
                    {
                        d[id] = fel[i].value;
                        break;
                    }
                }
            }
            else
            {
                if(fel[i].type.toUpperCase()=='CHECKBOX')
                {
                    var e = id.split('_');
                    if(e.length>1)
                    {
                        if(typeof(d[e[0]])=='undefined') d[e[0]] = '';
                        if(fel[i].checked)
                        {
                           if(d[e[0]]) d[e[0]] += ',';
                           d[e[0]] += fel[i].value;
                        }
                    }
                    else d[id] = fel[i].checked ? '1' : '0';
                }
                else d[id] = fel[i].value;
            }
        }
        el = f.getElementsByTagName('SELECT'), len = el.length;
        for(var i=0; i<len;i++)
        {
            if(el[i].name.indexOf('f_')>-1)
                d[el[i].name.replace('f_','')] = el[i].value;
        }
        d.step = f.step.value;
        VVC.submitData(d);
        return false;
    };

    this.hlErr = function(el)
    {
        if(el.focus) el.focus();
        if(el.select) el.select();
        new VVC_HILIGHT(el);
        return false;
    };

    this.stripTags = function(s)
    {
        if (!s) return '';
        return this.trim(s.replace(/<\/?[^>]+>/g, ''));
    };

    this.trim = function(s)
    {
        if (!s) return '';
        s = s.replace( /^\s+/g, '');
        return s.replace( /\s+$/g, '');
    };

    this.verify = function(v,tp,len)
    {
        v = this.trim(v);
        switch(tp)
        {
            case 'def'              : if(!v.length) return false; break;
            case 'rus'              : if(!v.length || (/[^А-яЁё\-]/).test(v)) return false; break;
            case 'lat'              : if(!v.length || (/[^A-z0-9\-]/).test(v)) return false; break;
            case 'email'            : if( ! (/^([a-z0-9_-]+.)*[a-z0-9_-]+@([a-z0-9][a-z0-9-]*[a-z0-9].)+[a-z]{2,4}$/i).test( v.toLowerCase() ) ) return false; break;
            case 'phone': case 'pas': if((this.toDigStr(v)).length!=10) return false; break;
            case 'dig_length'       : if((this.toDigStr(v)).length!=len) return false; break;
            case 'dig'              : if((this.toDigStr(v)).length==0) return false; break;
            default                 : return false; break;
        }
        return true;
    };

    this.toDigStr = function(s)
    {
        var t = '';
        for(var i=0;i<s.length;i++) if(!isNaN(parseInt(s.substr(i,1)))) t += s.substr(i,1);
        return t;
    };

    this.digMask = function(el,ev,mask)
    {
        var ev = ev ? ev : window.event;
        var dig = false, car, pos;
        if(ev && typeof(ev.keyCode)!='undefined')
        {
            if(ev.keyCode>95 && ev.keyCode<106) dig = ev.keyCode - 96;
            else if(ev.keyCode>47 && ev.keyCode<58) dig = ev.keyCode - 48;
        }
        var v = el.value, len = v.length, s = '';
        for(var i=0;i<len;i++) if(!isNaN(parseInt(v.substr(i,1)))) s += v.substr(i,1);
        v = mask, len = s.length;
        if(dig!==false && len<10)
        {
            s += dig;
            len++;
        }
        for(i=0;i<len;i++) v = v.replace('_',s.substr(i,1));
        el.value = v;
        pos = v.indexOf('_');
        if(pos>-1) this.setCaretPosition(el, pos);
    };

    this.phMask = function(el,ev)
    {
        this.digMask(el,ev,this.fPhone);
    };

    this.paMask = function(el,ev)
    {
        this.digMask(el,ev,this.fPassport);
    };

    this.getCaretPosition = function(el)
    {
        if (document.selection)
        {
            var range = document.selection.createRange();
            range.moveStart('textedit', -1);
            return range.text.length;
        }
        else return el.selectionStart;
    };

    this.setCaretPosition = function(el,pos)
    {
        if(el.setSelectionRange)
        {
            el.focus();
            el.setSelectionRange(pos,pos);
        }
        else if (el.createTextRange)
        {
            var range = el.createTextRange();
            range.collapse(true);
            range.moveEnd('character', pos);
            range.moveStart('character', pos);
            range.select();
        }
    };

    this.DT = new VVCDtPicker();
};

function VVC_HILIGHT(el)
{
    if(!el || !el.style) return;
    this.el = el;
    this.bg = '#F77', this.tm = 50, this.it = 5;
    this.bge = el.style.background;
    if(this.bg == this.bge) return;
    var me = this;
    this.hilight = function()
    {
        if(me.el.style.background === me.bge)
        {
            if(me.it==0) return;
            me.it--;
            me.el.style.background = me.bg;
        }
        else
        {
            me.el.style.background = me.bge;
        }
        window.setTimeout(me.hilight,me.tm);
    };
    this.hilight();
};

function CCreditCalc()
{
    this.posXOld = false;
    this.delay   = false;
    this.minPay  = 0;
    var me = this;
    this.dnd = function(evt, obj)
    {
        document.body.style.cursor = 'e-resize';
        document.body.onselectstart = function(){return false}
        evt = evt || window.event;
        obj.clicked = true;

        if(evt.preventDefault)
            evt.preventDefault();
        else
            evt.returnValue = false;

        document.onmouseup = function()
        {
            document.body.onselectstart = function(){return true}
            document.body.style.cursor = 'default';
            obj.clicked = false;
            document.onmouseup = function() {};
            document.onmousemove = function() {};
            me.posXOld = false;
            me.calc();
        };

        document.onmousemove = function(evt)
        {
            evt = evt || window.event;
            if(obj.clicked)
            {
                if(!me.posXOld)
                {
                    me.posXOld = evt.clientX;
                }
                else
                {
                    var d = parseInt(obj.style.marginLeft) + evt.clientX - me.posXOld;
                    me.posXOld = evt.clientX;
                    if(d<0) d = 0; if(d>480) d = 480;
                    obj.style.marginLeft = d+'px';
                    me.calc(true,obj);
                    if(obj.id=='VVC_CALC_PAY1_SLIDER')
                        VVC.$('VVC_CALC_PAY1_PANE').style.backgroundSize = (d + 12)+'px 32px';
                    if(obj.id=='VVC_CALC_MONTH_SLIDER')
                        VVC.$('VVC_CALC_MONTH_PANE').style.backgroundSize = (d + 12)+'px 32px';
                }
            }
        };
    };

    this.set = function(evt,obj)
    {
        evt = evt || window.event;
        var d = evt.clientX - me.offsetLeft(obj) - 5;
        if(d<0) d = 0; if(d>480) d = 480;
        var el = obj.getElementsByTagName('DIV')[0];
        el.style.marginLeft = d+'px';
        obj.style.backgroundSize = (d + 5) + 'px 32px';
        me.calc(true,el);
    };

    this.offsetLeft = function(element)
    {
        var offsetLeft = 0;
        do offsetLeft += element.offsetLeft;
        while (element = element.offsetParent);
        return offsetLeft;
    };

    this.html = function(amount)
    {
        this.calc(amount);
        return  '<div id="VVC_CREDIT_CALC">'+
                '<div id="VVC_CALC_MAIN_PANE"><div id="VVC_CALC_LEFT_PANE"><div id="VVC_CALC_DIV_SPLIT"></div>'+
                '<div id="VVC_CALC_SLIDE_BACK"><div onclick="VVC.CALC.set(event,this)" id="VVC_CALC_PAY1_PANE">'+
                '<div id="VVC_CALC_PAY1_SLIDER" onmousedown="VVC.CALC.dnd(event,this)"></div></div></div>'+
                '<div id="VVC_CALC_SLIDE_BACK"><div onclick="VVC.CALC.set(event,this)" id="VVC_CALC_MONTH_PANE">'+
                '<div id="VVC_CALC_MONTH_SLIDER"onmousedown="VVC.CALC.dnd(event,this)"></div></div></div>'+
                '</div><div id="VVC_CALC_RIGHT_PANE"><div id="VVC_CALC_DIV_SPLIT"></div>'+
                '<input id="VVC_CALC_PAY1" onkeyup="VVC.CALC.calcDelay()" type="text" value="'+this.pay1+'"/>'+
                '<input id="VVC_CALC_MONTH" onkeyup="VVC.CALC.calcDelay()" type="text" maxlength="2" value="'+this.month+'"/>'+
                '<div id="VVC_CALC_PAY2">'+this.pay2+'</div></div></div>'+
                '<div id="VVC_CALC_NOTE" style="margin-top:10px;">Расчёт среднемесячного платежа является приблизительным.<br/><br/>'+
                'Детальную информацию можно уточнить по тел. <b>+7 (495) 540-42-42</b></div>'+
                '</div>';
    };

    this.calcDelay = function()
    {
        if(me.delay)
        {
            clearTimeout(me.delay);
            me.delay = false;
        }
        me.delay = setTimeout(me.calc,500);
    };

    this.calc = function(am,obj)
    {
        me.delay = false;
        if(am===true)
        {
            var x = (parseInt(obj.style.marginLeft)-5)/480;
            if(obj.id=='VVC_CALC_MONTH_SLIDER')
            {
                this.month = Math.round(x * 23 + 1);
                if(isNaN(this.month) || this.month<1) this.month = 1;
                VVC.$('VVC_CALC_MONTH').value = this.month;
            }
            else
            {
                this.pay1 = Math.round( (x*(this.amount-this.minPay) + this.minPay)/100 )*100;
                if(isNaN(this.pay1) || this.pay1<this.minPay) this.pay1 = this.minPay;
                VVC.$('VVC_CALC_PAY1').value  = this.pay1;
            }
        }
        else if(am)
        {
            this.month  = 24;
            this.amount = am;
            this.pay1 = 0;
            this.minPay = this.pay1;
        }


        if(!am)
        {
            me.month = parseInt(VVC.$('VVC_CALC_MONTH').value);
            if(isNaN(me.month) || me.month<1) me.month = 1;
            if(me.month>24) me.month = 24;

            var p = Math.round(VVC.$('VVC_CALC_PAY1').value/100)*100;
            if(!isNaN(p))
            {
                if(p>me.amount) p = me.amount;
                if(p<me.minPay) p = me.minPay;
                me.pay1 = p;
            }
            else VVC.$('VVC_CALC_PAY1').value = me.minPay;
        }

        me.total = (me.amount - me.pay1) + (me.amount - me.pay1)/4/(12/me.month);
        me.pay2 = Math.round(me.total/me.month/10)*10;

        if(VVC.$('VVC_CALC_PAY2'))
            VVC.$('VVC_CALC_PAY2').innerHTML  = me.pay2;

        if(!am)
        {
            VVC.$('VVC_CALC_PAY1').value  = me.pay1;
            VVC.$('VVC_CALC_MONTH').value = me.month;
            if(me.pay1<me.amount/2)
                var x = parseInt((me.pay1-me.minPay)/me.amount*480);
            else
                var x = parseInt((me.pay1)/me.amount*480);

            VVC.$('VVC_CALC_PAY1_SLIDER').style.marginLeft = (x + 5) + 'px';
            VVC.$('VVC_CALC_PAY1_PANE').style.backgroundSize = (x + 12)+'px 32px';

            x = parseInt((me.month-1)/23*480);
            VVC.$('VVC_CALC_MONTH_SLIDER').style.marginLeft = (x + 5) + 'px';
            VVC.$('VVC_CALC_MONTH_PANE').style.backgroundSize = (x + 12)+'px 32px';

        }
    };

};

if (!VVC)
{
    var VVC = new CVVC();
}
else
{
    initializedVVC = VVC;
    VVC = new CVVC();

    for (var key in initializedVVC)
    {
        VVC[key] = initializedVVC[key];
    }
}

(function(scope){scope.MaskedInput=function(args){if(!args||!args.elm||!args.format)return null;if(!(this instanceof scope.MaskedInput))return new scope.MaskedInput(args);var self=this,el=args["elm"],format=args["format"],allowed=args["allowed"]||"0123456789",sep=args["separator"]||"/:-",open=args["typeon"]||"_YMDhms",onbadkey=args["onbadkey"]||function(){},badwait=args["badkeywait"]||0,locked=false,startText=format;var evtAdd=function(obj,type,fx,capture){if(window.addEventListener&&!(document.all&&
!window.opera))return function(obj,type,fx,capture){obj.addEventListener(type,fx,capture===undefined?false:capture)};else if(window.attachEvent)return function(obj,type,fx){obj.attachEvent("on"+type,fx)};return function(obj,type,fx){obj["on"+type]=fx}}();var init=function(){if(!el.tagName||el.tagName.toUpperCase()!=="INPUT"&&el.tagName.toUpperCase()!=="TEXTAREA")return null;el.value=format;evtAdd(el,"keydown",function(e){KeyHandlerDown(e)});evtAdd(el,"keypress",function(e){KeyHandlerPress(e)});evtAdd(el,
"focus",function(){startText=el.value});evtAdd(el,"blur",function(){if(el.value!==startText&&el.onchange)el.onchange()});return self};var GetKey=function(code){code=code||window.event;var ch="",keyCode=code.which,evt=code.type;if(keyCode==null)keyCode=code.keyCode;if(keyCode===null)return"";switch(keyCode){case 8:ch="bksp";break;case 46:ch=evt=="keydown"?"del":".";break;case 16:ch="shift";break;case 0:case 9:case 13:ch="etc";break;case 37:case 38:case 39:case 40:ch=!code.shiftKey&&code.charCode!=
39&&code.charCode!==undefined?"etc":String.fromCharCode(keyCode);break;default:ch=String.fromCharCode(keyCode)}return ch};var stopEvent=function(evt,ret){if(evt.preventDefault)evt.preventDefault();evt.returnValue=ret||false};var KeyHandlerDown=function(e){e=e||event;if(locked){stopEvent(e);return false}var key=GetKey(e);if((e.metaKey||e.ctrlKey)&&(key=="X"||key=="V")){stopEvent(e);return false}if(e.metaKey||e.ctrlKey)return true;if(el.value==""){el.value=format;SetTextCursor(el,0)}if(key=="bksp"||
key=="del"){Update(key);stopEvent(e);return false}else if(key=="etc"||key=="shift")return true;else{stopEvent(e,true);return true}};var KeyHandlerPress=function(e){e=e||event;if(locked){stopEvent(e);return false}var key=GetKey(e);if(key=="etc"||e.metaKey||e.ctrlKey||e.altKey)return true;if(key!="bksp"&&key!="del"&&key!="shift"){if(!GoodOnes(key)){stopEvent(e);return false}if(Update(key)){stopEvent(e,true);return true}stopEvent(e);return false}else return false};var Update=function(key){var p=GetTextCursor(el),
c=el.value,val="";switch(true){case allowed.indexOf(key)!=-1:if(++p>format.length)return false;while(sep.indexOf(c.charAt(p-1))!=-1&&p<=format.length)p++;val=c.substr(0,p-1)+key+c.substr(p);if(allowed.indexOf(c.charAt(p))==-1&&open.indexOf(c.charAt(p))==-1)p++;break;case key=="bksp":if(--p<0)return false;while(allowed.indexOf(c.charAt(p))==-1&&open.indexOf(c.charAt(p))==-1&&p>1)p--;val=c.substr(0,p)+format.substr(p,1)+c.substr(p+1);break;case key=="del":if(p>=c.length)return false;while(sep.indexOf(c.charAt(p))!=
-1&&c.charAt(p)!="")p++;val=c.substr(0,p)+format.substr(p,1)+c.substr(p+1);p++;break;case key=="etc":return true;default:return false}el.value="";el.value=val;SetTextCursor(el,p);return false};var GetTextCursor=function(node){try{if(node.selectionStart>=0)return node.selectionStart;else if(document.selection){var ntxt=node.value;var rng=document.selection.createRange();rng.text="|%|";var start=node.value.indexOf("|%|");rng.moveStart("character",-3);rng.text="";node.value=ntxt;return start}return-1}catch(e){return-1}};
var SetTextCursor=function(node,pos){try{if(node.selectionStart){node.focus();node.setSelectionRange(pos,pos)}else if(node.createTextRange){var rng=node.createTextRange();rng.move("character",pos);rng.select()}}catch(e){return false}return true};var GoodOnes=function(k){if(allowed.indexOf(k)==-1&&k!="bksp"&&k!="del"&&k!="etc"){var p=GetTextCursor(el);locked=true;onbadkey();setTimeout(function(){locked=false;SetTextCursor(el,p)},badwait);return false}return true};self.resetField=function(){el.value=
format};self.setAllowed=function(a){allowed=a;resetField()};self.setFormat=function(f){format=f;resetField()};self.setSeparator=function(s){sep=s;resetField()};self.setTypeon=function(t){open=t;resetField()};return init()}})(window);

