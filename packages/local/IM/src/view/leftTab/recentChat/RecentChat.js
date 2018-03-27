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
    },


    itemTpl: [
        '<div toTop="{toTop}" chat_id="{id}" class="itemRight" style="line-height:38px;white-space:nowrap;cursor:default;overflow:hidden;text-overflow:ellipsis;">',
        '<tpl if="values.type == \'D\'">',
        '<a class="avatar link-avatar firstletter " letter="{[AvatarMgr.getFirstLetter(values.name)]} " style="float:left;{[AvatarMgr.getColorStyle(values.name)]}">',
        '<tpl else>',
        '<div class="mergeAvatar" style="float:left;{[AvatarMgr.getColorStyle(values.name)]}">',
        '{[AvatarMgr.getMergeDiv(values.name)]}',
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