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
        // proxy: {
        //     type: 'ajax',
        //     url: Config.httpUrlForGo + 'users/me/channels'
        // }
    },

    initialize() {
        const me = this;
        me.callParent(arguments);

        me.element.on({
            // delegate: '.x-list-item',
            contextmenu: 'onContextmenu',
            scope: me
        });
    },


    itemTpl: [
        '<div toTop="{toTop}" chat_id="{id}" class="itemRight" style="line-height:38px;">',
        '<a class="avatar link-avatar firstletter " letter="{[AvatarMgr.getFirstLetter(values.name)]} " style="float:left;{[AvatarMgr.getColorStyle(values.name)]}">',
        '</a>',
        '<a class="RecentUnRead" unRead="{unReadNum}" style="cursor:default;display:{[values.isUnRead?"block":"none"]}"></a>',
        '<span style="cursor:default;">{name}</span>',
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
        const me = this,
            t = Ext.fly(e.target);

        // 这个样式只是为了判断其是否为item的右击
        if (t.hasCls('itemRight')) {
            // 根据节点上的数据进行数据绑定，方便操作
            var chatId = el.getAttribute('chat_id'),
                toTop = el.getAttribute('toTop'),
                isTopText = me.onTopParse(el, toTop);

            var menu = Ext.create('Ext.menu.Menu', {
                items: [{
                    text: isTopText,
                    handler: function (btn) {
                        

                        var topIndex,
                            store = me.getStore(),
                            record = store.getById(chatId);

                        if (btn.getText() == '取消置顶') {
                            PreferenceHelper.setRecentTop(chatId, -1);
                            topIndex = null;
                        } else {
                            topIndex = PreferenceHelper.toTopAddOne();
                            PreferenceHelper.setRecentTop(chatId, topIndex);
                        }
                        record.set('toTop', topIndex);

                        store.sort('toTop', 'DESC');
                    }
                }/*, {
                    text: '消息不提醒'
                }, {
                    text: '移除'
                }, {
                    text: '清空聊天记录'
                }*/]
            });
            menu.showAt(e.getPoint());
        }

        e.preventDefault();
    },

    // 有关置顶消息的内存数据操作
    onTopParse(el, toTop) {
        // 将chat_id记录在内存中
        var isTopText = '置顶';

        // 先判断是否置顶
        if (toTop > 0) {
            isTopText = '取消置顶';
        }

        return isTopText;
    }
});