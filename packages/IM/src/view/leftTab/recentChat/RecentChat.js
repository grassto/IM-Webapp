Ext.define('IM.view.leftTab.recentChat.RecentChat', {
    extend: 'Ext.List',
    xtype: 'recentChat',
    requires: [
        'IM.model.RecentSelMem',
        'IM.view.leftTab.recentChat.RecentChatController'
    ],

    controller: 'recentChat',

    store: {
        model: 'IM.model.RecentSelMem',

        sorters: [{
            property: 'toTop',
            direction: 'DESC'
        }, { // 按时间降序排序
            property: 'last_post_at',
            direction: 'DESC'
        }]
    },

    initialize() {
        const me = this;
        me.callParent(arguments);

        me.element.on({
            delegate: '.x-listitem',
            contextmenu: 'onContextmenu',
            scope: me
        });

        me.getStore().on({
            add : 'onStoreChg',
            update : 'onStoreChg',
            destroyable: true,
            scope: me
        });
    },
    onStoreChg(store, records, index, eOpts) {
        // debugger;
        store.sort();
    },


    itemTpl: [
        '<div class="itemRight">',
            '<div class="wrapAva">',
                '<tpl if="values.type == \'D\'">', // 头像
                    '<a class="avatar link-avatar firstletter " letter="{[AvatarMgr.getFirstLetter(values.name)]} " style="{[AvatarMgr.getColorStyle(values.name)]}"></a>',
                '<tpl else>',
                    '<div class="mergeAvatar" style="float:left;{[AvatarMgr.getColorStyle(values.name)]}">',
                    '{[AvatarMgr.getMergeDiv(values.name)]}',
                    '</div>',
                '</tpl>',
                '<a class="RecentUnRead" unRead="{unReadNum}" style="cursor:default;display:{[values.isUnRead?"block":"none"]}"></a>', // 未读
            '</div>',
            '<div class="evt">',
                '<p>{last_post_at}</p></br>', // 最后发送时间
                '<p style="display:{[values.type=="D"?"block":"none"]};">{status}</p>', // 状态（不需要了吧）
            '</div>',
            '<div class="displayInfo">',
                '<div class="displayName">{name}</div>', // 会话标题
                '<tpl if="values.type == \'D\'">', // 显示会话内容
                    '<tpl if="values.last_msg_type == \'T\'">',
                        '<div>{last_post_msg}</div>', // 文字
                    '<tpl elseif="values.last_msg_type == \'F\'">',
                        '<div>[文件]</div>', // 文件
                    '<tpl elseif="values.last_msg_type == \'I\'">',
                        '<div>[图片]</div>', // 图片
                    '</tpl>',
                '<tpl else>',
                    '<tpl if="values.last_msg_type == \'T\'">',
                        '<div>{last_post_userName}：{last_post_msg}</div>', // 文字
                    '<tpl elseif="values.last_msg_type == \'I\'">',
                        '<div>{last_post_userName}：[图片]</div>', // 图片
                    '<tpl elseif="values.last_msg_type == \'F\'">',
                        '<div>{last_post_userName}：[文件]</div>', // 文件
                    '</tpl>',
                '</tpl>',
            '</div>',
        '</div>'
    ].join(''),

    listeners: {
        childTap: 'onSelRecentMem'
    },

    // 鼠标右击事件
    onContextmenu(e, el) {
        const me = this;
        // debugger;

        // // 这个样式只是为了判断其是否为item的右击
        // if (t.hasCls('itemRight')) {
        //     // 根据节点上的数据进行数据绑定，方便操作
        //     var chatId = t.getAttribute('chat_id'),
        //         toTop = t.getAttribute('toTop'),
        //         isTopText = me.onTopParse(toTop);

        //     var menu = Ext.create('Ext.menu.Menu', {
        //         // .x-menu-item-icon { display: none; }
        //         items: [/*{
        //             text: isTopText,
        //             handler: function (btn) {
        //                 var topIndex,
        //                     store = me.getStore(),
        //                     record = store.getById(chatId);

        //                 if (btn.getText() == '取消置顶') {
        //                     PreferenceHelper.setRecentTop(chatId, -1);
        //                     topIndex = null;
        //                 } else {
        //                     topIndex = PreferenceHelper.toTopAddOne();
        //                     PreferenceHelper.setRecentTop(chatId, topIndex);
        //                 }
        //                 record.set('toTop', topIndex);

        //                 store.sort('toTop', 'DESC');
        //             }
        //         }, */{
        //                 text: '移除会话',
        //                 handler: function () {
        //                     PreferenceHelper.hideChat(chatId);
        //                 }
        //             }]
        //     });
        //     menu.showAt(e.getPoint());
        // }


        // 这个样式只是为了判断其是否为item的右击

        // 根据节点上的数据进行数据绑定，方便操作
        var recordIndex = el.getAttribute('data-recordindex'),
            record = me.getStore().getAt(recordIndex);

        if (record) {
            var chatId = record.get('id');
            var menu = Ext.create('Ext.menu.Menu', {
                width: 80,
                items: [{
                    text: '移除会话',
                    handler: function () {
                        PreferenceHelper.hideChat(chatId);
                    }
                }]
            });

            menu.showAt(e.getPoint());
        } else {
            Utils.toastShort('程序出错了');
        }

        e.preventDefault();
    },

    // 有关置顶消息的内存数据操作
    onTopParse(toTop) {
        var isTopText = '置顶';

        // 先判断是否置顶
        if (toTop > 0) {
            isTopText = '取消置顶';
        }

        return isTopText;
    }
});