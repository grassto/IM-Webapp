Ext.define('PushIM.Webapp.view.viewport.ViewportController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.viewport',
    requires: [
        'Ext.Package',
        'PushIM.Webapp.view.login.Login',
        'MX.util.Utils',
        // 'IMCommon.enumType.PlatformType'
    ],

    // uses: [
    //     'IM.view.IM',
    //     'IMMobile.src.view.IMMobile'
    // ],

    listen: {
        controller: {
            '*': {
                needlogin: 'onNeedLogin',
                login: 'onLogin',
                logout: 'onLogout'
            }
        }
    },

    onLaunch() {
        var me = this;
        me.onNeedLogin();

        // // 验证是否有用户名与密码
        // var USERID = localStorage.getItem('USERID'),
        //     PASSWORD = localStorage.getItem('PASSWORD');
        // if (USERID && PASSWORD) { // 如果它们都有值
        //     Utils.ajaxByZY('post', 'users/login', {
        //         params: JSON.stringify({
        //             user_id: USERID,
        //             password: PASSWORD
        //         }),
        //         success(r) {
        //             if (r.user_name) {
        //                 User.crtUser = r; // 个人信息
        //                 User.ownerID = r.user_id;

        //                 if (Config.isPC) {
        //                     cefMain.setUserInfo('{user_id: "' + r.user_id + '", user_name: "' + r.user_name + '"}');
        //                 }
        //                 me.onLogin();
        //             } else {
        //                 Utils.toastShort('用户名或密码错误，请重新登录');
        //                 me.onNeedLogin();
        //             }
        //         },
        //         failure(msg) {
        //             Utils.toastShort(msg);
        //             me.onNeedLogin();
        //         },
        //         callback() {
        //             Ext.getBody().removeCls('launching');
        //         },
        //         maskTarget: true
        //     });
        // } else {
        //     Utils.toastShort('会话已超时，请重新登录');
        //     me.onNeedLogin();
        // }

    },

    onLogin() {
        if (Ext.os.is.Desktop) {
            this.dynamicPkgLoad('IM');
            // this.dynamicPkgLoad('IMMobileNavigation');
        } else if (Ext.os.is.Phone) {
            this.listenPhoneBack();
            this.dynamicPkgLoad('IMMobile');
            // 监听手机的返回键
        } else if (Ext.os.is.Tablet) {
            alert('屏幕未适配');
        } else {
            alert('屏幕未适配');
        }
    },

    // 监听手机的返回键
    listenPhoneBack() {
        const me = this;
        document.addEventListener('backbutton', Ext.Function.bind(me.onBackButton, me), false);
    },

    onBackButton: function () {
        const me = this;
        // 1. 隐藏picker overlay等悬浮在view上的层
        var done = me.backOneFloating();
        if (done) return;
        //2.回退view
        Ext.Viewport.lookup('IMMobile').down('#navView').pop();
    },

    // 隐藏悬浮层
    backOneFloating() {
        var done = false;
        Ext.each((Ext.floatRoot || Ext).query('.x-floated:not(.x-tooltip)'), function (el, idx) {
            const cmp = Ext.getCmp(el.id);
            if (cmp) {
                if (cmp.onBack) { // 这个是弹出层自己的返回
                    cmp.onBack();
                } else {
                    cmp.hide();
                }
                done = true;

                return false; // 退出
            }
        });

        return done;
    },

    /**
     * 动态加载package
     * @param {*} pkg 包名和视图名一样
     */
    dynamicPkgLoad(pkg) {
        const me = this,
            view = me.getView();

        if (Ext.Package.isLoaded(pkg)) {
            me.showView(pkg);
        } else {
            Utils.mask(view, '正在加载模块...');
            Ext.Package.load(pkg).then(() => {
                me.showView(pkg);
                Utils.unMask(view);
            }).catch(ex => {
                console.error(ex);
            });
        }
    },

    onNeedLogin() {
        this.showView('authlogin');
    },

    /**
     * 寻找已经存在的 xtype 的 view 实例
     * @param {String} xtype
     */
    existedView(xtype) {
        const view = this.lookup(xtype);

        return view;
    },
    showView(xtype) {
        const me = this,
            viewport = me.getView();

        let view = me.existedView(xtype);
        if (!view) {
            viewport.removeAll(true);
            view = viewport.add({
                xtype: xtype,
                reference: xtype
            });
        }

        viewport.setActiveItem(view);

        return view;
    },

    /* *************************** 注销 ********************************************/
    onLogout() {
        const me = this;
        Ext.Msg.confirm('注销', '确定要注销吗', function (ok) {
            if (ok === 'yes') {
                Utils.ajaxByZY('post', 'users/logout', {
                    params: JSON.stringify(User.ownerID),
                    success: function (data) {
                        // debugger;
                    }
                });

                // 这一块应该写在success里面
                WebSocketHelper.close(); // 断开Websocket连接

                // localStorage.setItem('USERID', '');
                // localStorage.setItem('PASSWORD', '');
                User.clear();
                Ext.StoreManager.removeAll();
                me.onNeedLogin();
            }
        });
    }
});