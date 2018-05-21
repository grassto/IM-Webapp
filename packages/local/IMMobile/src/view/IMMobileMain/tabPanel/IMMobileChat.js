Ext.define('IMMobile.view.IMMobileMain.tabPanel.IMMobileChat', {
    extend: 'Ext.Panel',
    xtype: 'IMMobile-Chat',

    requires: [
        'IMMobile.view.IMMobileMain.tabPanel.IMMobileChatController',
        'IMCommon.view.RctChat',
        'IMCommon.model.RctChat',
        'IMMobile.view.widget.Navbar' // 含有返回按钮的头
    ],

    controller: 'IMMobileChatController',

    layout: 'vbox',
    cls: 'IMMobile-chat-container',

    items: [{
        xtype: 'IMMobile-Navbar',
        backBtn: false,
        titleMsg: '消息',
        items: [{
            iconCls: 'x-fa fa-plus',
            align: 'right',
            arrow: false,
            menu: {
                items: [{
                    text: '发起群聊',
                    // iconCls: 'x-fa fa-comment',
                    handler: 'onStartGrpChat'
                }]
            }
        }]
    }, {
        xtype: 'component' // 留一块位置来放其他的东西
    }, {
        xtype: 'rctChat',
        itemId: 'ChatList',
        cls: 'IMMobile-RecentChat',
        flex: 1,

        listeners: {
            childTap: 'onSelChatList'
        }
    }]
});