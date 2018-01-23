Ext.define('IM.view.rightContainer.IMMainViewController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.im-right-main',

    onShowGrpSel() {
        this.fireEvent('grpSel');
    },

    listen: {
        controller: {
            'recentChat': {
                'openCnl': 'onOpenChannel'
            },
            'left-orgController': {
                'openChat': 'onOpenChat'
            }
        }
    },


    /* ********************************recentChat****************************************/

    /**
     * 打开会话，获取历史记录进行绑定
     * @param {string} crtChannelID 当前选中的频道ID
     */
    onOpenChannel(crtChannelID) {
        User.crtChannelId = crtChannelID;
        // debugger;

        var me = this,
            chatView = me.getView().down('#chatView'),
            message;
        var chatStore = chatView.store;
        chatStore.removeAll();
        Utils.ajaxByZY('get', 'channels/' + crtChannelID + '/posts', {
            success: function (data) {
                var order = data.order,
                    posts = data.posts;
                User.posts = [];
                for (var i = order.length - 1; i >= 0; i--) {
                    posts[order[i]].username = me.getName(posts[order[i]].user_id);
                    User.posts.push(posts[order[i]]);
                    message = me.textToHtml(posts[order[i]].message);

                    if (posts[order[i]].file_ids) {
                        for (var j = 0; j < posts[order[i]].file_ids.length; j++) {
                            // 若是自己发送的消息，则靠右排列
                            if (posts[order[i]].user_id == User.ownerID) {
                                chatStore.add({ ROL: 'right', senderName: posts[order[i]].username, sendText: message, updateTime: new Date(posts[order[i]].update_at), file: Config.httpUrlForGo + '/files/' + posts[order[i]].file_ids[j] + '/thumbnail' });
                            }
                            else {
                                chatStore.add({ senderName: posts[order[i]].username, sendText: message, updateTime: new Date(posts[order[i]].update_at), file: Config.httpUrlForGo + '/files/' + posts[order[i]].file_ids[j] + '/thumbnail' });
                            }
                        }
                    }
                    else {
                        if (posts[order[i]].user_id == User.ownerID) {
                            chatStore.add({ ROL: 'right', senderName: posts[order[i]].username, sendText: message, updateTime: new Date(posts[order[i]].update_at) });
                        }
                        else {
                            chatStore.add({ senderName: posts[order[i]].username, sendText: message, updateTime: new Date(posts[order[i]].update_at) });
                        }
                    }
                }

                me.onScroll(chatView);
            }
        });
    },

    /**
     *  根据id获取昵称
     * @param {string} uid 用户id
     */
    getName(uid) {
        for (var i = 0; i < User.allUsers.length; i++) {
            if (User.allUsers[i].id === uid) {
                return User.allUsers[i].nickname;
            }
        }
        return '';
    },

    /**
     * 聊天展示区，滚动条自动滚动到最下方
     * @param {object} chatView 容器
     */
    onScroll(chatView) {
        var sc = chatView.getScrollable(),
            scHeight = sc.getScrollElement().dom.scrollHeight;
        sc.scrollTo(0, scHeight + 1000);
    },

    // 替换字符串中的回车
    textToHtml(text) {
        return text.replace(/\n/g, '<br/>').replace(/\r/g, '<br/>').replace(/\r\n/g, '<br/>');
    },



    /* ********************************left-orgController****************************************/
    /**
     * 若选中的人无频道，则添加频道，若有，则直接获取历史消息
     */
    onOpenChat() {
        var record = this.getViewModel().get('orgSelRecord');
        if (record.data.leaf) {
            var me = this,
                uid = record.data.id;
            User.crtSelUserId = uid;

            var channelId = me.getChannelId(uid);
            if (channelId !== '') {
                // 获取历史消息
                console.log('存在,获取历史消息');
                me.onOpenChannel(channelId);
            } else {
                console.log('不存在，创建会话');
                // 创建会话
                Utils.ajaxByZY('post', 'channels/direct', {
                    params: JSON.stringify([User.crtUser.id, uid]),
                    success: function (data) {
                        // debugger;
                        User.allChannels.push(data);
                        var channelStore = me.getView().up('IM').down('#left_members').getStore();
                        channelStore.add({
                            id: data.id,
                            name: record.data.nickname
                        });
                        me.onOpenChannel(data.id);
                    },
                    failure: function (data) {
                        // debugger;
                        alert('创建出错');
                    }
                });
            }
        }
    },

    /**
     * 根据id来判断是否有频道存在
     * @param {sting} uid 选中的用户ID
     */
    getChannelId(uid) {
        var me = this;
        if (User.allChannels) {
            for (var i = 0; i < User.allChannels.length; i++) {
                if (User.allChannels[i].name.indexOf(uid) > -1) {
                    return User.allChannels[i].id;
                }
            }
        }
        return '';
    },



    /* ********************************消息发送****************************************/

    onSend() {
        var me = this,
            fileIds = [];
        for (var i = 0; i < User.files.length; i++) {
            fileIds.push(User.files[i].id);
        }

        var textAreaField = me.getView().down('richEditor'),
            sendText = textAreaField.inputElement.dom.value;// 内容
        sendText = me.onParseMsg(sendText);
        // sendText = textAreaField.getValue();// 内容
        // 判断是否有内容或文件
        if (fileIds.length > 0 || sendText) {
            let message = {
                channel_id: User.crtChannelId,
                create_at: 0,
                file_ids: fileIds,
                message: sendText,
                pending_post_id: '',
                update_at: new Date().getTime()
            };

            Utils.ajaxByZY('post', 'posts', {
                params: JSON.stringify(message),
                success: function (data) {
                    console.log('发送成功', data);
                    User.files = [];
                }
            });

            textAreaField.clear();
        }
    },

    // 消息解析
    onParseMsg(sendText) {
        return sendText;
    }
});