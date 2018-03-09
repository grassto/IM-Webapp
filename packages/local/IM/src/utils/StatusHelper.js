Ext.define('IM.utils.StatusHelper', {
    alternateClassName: 'StatusHelper',
    singleton: true,

    handleRecentList() {
        var recentChatView = Ext.Viewport.down('IM').down('#recentChat'),
            recStore = recentChatView.getStore(),
            items = recStore.getData().items,
            status;

        for (var i = 0; i < items.length; i++) {
            if (items[i].data.type == 'D') {
                status = this.getStatus(this.getUserIDByChatName(items[i].data.chat_name));
                items[i].set('status', status);
            }
        }
    },

    getUserIDByChatName(cName) {
        var ids = cName.split('__');
        for (var i = 0; i < ids.length; i++) {
            if (ids[i] !== User.ownerID) {
                return ids[i];
            }
        }
    },

    getStatus(id) {
        for (var i = 0; i < User.allStatus.length; i++) {
            if (User.allStatus[i].user_id == id) {
                return User.allStatus[i].user_status;
            }
        }
        return '没找到';
    }


});