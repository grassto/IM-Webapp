Ext.define('IMMobile.view.details.memDetail', {
    extend: 'Ext.Container',
    xtype: 'IMMobile-memDetail',

    requires: [
        'IMMobile.view.widget.Navbar'
    ],

    layout: 'vbox',
    defaultListenerScope: true,

    viewModel: {},

    items: [{
        xtype: 'IMMobile-Navbar',
        titleMsg: '个人信息'
    }, {
        xtype: 'panel',
        flex: 1,
        itemId: 'memDetail',
        layout: {
            type: 'vbox',
            align: 'center'
        },

        items: [{
            xtype: 'component',
            bind: {
                html: '<div>个人信息展示</div>'
            }
        }, {
            xtype: 'button',
            ui: 'action',
            text: '发消息',
            handler: 'onSend'
        }]
    }],


    onSend() {
        User.chatMemID = User.crtSelMemId; // 解决跳转问题
        const imMobile = Ext.Viewport.lookup('IMMobile').down('#navView');

        imMobile.push({
            xtype: 'IMMobile-chatView',
            itemId: 'IMMobile-chatView'
        });
    }
});