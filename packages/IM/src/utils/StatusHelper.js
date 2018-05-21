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

    getStatus(userId) {
        if(!User.allStatus) return '';
        for (var i = 0; i < User.allStatus.length; i++) {
            if (User.allStatus[i].user_id == userId) {
                return User.allStatus[i].user_status;
            }
        }
        return '';
    },

    /**
     * 右侧标题头的状态设置，单人显示，多人隐藏
     * @param {int} statusStr 在线，离线
     * @param {string} isShowStr inline：展示，none：隐藏
     */
    setRightStatus(statusStr, isShowStr) {
        var viewModel = Ext.Viewport.lookup('IM').getViewModel();
        viewModel.set({
            showStatus: isShowStr,
            status: statusStr
        });
    }


});