Ext.define('IMMobile.view.IMMobileMain.tabPanel.IMMobileChat', {
    extend: 'Ext.Panel',
    xtype: 'IMMobile-Chat',

    requires: [
        'IMMobile.view.IMMobileMain.tabPanel.IMMobileChatController',
        'IMMobile.store.RecentChatList',
        'IMMobile.view.widget.Navbar' // 含有返回按钮的头
    ],

    controller: 'IMMobileChatController',

    layout: 'vbox',

    items: [{
        xtype: 'IMMobile-Navbar',
        backBtn: false
    }, {
        xtype: 'component' // 留一块位置来放其他的东西
    }, {
        xtype: 'list',
        itemId: 'ChatList',
        flex: 1,
        store: {
            type: 'RecentChatList'
        },
        itemTpl: [
            '<div class="">{chat.chat_name}</div>'
        ].join(''),

        listeners: {
            childTap: 'onSelChatList'
        }
    }]
});