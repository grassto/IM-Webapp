Ext.define('IMMobile.view.IMMobileMain.tabPanel.IMMobileChat', {
    extend: 'Ext.Panel',
    xtype: 'IMMobile-Chat',

    requires: [
        'IMMobile.view.IMMobileMain.tabPanel.IMMobileChatController',
        // 'IMMobile.store.RecentChatList',
        'IMCommon.model.ChatOld',
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
        xtype: 'list',
        itemId: 'ChatList',
        cls: 'IMMobile-RecentChat',
        flex: 1,
        store: {
            model: 'IMCommon.model.ChatOld',
            sorters: [{
                property: 'toTop',
                direction: 'DESC'
            }, { // 按时间降序排序
                property: 'last_post_at',
                direction: 'DESC'
            }],
            listeners: {
                add: 'onStoreChg',
                update: 'onStoreChg'
            },

            onStoreChg(store, records, index, eOpts) {
                store.sort();
            }
        },
        itemTpl: [
            '<div toTop="{toTop}" chat_id="{id}" class="itemRight" style="line-height:38px;white-space:nowrap;cursor:default;overflow:hidden;text-overflow:ellipsis;">',
        '<tpl if="values.type == \'D\'">',
        '<a class="avatar link-avatar firstletter " letter="{[AvatarUtil.getFirstLetter(values.name)]} " style="float:left;{[AvatarUtil.getColorStyle(values.name)]}">',
        '<tpl else>',
        '<div class="mergeAvatar" style="float:left;{[AvatarUtil.getColorStyle(values.name)]}">',
        '{[AvatarUtil.getMergeDiv(values.name)]}',
        '</div>',
        '</tpl>',
        '<a class="RecentUnRead" unRead="{unReadNum}" style="cursor:default;display:{[values.isUnRead?"block":"none"]}"></a>',
        // '<div style="white-space:nowrap;cursor:default;overflow:hidden;text-overflow:ellipsis;{[values.type=="D"?"float:left;":""]}">{name}</div>',
        '{name}',
        '<div style="float:right;display:{[values.type=="D"?"block":"none"]};">',
        '{status}',
        '</div>',
        '</div>'
        ].join(''),

        listeners: {
            childTap: 'onSelChatList'
        }
    }]
});