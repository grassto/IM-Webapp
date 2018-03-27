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

    // 最近会话移除
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

                    // ChatHelper.on
                }
            }
        });
    },

    // 多人会话人员列表移除人员
    hideChatMember(chatID, userID, store) {
        const me = this;
        Ext.Msg.confirm('移除', '确定要移出吗', function (ok) {
            if (ok === 'yes') {
                Utils.ajaxByZY('DELETE', 'chats/' + chatID + '/members/' + userID, {
                    success: function (data) {
                        if (data.status == 'OK') {
                            var record = store.getById(userID);

                            store.remove(record);

                            // 处理内存数据，之后做
                            me.hChatCheAfterHideChatMem(chatID, userID);
                        } else {
                            Utils.toastShort('你没有权限踢出用户');
                        }
                    }
                });
            }
        });
    },

    /**
     * 删除缓存User.allChannels中的成员信息
     * @param {string} chatID
     * @param {string} userID
     */
    hChatCheAfterHideChatMem(chatID, userID) {
        for (var i = 0; i < User.allChannels.length; i++) {
            if (User.allChannels[i].chat.chat_id == chatID) {
                for (var j = 0; j < User.allChannels[i].members.length; j++) {
                    if (User.allChannels[i].members[j].user_id == userID) {
                        User.allChannels[i].members.splice(j, 1);
                    }
                }
            }
        }
    },

    /**
    * 是否进行@查询
    * @returns bool
    */
    isShowAt() {
        const store = Ext.Viewport.lookup('IM').down('#recentChat').getStore(),
            record = store.getById(User.crtChannelId);

        if (record) {
            if (record.getData().type != 'D') {
                return true;
            }
        }

        return false;
    }
});