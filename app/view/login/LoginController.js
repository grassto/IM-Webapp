Ext.define('PushIM.Webapp.view.login.LoginController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.authlogin',

    init() {
        var me = this;
        me.callParent(arguments);

        var form = me.lookup('form');

        var map = new Ext.util.KeyMap({
            target: form.element,
            key: 13, // or Ext.event.Event.ENTER
            handler() {
                me.onLoginTap();
            },
            scope: me
        });
    },

    onLoginTap() {
        var me = this,
            btnLogin = me.lookup('btnLogin'),
            form = me.lookup('form');

        form.clearErrors();

        if (form.validate()) {
            var values = form.getValues();

            // 对params有过封装改动
            Utils.ajaxByZY('post', 'users/login', {
                params: JSON.stringify({
                    login_id: values.userId,
                    password: values.password
                }),
                success(r) {
                    if (r.username) {
                        // 记住用户名密码
                        if(values.remember == true) {
                            localStorage.setItem('USERID', values.userId);
                            localStorage.setItem('PASSWORD', values.password);
                        }
                        User.ownerID = r.id;
                        me.fireEvent('login');
                    }else {
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

    }
});