/**
 * The main application class. An instance of this class is created by app.js when it
 * calls Ext.application(). This is the ideal place to handle application launch and
 * initialization details.
 */
Ext.define('PushIM.Webapp.Application', {
    extend: 'Ext.app.Application',

    name: 'PushIM.Webapp',
    requires: [
        'Ext.util.CSS',
        'Ext.layout.HBox',
        'PushIM.Webapp.view.viewport.ViewportController',
        'PushIM.Webapp.view.viewport.ViewportModel',
        'PushIM.Webapp.util.User',
        'IMCommon.local.InitDb'
    ],

    quickTips: false,
    platformConfig: {
        desktop: {
            quickTips: true // 支持全局读取 dom 的属性 data-qtip，显示悬停提示
        }
    },

    viewport: {
        controller: 'viewport',
        viewModel: 'viewport'
    },

    launch(profile) {
        const me = this;

        Ext.enableAria = false;
        Ext.ariaWarn = Ext.emptyFn;

        Ext.event.gesture.LongPress.instance.setMinDuration(600); // 长按延时设为 600ms

        // 默认时间格式
        Ext.apply(Ext.Date, {
            defaultTimeFormat: 'H:i'
        });

        // 去除 Ext.Msg 动画
        Ext.Msg.defaultAllowedConfig.hideAnimation = null;
        Ext.Msg.defaultAllowedConfig.showAnimation = null;


        if (Ext.manifest.env == 'production') {
            // Config.wsGoUrl = Config.wsPdcUrl;
            // Config.httpUrl = Config.httpAIOUrl;
            // Config.httpUrlForGo = Config.httpPdcGoUrl;
            me.setConfigUrl();
        } else { // if(Ext.manifest.env == 'development')
            Config.wsGoUrl = Config.wsDevGoUrl;
            Config.httpUrl = Config.httpAIOUrl;
            Config.httpUrlForGo = Config.httpDevGoUrl;
        }

        // cef版桌面程序
        if (window.cefMain) {
            Config.isPC = true;
            Config.needLocal = true;
        } else if (Ext.browser.is.Cordova) { // 移动端
            Config.isPhone = true;
            Config.needLocal = true;
        }

        if (!Ext.browser.is.Cordova) { // 非cordova环境
            me.onDeviceReady();
        } else {
            document.addEventListener('deviceready', Ext.bind(me.onDeviceReady, me), false);
        }

        me.hideAvaDetail(); // 监听document的单击事件
        // me.preventRightClick(); // 禁用页面原本右击事件



        // The viewport controller requires xtype defined by profiles, so let's perform extra
        // initialization when the application and its dependencies are fully accessible.
        Ext.Viewport.getController().onLaunch();
        me.callParent([profile]);

    },

    // 根据网络设置来配置相应的url
    setConfigUrl() {
        // 设置默认值
        if (!localStorage.getItem('inOrOut') || !localStorage.getItem('inUrl') || !localStorage.getItem('outUrl')) {
            Config.httpUrlForGo = Config.httpPdcGoUrl;
            Config.wsGoUrl = Config.wsPdcUrl;
        } else {
            if (localStorage.getItem('inOrOut') == 'in') {
                var url = localStorage.getItem('inUrl');
                if (url && url.indexOf) {
                    var index = url.indexOf(':');
                    if (index > -1) {
                        Config.wsGoUrl = 'wss' + url.substring(index) + '/api/v1/websocket';
                    } else {
                        Config.wsGoUrl = 'wss://' + url + '/api/v1/websocket';
                    }

                    Config.httpUrlForGo = url + '/api/v1/';
                }
            } else if (localStorage.getItem('inOrOut') == 'out') {
                var url = localStorage.getItem('outUrl');
                if (url && url.indexOf) {
                    var index = url.indexOf(':');
                    if (index > -1) {
                        Config.wsGoUrl = 'wss' + url.substring(index) + '/api/v1/websocket';
                    } else {
                        Config.wsGoUrl = 'wss://' + url + '/api/v1/websocket';
                    }
                    Config.httpUrlForGo = url + '/api/v1/';
                }
            }
        }
    },

    /**
     * 监听document的tap事件，点击隐藏panel
     */
    hideAvaDetail() {
        Ext.get(document).on({
            tap() {
                var viewport = Ext.Viewport,
                    avaDetail = viewport.child('avatarDetail');
                if (avaDetail) {
                    if (!avaDetail.isHidden()) {
                        avaDetail.hide();
                    }
                }
            }
        });
    },

    preventRightClick() {
        Ext.getDoc().on('contextmenu', function (e) {
            e.stopEvent();
        });
    },
    onDeviceReady() {
        var me = this;
        me.pluginReady(); // 由Cordova插件获取一些信息
        me.getVersion(version => {
            me.versionCode = version.code; // 当前App版本号
            me.versionName = version.name; // 当前App版本号

            if (navigator.splashscreen) navigator.splashscreen.hide(); // 隐藏app启动界面
        });
    },

    pluginReady() {
        var me = this,
            isCordova = Ext.browser.is.Cordova;
        if (!isCordova) {
            if (Ext.isEmpty(Utils.getLsItem('deviceuuid'))) {
                Utils.setLsItem('deviceuuid', Utils.uuid('web_')); // 浏览器访问网页版的话，用这个模拟 deviceId
            }

            return;
        }

        // 透明状态栏，顶部下移20px(ios 7+)/25px(android 4.4+)，为状态栏留下空间
        me.statusBarHeight = 0;
        if (isCordova &&
            (Ext.os.is.iOS && Ext.os.version.major >= 7 || // ios7+(除了iPhone X)
                Ext.os.is.Android && Ext.os.version.major * 10 + Ext.os.version.minor >= 44)) { // android 4.4+
            var statusH = 20;
            if (Ext.os.is.Android) statusH = 25;
            me.statusBarHeight = statusH;
            Ext.util.CSS.createStyleSheet([
                '.topinset { ',
                `padding-top: ${statusH}px; `,
                'padding-top: constant(safe-area-inset-top); ',
                'padding-top: env(safe-area-inset-top); ',
                '}'
            ].join(''), 'InsetStyle');

            // 安卓4.4 ~ 5.1长按弹出action bar(cut/copy/paste)时，取消顶部下移的20/25px
            // 安卓6.0已经不是action bar了，类似iOS的popup menu
            if (Ext.os.is.Android && Ext.os.version.major * 10 + Ext.os.version.minor < 60) {
                window.addEventListener('native.actionmodeshow', function (r) {
                    Ext.Viewport.element.addCls('actionmode');
                }, false);
                window.addEventListener('native.actionmodehide', function (r) {
                    Ext.Viewport.element.removeCls('actionmode');
                }, false);
            }
        }
    },

    /**
     * 获取当前app的版本号
     * @param {Function} success 成功回调
     */
    getVersion(success) {
        if (window.BuildInfo) { // cordova-plugin-buildInfo
            success({
                code: BuildInfo.versionCode,
                name: BuildInfo.version
            });
        } else {
            Ext.Ajax.request({
                url: Ext.getResourcePath('appversion.txt', null),
                success(resp) {
                    var txt = resp.responseText.trim(),
                        ps = txt.split('\n'),
                        result = {};
                    for (var i = 0; i < ps.length; i++) {
                        var p = ps[i].trim().split('=');
                        if (p[0].trim() == 'version.name') {
                            result.name = p[1].trim();
                        } else if (p[0].trim() == 'version.code') {
                            result.code = p[1].trim();
                        }
                    }
                    success(result);
                },
                failure() { }
            });
        }
    },

    /**
     * 获取客户端一些信息，这些信息在每次请求后台时(Utils.ajax)，追加到请求参数中
     * @return {Object}
     */
    getClientInfo() {
        var me = this,
            isCdv = !!Ext.browser.is.Cordova,
            //user = User.getUser(),
            isDebug = Utils.isDebug();
        var result = {
            '_appid': Ext.manifest.name,
            '_os': Ext.os.name, //系统类型
            '_version': me.versionCode || 0, //app版本
            '_cordova': isCdv, //是否cordova
            '_deviceid': isCdv ? device.uuid : Utils.getLsItem('deviceuuid') //设备编号
        };
        /*if (user) {
            if (!Ext.isEmpty(user.UserID)) {
                result['_userid'] = user.UserID; //用户编号
            }
            var token = Utils.getLsItem('token');
            if (!Ext.isEmpty(token)) {
                result['_token'] = token; //用户令牌
            }
        }*/
        if (isDebug) result['_isdebug'] = true;

        return result;
    },

    onAppUpdate() {
        Ext.Msg.confirm('程序升级', '本应用程序已发布新版本, 是否重新加载?',
            function (choice) {
                if (choice === 'yes') {
                    window.location.reload();
                }
            }
        );
    }
});