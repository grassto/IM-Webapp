Ext.define('IM.utils.PreferenceHelper', {
    alternateClassName: 'PreferenceHelper',
    singleton: true,

    toTopArray: [],
    toTop: '1',

    setRecentTop(chatId, toTopIndex) {
        var me = this,
            result = false;

        var params = [{
            user_id: User.ownerID,
            category: 'chat_order',
            name: chatId,
            value: toTopIndex + ''
        }];

        // Utils.ajaxByZY('PUT', 'users/' + User.ownerID + '/Preferences', {
        Utils.ajaxByZY('PUT', 'users/me/Preferences', {
            async: false,
            params: JSON.stringify(params),
            success: function (data) {
                if (data.status == 'OK') {
                    if (toTopIndex > 0) {
                        result = true;
                    }
                }
            }
        });
        return result;
    },

    /**
     * PreferenceHelper.toTop + 1
     */
    toTopAddOne() {
        var res;
        res = parseInt(PreferenceHelper.toTop); // 字符串转数字
        res += 1;
        PreferenceHelper.toTop = res + ''; // 数字转字符串
        return res;
    },

    hideChat(chatId) {
        Utils.ajaxByZY('PUT', 'chats/' + chatId + '/hide', {
            success: function (data) {
                if (data.status == 'OK') {
                    console.log('会话移除成功');
                    var view = Ext.Viewport.lookup('IM').down('#recentChat'),
                        store = view.getStore(),
                        record = store.getById(chatId);

                    store.remove(record); // 最近会话移除

                    // 若还有最近会话，则跳转到第一个
                    if (store.data.items.length > 0) {
                        record = store.getAt(0);
                        var type = record.get('type'),
                            id = record.get('id');
                        view.setSelection(record);
                        if (type == 'D') {
                            ChatHelper.openDirectChat(id);
                        } else if (type == 'G') {
                            ChatHelper.openGroupChat(id);
                        }
                    } else {
                        ChatHelper.showRightView('pageblank');
                    }


                    // 处理内存
                    for (var i = 0; i < User.allChannels.length; i++) {
                        if (User.allChannels[i].chat.chat_id == chatId) {
                            User.allChannels.splice(i, 1);
                        }
                    }

                    ChatHelper.on
                }
            }
        });
    }
});