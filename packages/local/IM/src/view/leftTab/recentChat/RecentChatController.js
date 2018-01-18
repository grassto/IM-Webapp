Ext.define('IM.view.leftTab.recentChat.RecentChatController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.recentChat',

    init() {
        var store = this.getView().getStore();
        for (var i = 0; i < 10; i++) {
            store.add({ id: i, name: 'z' + i + 'zyy' });
        }
    },

    onSelRecentMem() {
        Ext.Msg.alert('标志', '异想天开');
    }
});