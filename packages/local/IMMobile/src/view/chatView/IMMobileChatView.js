Ext.define('IMMobile.view.chatView.IMMobileChatView', {
    extend: 'Ext.Panel',
    xtype: 'IMMobile-chatView',

    requires: [
        'IMMobile.view.widget.Navbar',
        'Ext.dataview.DataView',
        'IMMobile.model.ChatView'
    ],

    layout: 'vbox',

    items: [{
        xtype: 'IMMobile-Navbar',
        items: [{
            xtype: 'component',
            html: '<div class="imMobile-nav-title">测试</div>'
        }, {
            align: 'right',
            iconCls: 'x-fa fa-user'
        }]
    }, {
        xtype: 'dataview',
        itemId: 'IMMobileChatView',
        store: {
            model: 'IMMobile.model.ChatView'
        },
        itemTpl: [
            '<div>{message.message}</div>',
            '<div>ddd</div>'
        ].join('')
    }],


    defaultListenerScope: true,

    initialize() {
        this.openChat();
    },

    openChat() {
        const me = this;
        Utils.ajaxByZY('get', 'chats/' + User.crtChannelId + '/posts', {
            success: function (data) {
                me.down('#IMMobileChatView').getStore().add(data);
            }
        });
    }
});