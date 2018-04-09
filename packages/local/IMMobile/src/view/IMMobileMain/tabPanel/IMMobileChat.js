Ext.define('IMMobile.view.IMMobileMain.tabPanel.IMMobileChat', {
    extend: 'Ext.Panel',
    xtype: 'IMMobile-Chat',

    requires: [
        'IMMobile.view.IMMobileMain.tabPanel.IMMobileChatController',
        'IMCommon.store.RecentChatList'
    ],

    controller: 'IMMobileChatController',

    items: [{
        xtype: 'component' // 留一块位置来放其他的东西
    }, {
        xtype: 'list',
        itemId: 'ChatList',
        store: {
            type: 'RecentChatList'
        },
        itemTpl: [
            '<div class="">{chat.chat_name}</div>'
        ].join('')
    }]
});