/**
 * The main application class. An instance of this class is created by app.js when it
 * calls Ext.application(). This is the ideal place to handle application launch and
 * initialization details.
 */
Ext.define('PushIM.Webapp.Application', {
    extend: 'Ext.app.Application',

    name: 'PushIM.Webapp',
    requires: [
        'PushIM.Webapp.view.viewport.ViewportController',
        'PushIM.Webapp.view.viewport.ViewportModel',
        'PushIM.Webapp.util.User'
    ],

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


        Config.httpUrl = Config.httpAIOUrl;
        Config.httpUrlForGo = Config.httpDevGoUrl;

        me.hideAvaDetail(); // 监听document的单击事件
        me.preventRightClick(); // 禁用页面原本右击事件


        // The viewport controller requires xtype defined by profiles, so let's perform extra
        // initialization when the application and its dependencies are fully accessible.
        Ext.Viewport.getController().onLaunch();
        me.callParent([profile]);

    },

    /**
     * 监听document的tap事件，点击隐藏panel
     */
    hideAvaDetail() {
        Ext.get(document).on({
            tap: function () {
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
        Ext.getDoc().on('contextmenu', function(e) {
            e.stopEvent();
      });
    },

    /**
     * 随 ajax 请求一起传递到后台的一些额外数据
     * @return {Object}
     */
    getClientInfo() {
        return null;
    },

    quickTips: false,
    platformConfig: {
        desktop: {
            quickTips: true // 支持全局读取 dom 的属性 data-qtip，显示悬停提示
        }
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
