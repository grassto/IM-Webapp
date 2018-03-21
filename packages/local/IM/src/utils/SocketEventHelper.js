/**
 * 这些信息最后可以由排序来组织到
 */
Ext.define('IM.utils.SocketEventHelper', {
    alternateClassName: 'SocketEventHelper',
    singleton: true,
    /* ******************************** posted *********************************************/

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
            fileIDs = [], // 要改
            userName = ChatHelper.getName(data.user_id),
            flag = true; // 缓存中是否需要新增频道,是true，否false

        // 首先判断人，再判断是否存在频道

        const IMView = Ext.Viewport.lookup('IM');

        // debugger;
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
                ChatHelper.addChatToRecent(data.chat_id);

                me.notify('多人会话：' + userName, data.message);
            }

            // 选中的不是当前频道，给未读通知
            if (User.ownerID != data.user_id) { // 不是自己发的
                if (User.crtChannelId !== cid) {
                    me.promptUnRead(cid, IMView);
                } else { // 在当前频道，有未读数量，但是不展示
                    me.promptFakeRead(cid, IMView);
                }

            }

        }
        else if (msg.data.chat_type == 'D') { // 直接频道

            if (cName.indexOf(User.ownerID) > -1) {
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

                    ChatHelper.addChatToRecent(data.chat_id);

                    me.notify(userName, data.message);
                }


                // 选中的不是当前频道
                if (User.ownerID != data.user_id) {
                    if (User.crtChannelId !== cid) {
                        me.promptUnRead(cid, IMView);
                    } else { // 在当前频道，有未读数量，但是不展示
                        me.promptFakeRead(cid, IMView);
                    }
                }
            }
        }


        /* ****************************************** 当前频道，消息展示 ********************************************************************/
        if (data.msg_type == 'I') {
            text = '[' + data.attach_id + ']';
            fileIDs.push(data.attach_id);
        }
        // 若选中的是当前频道，则在聊天区展示数据
        if (User.crtChannelId == data.chat_id) {
            data.username = userName;
            User.posts.push(data);
            text = window.minEmoji(text);
            text = ParseHelper.parsePic(text, fileIDs);

            // var chatView = Ext.app.Application.instance.viewport.getController().getView().down('main #chatView');
            var chatView = IMView.lookup('im-main').down('#chatView'),
                chatStore = chatView.getStore(),
                record;

            if (User.ownerID == data.user_id) {
                record = chatStore.add({ ROL: 'right', senderName: data.username, sendText: text, updateTime: new Date(data.update_at) });
            }
            else {
                record = chatStore.add({ senderName: data.username, sendText: text, updateTime: new Date(data.update_at) });
            }

            /* ****************************************************** 滚动条 ******************************************************************************************************/
            ChatHelper.onScroll(chatView);

            // 根据store的最后一个时间来判断新的时间是否需要展示
            me.isShowTime(chatStore, record);

            if (data.msg_type == 'I') {

                var url = Config.httpUrlForGo + 'files/' + data.attach_id + '/thumbnail';
                // 图片若未加载完成，则显示loading,加载出现异常，显示默认图片
                window.imagess(url, data.attach_id);
            }
        }
        /* ****************************************************** 最近会话重新排序 ******************************************************************************************************/
        me.reSortRecentList(IMView);
    },

    /**
     * 消息通知
     * @param {string} senderName 发送者姓名
     * @param {string} sendText 发送的内容
     */
    notify(senderName, sendText) {
        if (!window.Notification) {
            alert('浏览器不支持通知！');
        }
        console.log(window.Notification.permission);
        if (window.Notification.permission != 'granted') {
            Notification.requestPermission(function (status) {
                // status是授权状态，如果用户允许显示桌面通知，则status为'granted'
                console.log('status: ' + status);
                //  permission只读属性:
                //  default 用户没有接收或拒绝授权 不能显示通知
                //  granted 用户接受授权 允许显示通知
                //  denied  用户拒绝授权 不允许显示通知
                var permission = Notification.permission;
                console.log('permission: ' + permission);
            });
        }
        if (Notification.permission === 'granted') {
            var n = new Notification(senderName,
                {
                    'icon': 'resources/images/LOGO1.png',
                    'body': sendText // body中不能放html
                }
            );
            n.onshow = function () {
                console.log('显示通知');
                setTimeout(function () {
                    n.close();
                }, 8000);
            };
            n.onclick = function () {
                window.focus();
                n.close();
            };
            n.onclose = function () {
                console.log('通知关闭');
            };
            n.onerror = function () {
                console.log('产生错误');
            };
        }
    },

    /**
     * 提示未读
     * @param {string} cid 用户id
     */
    promptUnRead(cid, IMView) {
        var store = IMView.down('#recentChat').getStore(),
            record = store.getById(cid);
        record.set('isUnRead', true);
        record.set('unReadNum', record.get('unReadNum') + 1);
    },

    // 在当前频道，有未读数量，但是不展示
    promptFakeRead(cid, IMView) {
        var store = IMView.down('#recentChat').getStore(),
            record = store.getById(cid);
        record.set('isUnRead', false);
        record.set('unReadNum', record.get('unReadNum') + 1);
    },

    // 最近会话重新排序
    reSortRecentList(IMView) {
        var list = IMView.down('#recentChat'),
            listStore = list.getStore();

        // listStore.sort('last_post_at', 'DESC');
        listStore.sort();
    },

    /**
     * 根据上一个时间判断是否要展示时间，一分钟内不显示
     * @param {*} chatStore 聊天展示也数据源
     * @param {*} record 新加入的数据
     */
    isShowTime(chatStore, record) {
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
    },


    /* ******************************** group_added *********************************************/

    // 还得判断是否在当前频道
    handleGrpAddEvent(msg) {
        const me = this,
            data = msg.data;

        var grpAddMsg = [],
        GrpChangeMsg = '';

        // 首先判断创建者是否是自己
        if (data.creator_id == User.ownerID) { // 是自己，所有的操作都及时更新到页面上
            const chatView = Ext.Viewport.lookup('IM').lookup('im-main').down('#chatView'),
                chatStore = chatView.getStore();
            GrpChangeMsg = this.createOwnWelcomeMsg(data.creator_id, data.user_ids);

            var record = chatStore.add({
                updateTime: new Date(),
                GrpChangeMsg: GrpChangeMsg,
                showGrpChange: true
            });

            ChatHelper.onScroll(chatView);

            me.isShowTime(chatStore, record);

        } else { // 不是自己创建的，先判断页面上是否有此频道
            GrpChangeMsg = me.createOtherWelcomeMsg(data.creator_id, data.user_ids);

            if (me.hasChat(data.chat_id)) { // 有此频道，只有跟自己相关的信息才会展示

            } else { // 没有此频道，则组织缓存的数据，在接收到posted的时候，一并将缓存数据组织上去
                // User.grpAddedInfo.push({
                //     chatId: data.chat_id,
                //     grpChangeMsg: GrpChangeMsg
                // });
            }

        }

        // grpAddMsg.push(GrpChangeMsg);
        // 不管你有没有显示都加入缓存
        User.grpChgInfo.push({
            chatId: data.chat_id,
            grpAddMsg: GrpChangeMsg
        });
    },

    hasChat(chatID) {
        for (var i = 0; i < User.allChannels.length; i++) {
            if (User.allChannels[i].chat.chat_id == chatID) {
                return true;
            }
        }
        return false;
    },

    // 创建者拼凑信息
    createOwnWelcomeMsg(creatorID, memIDs) {
        var result = '',
            memNames = '',
            memName = '';

        for (var i = 0; i < memIDs.length; i++) {
            if(User.ownerID != memIDs[i]) {
                memName = ChatHelper.getName(memIDs[i]);

                if (memName !== '') { // 缓存中找到了，直接添加
                    if (i == 0) {
                        memNames = memName;
                    } else {
                        memNames = memNames + '、' + memName;
                    }
                } else { // 请求服务端去数据库中查找，然后加入数据进缓存
    
                }
            }
        }

        result = '你邀请' + memNames + '加入了群聊';
        return result;
    },

    /**
     * 拼凑被拉入人的提示信息
     * 通过id在缓存中查找出姓名，然后组织成：xxx邀请你和xxx、xxx加入群聊
     * @param {string} creatorID 创建者id
     * @param {Array} memIDs 参与人
     */
    createOtherWelcomeMsg(creatorID, memIDs) {
        var creatorName = ChatHelper.getName(creatorID),
            result = '',
            memNames = '',
            memName = '';

        for (var i = 0; i < memIDs.length; i++) {
            if (User.ownerID != memIDs[i] && creatorID != memIDs[i]) { // 创建者不加，自己不加，直接显示为你
                memName = ChatHelper.getName(memIDs[i]);

                if (memName !== '') { // 缓存中找到了，直接添加
                    if (i == 0) {
                        memNames = memName;
                    } else {
                        memNames = memNames + '、' + memName;
                    }
                } else { // 请求服务端去数据库中查找，然后加入数据进缓存

                }
            }
        }

        result = creatorName + '邀请你和' + memNames + '加入群聊';
        return result;
    },


/* ******************************** member_removed *********************************************/

    handleMemRemoveEvent(msg) {
        const me = this,
            data = msg.data;

        var removeMemMsg = '';
        // 分三种情况，移除者，被移除者，其余人
        if(data.remover_id == User.ownerID) { // 移除者
            removeMemMsg = me.createMeRemoveSBMsg(data.remover_id, data.user_id);
        } else if(data.user_id == User.ownerID) { // 被移除者
            removeMemMsg = me.createSBRemoveMeMsg(data.remover_id, data.user_id);
        } else { // 其他人
            removeMemMsg = me.createSBRemoveSBMsg(data.remover_id, data.user_id);
        }

        

    },

    createMeRemoveSBMsg(removerID, userID) {

    },
    createSBRemoveMeMsg(removerID, userID) {

    },
    createSBRemoveSBMsg(removerID, userID) {

    }
});