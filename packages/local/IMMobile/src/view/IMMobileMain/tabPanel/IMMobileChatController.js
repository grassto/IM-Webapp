Ext.define('IMMobile.view.IMMobileMain.tabPanel.IMMobileChatController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.IMMobileChatController',
    /**
     * Called when the view is created
     */
    init: function () {
        // this.getView().down('#ChatList').getStore().load({
        //     scope: this,
        //     callback: function(records, operation, success) {
        //         debugger;
        //         console.log(records);
        //     }
        // });
        this.getAllChats();
    },

    getAllChats() {
        const me = this,
            view = me.getView(),
            store = view.down('#ChatList').getStore();

        Utils.mask(view);
        Utils.ajaxByZY('get', 'users/me/chats', {
            success: function (data) {
                console.log('所有频道：', data);

                // CEFHelper.initNotice(data);

                // me.pushChatToCache(data);

                // BindHelper.loadRecentChat(recView);
                store.add(data);

                Utils.unMask(view);
            }
        });
    }

});