Ext.define('PushIM.Webapp.view.login.LoginController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.authlogin',
    requires: [
        'PushIM.Webapp.util.User'
    ],

    uses: [
        'PushIM.Webapp.view.setting.AccountSetting'
    ],

    init() {
        var me = this;
        me.callParent(arguments);

        var form = me.lookup('form');

        var map = new Ext.util.KeyMap({
            target: form.element,
            key: 13, // or Ext.event.Event.ENTER
            handler() {
                me.onEnterLogin();
            },
            scope: me
        });

    },

    /**
     * 添加一层，看登录按钮是否可用，若可用，则可验证登录
     */
    onEnterLogin() {
        const me = this,
            btnLogin = this.lookup('btnLogin'),
            disabled = btnLogin.getDisabled();
        if (!disabled) {
            me.onLoginTap();
        }
    },

    /**
     * 验证登录
     */
    onLoginTap() {
        var me = this,
            btnLogin = me.lookup('btnLogin'),
            form = me.lookup('form'),
            values = form.getValues();

        if (values.userId !== '' && values.password !== '') {
            form.clearErrors();

            if (form.validate()) {

                // 对params有过封装改动
                Utils.ajaxByZY('post', 'users/login', {
                    params: JSON.stringify({
                        user_id: values.userId,
                        password: values.password
                    }),
                    success(r) {
                        if (r.user_name) {
                            if (Config.isPC) {
                                cefMain.setUserInfo('{user_id: "' + r.user_id + '", user_name: "' + r.user_name + '"}');
                            }
                            // 记住用户名密码
                            if (values.remember == true) {
                                localStorage.setItem('USERID', values.userId);
                                localStorage.setItem('PASSWORD', values.password);
                            }
                            User.ownerID = r.user_id;
                            me.fireEvent('login');
                        } else {
                            Utils.toastShort('用户名或密码错误，请重新登录');
                            me.fireEvent('needlogin');
                        }
                    },
                    failure(msg) {
                        form.setErrors({
                            userId: msg,
                            password: msg
                        });
                        Utils.toastShort(msg);
                    },
                    button: btnLogin,
                    maskTarget: true
                });
            }
        } else {
            Utils.toastLong('用户名或密码不能为空');
        }
    },


    loginClose() {
        if(window.cefMain) {
            window.cefMain.close();
        }
    },

    loginMax() {
        if(window.cefMain) {
            window.cefMain.max();
        }
    },

    loginMin() {
        if(window.cefMain) {
            window.cefMain.min();
        }
    },


    onSet() {
        Ext.Viewport.getController().showView('acSetting');
    }
});