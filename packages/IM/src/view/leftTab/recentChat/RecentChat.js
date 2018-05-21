Ext.define('IM.view.leftTab.recentChat.RecentChat', {
    extend: 'IMCommon.view.RctChat',
    xtype: 'recentChat',
    requires: [
        'IM.view.leftTab.recentChat.RecentChatController'
    ],

    controller: 'recentChat',

    initialize() {
        const me = this;
        me.callParent(arguments);

        me.element.on({
            delegate: '.x-listitem',
            contextmenu: 'onContextmenu',
            scope: me
        });

    },

    listeners: {
        childTap: 'onSelRecentMem'
    },

    // 鼠标右击事件
    onContextmenu(e, el) {
        const me = this;

        // 根据节点上的数据进行数据绑定，方便操作
        var recordIndex = el.getAttribute('data-recordindex'),
            record = me.getStore().getAt(recordIndex);

        if (record) {
            var chatId = record.get('chat_id');
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
        if (toTop) {
            isTopText = '取消置顶';
        }

        return isTopText;
    }
});