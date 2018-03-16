Ext.define('IM.utils.SocketEventHelper', {
    alternateClassName: 'SocketEventHelper',
    singleton: true,

    /**
     * websocket接收请求后执行，将数据绑定至页面
     * @param {object} msg 服务器返回的数据
     */
    handleNewPostEvent(msg) {
        var me = this,
            data = JSON.parse(msg.data.message),
            cName = msg.data.chat_name,
            cid = msg.broadcast.chat_id,
            text = data.message,
            userName = me.getName(data.user_id),
            flag = true; // 缓存中是否需要新增频道,是true，否false

        
        /* ****************************************** 未读提示 ********************************************************************/
        if (msg.data.chat_type == 'G') {

            // 当前页面是否有该频道
            for (var i = 0; i < User.allChannels.length; i++) {
                if (User.allChannels[i].chat.chat_id == cid) {
                    flag = false;

                    if (data.user_id !== User.ownerID) { // 不是自己发的
                        me.notify('多人会话：' + userName, data.message);
                    }

                    break;
                }
            }

            if (flag) {
                User.allChannels.push({
                    chat: {
                        channelname: userName,
                        chat_id: cid,
                        chat_name: cName,
                        chat_type: msg.data.chat_type
                    },
                    members: {
                        chat_id: cid,
                        user_id: data.user_id
                    }
                });
                // User.allChannels.push({ id: cid, name: cName });
                var channelStore = me.getView().down('#recentChat').getStore(),
                    chatName;
                if (msg.data.chat_name.length > 8) {
                    chatName = msg.data.chat_name.substr(0, 8) + '...';
                }
                channelStore.insert(0, {
                    id: cid,
                    name: chatName,
                    isUnRead: true,
                    unReadNum: 0,
                    last_post_at: new Date(data.update_at)
                });

                me.notify('多人会话：' + userName, data.message);
            }

            // 选中的不是当前频道，给未读通知
            if (User.crtChannelId !== cid) {
                me.promptUnRead(cid);
            }


        }
        else if (msg.data.chat_type == 'D') { // 直接频道
            // if(data.user_id !== User.ownerID) {// 是不是自己发送的

            if (cName.indexOf(User.ownerID) > -1) { // 
                // 当前缓存中的所有频道中包含该频道
                for (var i = 0; i < User.allChannels.length; i++) {
                    // 找到了,给未读提示，直接退出
                    if (User.allChannels[i].chat.chat_id == cid) {
                        flag = false;

                        if (data.user_id !== User.ownerID) { // 不是自己发的
                            me.notify(userName, data.message);
                        }
                        break;
                    }
                }
                // 未找到相同的channelid，则添加
                if (flag) {
                    User.allChannels.push({
                        chat: {
                            channelname: userName,
                            chat_id: cid,
                            chat_name: cName,
                            chat_type: msg.data.chat_type

                            // create_at

                            // creator_id

                            // delete_at

                            // header
                            // purpose

                            // update_at
                        },
                        members: {
                            chat_id: cid,
                            user_id: data.user_id
                        }
                    });
                    // User.allChannels.push({ id: cid, name: cName });
                    var channelStore = me.getView().down('#recentChat').getStore();
                    channelStore.insert(0, {
                        id: cid,
                        name: userName,
                        isUnRead: true,
                        unReadNum: 0,
                        last_post_at: new Date(data.update_at)
                    });

                    me.notify(userName, data.message);
                }


                // 选中的不是当前频道
                if (User.crtChannelId !== cid) {
                    me.promptUnRead(cid);

                    // me.resetLastPostTime(userName, new Date(data.update_at));

                }
            }
        }


        /* ****************************************** 当前频道，消息展示 ********************************************************************/
        // 若选中的是当前频道，则在聊天区展示数据
        if (User.crtChannelId == data.chat_id) {
            data.username = userName;
            User.posts.push(data);
            text = window.minEmoji(text);
            text = ParseHelper.parsePic(text, data.files);

            // var chatView = Ext.app.Application.instance.viewport.getController().getView().down('main #chatView');
            var chatView = me.getView().lookup('im-main').down('#chatView'),
                chatStore = chatView.getStore(),
                record;

            if (User.ownerID == data.user_id) {
                record = chatStore.add({ ROL: 'right', senderName: data.username, sendText: text, updateTime: new Date(data.update_at) });
            }
            else {
                record = chatStore.add({ senderName: data.username, sendText: text, updateTime: new Date(data.update_at) });
            }

            /* ****************************************************** 滚动条 ******************************************************************************************************/
            me.onScroll(chatView);

            // 根据store的最后一个时间来判断新的时间是否需要展示
            if (chatStore.data.items.length > 1) {
                var lastUpdateTime = chatStore.data.items[chatStore.data.items.length - 2].data.updateTime;
                if (record[0].data.updateTime == lastUpdateTime) {
                    record[0].set('showTime', false);
                }
            } else {
                if (chatStore.data.items.length == 1) {
                    var lastUpdateTime = chatStore.data.items[0].data.updateTime;
                    if (record[0].data.updateTime == lastUpdateTime) {
                        record[0].set('showTime', false);
                    }
                }
            }
        }
        /* ****************************************************** 最近会话重新排序 ******************************************************************************************************/
        me.reSortRecentList();
    },
});