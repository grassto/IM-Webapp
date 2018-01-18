Ext.define('IM.view.leftTab.recentChat.RecentChatController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.recentChat',

    init() {
        var store = this.getView().getStore();
        for (var i = 0; i < 10; i++) {
            store.add({ id: i, name: 'z' + i + 'zyy' });
        }
    },

    /**
     * 最近会话选中事件
     */
    onSelRecentMem() {
        const rootView = this.getView().up('IM'),
            imMainView = rootView.lookup('im-main');
        if(!imMainView) { // 存在了就不切换
            var detailsView = rootView.lookup('details'),
                blankView = rootView.lookup('pageblank');
            if(blankView) { // 不存在im-main容器，则添加
                this.fireEvent('showRight', 'im-main', 'pageblank');
            }
            if(detailsView) {
                this.fireEvent('showRight', 'im-main', 'details');
            }
        }
    }
});