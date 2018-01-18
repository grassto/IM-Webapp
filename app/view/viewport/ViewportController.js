Ext.define('PushIM.Webapp.view.viewport.ViewportController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.viewport',
    requires: [
        'PushIM.Webapp.view.login.Login',
        'IM.view.IM'
    ],

    listen: {
        controller: {
            '*': {
                needlogin: 'onNeedLogin',
                login: 'onLogin'
            }
        }
    },

    onLaunch() {
        var me = this;

        if (Config.hasCon) {
            // 验证是否有用户名与密码
            var USERID = localStorage.getItem('USERID'),
                PASSWORD = localStorage.getItem('PASSWORD');
            if (USERID && PASSWORD) {
                Utils.ajaxByZY('post', 'users/login', {
                    params: JSON.stringify({
                        login_id: USERID,
                        password: PASSWORD
                    }),
                    success(r) {
                        if (r.username) {
                            User.ownerID = r.id;
                            me.onLogin();
                        } else {
                            Utils.toastShort('用户名或密码错误，请重新登录');
                            me.onNeedLogin();
                        }
                    },
                    failure(msg) {
                        Utils.toastShort('用户名或密码错误，请重新登录');
                        me.onNeedLogin();
                    },
                    callback() {
                        Ext.getBody().removeCls('launching');
                    },
                    maskTarget: true
                });
            } else {
                Utils.toastShort('会话已超时，请重新登录');
                me.onNeedLogin();
            }
        }else {
            me.onLogin();
        }

    },

    onLogin() {
        this.showView('IM');
    },

    onNeedLogin() {
        this.showView('authlogin');
    },

    onLogout() {

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
        // debugger;
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
});