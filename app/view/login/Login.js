Ext.define('PushIM.Webapp.view.login.Login', {
    extend:'Ext.Container',
    xtype: 'authlogin',
    controller: 'authlogin',
    requires: [
        'Ext.field.Password',
        'PushIM.Webapp.view.login.LoginController',
        'Ext.field.Checkbox'
    ],

    initialize() {
        var form = this.lookup('form');
        
        form.setValues({
            userId:localStorage.getItem('USERID'),
            password:localStorage.getItem('PASSWORD'),
            remember: true
        });
    },

    cls: 'auth-login',

    layout: {
        type: 'vbox',
        align: 'center',
        pack: 'center'
    },

    items: [{
        xtype: 'component',
        cls: 'auth-header',
        html:
            '<span class="logo i-aio-aio7"></span>' +
            '<div class="title">IM</div>'
    }, {
        xtype: 'formpanel',
        reference: 'form',
        layout: 'vbox',
        ui: 'auth',

        items: [{
            xtype: 'textfield',
            name: 'userId',
            placeholder: '用户名',
            required: true
        }, {
            xtype: 'passwordfield',
            name: 'password',
            placeholder: '密码',
            required: true
        }, {
            xtype: 'button',
            reference: 'btnLogin',
            text: '登录',
            iconAlign: 'right',
            iconCls: 'x-fa fa-angle-right',
            handler: 'onLoginTap',
            ui: 'action'
        }, {
            xtype: 'checkbox',
            boxLabel: '记住密码',
            name: 'remember'
        }]
    }, {
        xtype: 'component',
        cls: 'auth-footer',
        html: '普实聊天、办公一体化'
    }]
});