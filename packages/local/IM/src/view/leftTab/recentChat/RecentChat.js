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
        '<div chat_id="{id}" class="itemRight" style="line-height:38px;">',
        '<a class="avatar link-avatar firstletter " letter="{[AvatarMgr.getFirstLetter(values.name)]} " style="float:left;{[AvatarMgr.getColorStyle(values.name)]}">',
        '</a>',
        '<a class="RecentUnRead" unRead="{unReadNum}" style="display:{[values.isUnRead?"block":"none"]}"></a>',
        '{name}',
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

            var chatId = el.getAttribute('chat_id'),
                isTopText = me.onTopParse(el);

            var menu = Ext.create('Ext.menu.Menu', {
                items: [{
                    text: isTopText,
                    handler: function (btn) {
                        // debugger;
                        var date = new Date();
                        if (btn.getText() == '取消置顶') {
                            date = null;
                        }
                        var store = me.getStore(),
                            record = store.getById(chatId);
                        record.set('toTop', date);
                        store.sort();
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
    onTopParse(el, chatId) {
        // 将chat_id记录在内存中
        var isTopText = '置顶';

        // 先判断是否置顶
        if (chatId == User.rightClickChat) {
            isTopText = '取消置顶';
        } else {
            // User.rightClickChat.push(chatId);
            User.rightClickCha = chatId;
        }

        return isTopText;
    }
});