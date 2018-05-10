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
    handleNewPostEvent1(msg) {
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

        /* ****************************************** 未读提示 ********************************************************************/
        if (msg.data.chat_type == 'G') {

            // 当前页面是否有该频道
            for (var i = 0; i < User.allChannels.length; i++) {
                if (User.allChannels[i].chat.chat_id == cid) {
                    flag = false;

                    if (data.user_id !== User.ownerID) { // 不是自己发的
                        me.notify('多人会话：' + userName, data.message);
                        CEFHelper.addNotice(data, '多人会话：' + userName);
                    }
                    break;
                }
            }

            if (flag) {
                ChatHelper.addChatToRecent(data.chat_id);

                me.notify('多人会话：' + userName, data.message);
                CEFHelper.addNotice(data, '多人会话：' + userName);
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
                            CEFHelper.addNotice(data, userName);
                        }
                        break;
                    }
                }
                // 未找到相同的channelid，则添加
                if (flag) {

                    ChatHelper.addChatToRecent(data.chat_id);

                    me.notify(userName, data.message);
                    CEFHelper.addNotice(data, userName);
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

        // 若选中的是当前频道，则在聊天区展示数据
        if (User.crtChannelId == data.chat_id) {
            var ROL = '',
                afterAdd = true;
            if (User.ownerID == data.user_id) {
                ROL = 'right';
                afterAdd = false;
            }

            var chatView = IMView.lookup('im-main').down('#chatView'),
                chatStore = chatView.getStore(),
                record;
            if (data.msg_type == 'F') {
                if (User.ownerID !== data.user_id) {
                    record = chatStore.add({
                        msg_type: MsgType.FileMsg,
                        fileID: data.attach_id,
                        fileName: data.name,
                        fileSize: data.size,
                        fileStatus: 2,
                        senderName: userName,
                        updateTime: new Date(data.update_at)
                    });
                }
            } else {
                if (data.msg_type == 'T') {
                    text = window.minEmoji(text);
                } else if (data.msg_type == 'I') {
                    text = '<img id="' + data.attach_id + '" style="/*width:40px;height:40px;*/background:url(' + Ext.getResourcePath('images/loading.gif') +') no-repeat center center;" class="viewPic" src="' + Config.httpUrlForGo + 'files/' + data.attach_id + '/thumbnail">';
                }
                record = chatStore.add({ ROL: ROL, senderName: userName, sendText: text, updateTime: new Date(data.update_at) });
                if (data.msg_type == 'I') {
                    var url = Config.httpUrlForGo + 'files/' + data.attach_id + '/thumbnail';
                    // 图片若未加载完成，则显示loading,加载出现异常，显示默认图片
                    window.imagess(url, data.attach_id);
                }
            }


            if (afterAdd) {
                /* ****************************************************** 滚动条 ******************************************************************************************************/
                ChatHelper.onScroll(chatView);

                // 根据store的最后一个时间来判断新的时间是否需要展示
                me.isShowTime(chatStore, record);
            }


        }
        /* ****************************************************** 最近会话重新排序 ******************************************************************************************************/
        me.reSortRecentList(IMView, data);
    },

    /**
     * websocket接收请求后执行，将数据绑定至页面
     * @param {object} msg 服务器返回的数据
     */
    handleNewPostEvent2(msg) {
        const me = this,
            data = JSON.parse(msg.data.message);

        // 自己发送的就在本地展示,并且不给消息提醒
        if (data.user_id != User.ownerID) {
            // 区分一个在当前会话，和不在当前会话
            const view = Ext.Viewport.lookup('IM'), // 总容器
                recentChat = view.down('#recentChat'),
                mainView = view.lookup('im-main');
            if (!mainView) { // 不存在mainView
                ChatHelper.addChatToRecent(data.chat_id);
                var store = recentChat.getStore();
                // 最近会话提示未读
                me.promptUnRead(data, store);
                me.notifyWrapper(msg.data);
            } else {
                var chatView = mainView.down('#chatView'); // 聊天展示页面
                if (chatView && User.crtChannelId == data.chat_id) { // 有这个页面并且是当前会话

                    var store = chatView.getStore();

                    switch (data.msg_type) {
                        case MsgType.TextMsg:
                            me.addTextMsg(store, data);
                            break;
                        case MsgType.ImgMsg:
                            me.addImgMsg(store, data);
                            break;
                        case MsgType.FileMsg:
                            me.addFileMsg(store, data);
                            break;
                        default:
                            alert('暂未支持该类型：', data.msg_type);
                    }
                    store = recentChat.getStore();
                    me.promptFakeRead(data, store);
                } else { // 不在当前会话
                    // 判断频道，没有，加(最近会话列表)
                    var has = me.hasChat(data.chat_id);
                    if (!has) {
                        ChatHelper.addChatToRecent(data.chat_id);
                    }

                    var store = recentChat.getStore();
                    // 最近会话提示未读
                    me.promptUnRead(data, store);
                }

                me.notifyWrapper(msg.data);
            }

        }
    },

    handleNewPostEvent(msg) {
        const me = this,
            data = JSON.parse(msg.data.message);
        if (data.user_id != User.ownerID) { // 只要不是自己发的，就加

            data.user_name = msg.data.sender_name; // 发送者
            data.chat_type = msg.data.chat_type; // 会话类型（D/G）
            data.chat_name = msg.data.chat_name; // 会话名称
            // 本地客户端数据保存,IMMsg
            if (Config.isPC) {
                me.localNewMsg(data);
            }

            const view = Ext.Viewport.lookup('IM'), // 总容器
                recentChat = view.down('#recentChat'),
                mainView = view.lookup('im-main');
            // 先判断有没有这个chat
            if (me.hasRctChat(data.chat_id)) { // 有

                // 本地数据更新
                if (Config.isPC) {
                    LocalDataMgr.updateRctByWS(data);
                }

                var chatView = mainView.down('#chatView'); // 聊天展示页面
                if (chatView && User.crtChannelId == data.chat_id) { // 有这个页面并且是当前会话
                    var store = chatView.getStore();

                    switch (data.msg_type) {
                        case MsgType.TextMsg:
                            me.addTextMsg(store, data);
                            break;
                        case MsgType.ImgMsg:
                            me.addImgMsg(store, data);
                            break;
                        case MsgType.FileMsg:
                            me.addFileMsg(store, data);
                            break;
                        default:
                            alert('暂未支持该类型：', data.msg_type);
                    }
                    store = recentChat.getStore();
                    me.promptFakeRead(data, store);
                } else {
                    if(Config.isPC) {
                        LocalDataMgr.insertRctByWS(data);
                    }
                    me.promptUnRead(data, recentChat.getStore());
                }

            } else {
                ChatHelper.addChatToRecent(data.chat_id);
                me.promptUnRead(data, recentChat.getStore());
            }

            me.notifyWrapper(msg.data);// 未读提示
        }
    },

    /**
     * 根据不同的msg_type将数据组织好，通过统一入口存入本地数据库
     * @param {json} data
     */
    localNewMsg(data) {

        switch (data.msg_type) {
            case MsgType.TextMsg:
                
                break;
            case MsgType.ImgMsg:
                
                break;
            case MsgType.FileMsg:
                
                break;
            default:
                alert('暂未支持该类型：', data.msg_type);
        }
            

        LocalDataMgr.insertOMsg(data);
    },

    addTextMsg(store, data) {
        const text = window.minEmoji(data.message);
        store.add({
            msg_id: data.msg_id,
            senderName: data.user_name,
            sendText: text,
            updateTime: new Date(data.update_at),
            last_post_at: new Date(data.update_at),
            ROL: data.user_id == User.ownerID ? 'right' : ''
        });
    },
    addImgMsg(store, data) {
        // const text = ParseHelper.parseToPic(data.message, data.attach_id);
        var text = ImgMgr.parsePic(data.attach_id);
        store.add({
            msg_id: data.msg_id,
            senderName: ChatHelper.getName(data.user_id),
            sendText: text,
            updateTime: new Date(data.update_at),
            last_post_at: new Date(data.update_at),
            ROL: data.ROL
        });

        // var url = Config.httpUrlForGo + 'files/' + data.attach_id + '/thumbnail';
        // // 图片若未加载完成，则显示loading,加载出现异常，显示默认图片
        // window.imagess(url, data.attach_id);
    },
    addFileMsg(store, data) {
        store.add({
            msg_id: data.msg_id,
            msg_type: MsgType.FileMsg,
            fileID: data.attach_id,
            fileName: data.name,
            fileSize: data.size,
            fileStatus: 2,
            senderName: ChatHelper.getName(data.user_id),
            updateTime: new Date(data.update_at),
            last_post_at: new Date(data.update_at),
            ROL: data.ROL
        });
    },

    notifyWrapper(dataWrapper) {
        var me = this,
            data = JSON.parse(dataWrapper.message),
            userName = ChatHelper.getName(data.chat_id);
        if (dataWrapper.chat_type == ChatType.Direct) { // 单人
            me.notify(dataWrapper.sender_name, data.message);
            CEFHelper.addNotice(data, userName);
        } else if (dataWrapper.chat_type == ChatType.Group) { // 多人
            me.notify('多人会话：' + userName, data.message);
            CEFHelper.addNotice(data, '多人会话：' + userName);
        }
    },

    /**
     * 消息通知
     * @param {string} senderName 发送者姓名
     * @param {string} sendText 发送的内容
     */
    notify(senderName, sendText) {
        // this.showNewMsgByTitle(); // web版新消息提示
        if (!window.cefMain) {

            if (!window.Notification) {
                console.log('浏览器不支持通知！');
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
        }
    },
    showNewMsgByTitle() {
        if (window.newMessageEvent.isNotify) {
            window.newMessageEvent.show();
        }
    },

    /**
     * 提示未读
     * @param {string} cid 用户id
     */
    promptUnRead(data, store) {
        var record = store.getById(data.chat_id);
        record.set({
            isUnRead: true,
            unReadNum: record.get('unReadNum') + 1,
            last_post_at: new Date(data.update_at)
        });
    },

    // 在当前频道，有未读数量，但是不展示
    promptFakeRead(data, store) {
        var record = store.getById(data.chat_id);
        record.set({
            isUnRead: false,
            unReadNum: record.get('unReadNum') + 1,
            last_post_at: new Date(data.update_at)
        });
    },

    // 最近会话重新排序
    reSortRecentList(IMView, data) {
        var list = IMView.down('#recentChat'),
            listStore = list.getStore(),
            record = listStore.getById(data.chat_id);

        record.set('last_post_at', new Date(data.update_at));
        // listStore.sort();
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
        } else if (chatStore.data.items.length == 1) {
            var lastUpdateTime = chatStore.data.items[0].data.updateTime;
            if (record[0].data.updateTime == lastUpdateTime) {
                record[0].set('showTime', false);
            }
        }
    },


    /* ******************************** group_added *********************************************/

    handleGrpAddEvent(msg) {
        const me = this,
            data = msg.data,
            memIDs = JSON.parse(data.user_ids);

        var GrpChangeMsg = '';

        // 首先判断创建者是否是自己
        if (data.creator_id == User.ownerID) { // 是自己，所有的操作都及时更新到页面上

            GrpChangeMsg = this.createOwnWelcomeMsg(data.creator_id, memIDs);

        } else { // 不是自己创建的，先判断页面上是否有此频道
            GrpChangeMsg = me.createOtherWelcomeMsg(data.creator_id, memIDs);

            // if (me.hasChat(data.chat_id)) { // 有此频道，只有跟自己相关的信息才会展示

            // } else { // 没有此频道，则组织缓存的数据，在接收到posted的时候，一并将缓存数据组织上去
            //     // User.grpAddedInfo.push({
            //     //     chatId: data.chat_id,
            //     //     grpChangeMsg: GrpChangeMsg
            //     // });
            // }

        }

        // 不需要展示了，获取历史记录的时候会绑定了
        // 在当前频道，添加信息进入chat
        // if (User.crtChannelId == data.chat_id) {
        //     me.showgrpMsgInChat(GrpChangeMsg, new Date());
        // }

        // 不管你有没有显示都加入缓存
        me.addInfoToCache(data.chat_id, GrpChangeMsg);
    },

    // 缓存中是否有此chat
    hasChat(chatID) {
        for (var i = 0; i < User.allChannels.length; i++) {
            if (User.allChannels[i].chat.chat_id == chatID) {
                return true;
            }
        }
        return false;
    },

    hasRctChat(chatID) {
        var store = Ext.Viewport.lookup('IM').down('#recentChat').getStore(),
            record = store.getById(chatID);

        if (record) {
            return true;
        }
        return false;
    },

    // 创建者拼凑信息，组织成：你邀请xxx、xxx、xxx加入群聊
    createOwnWelcomeMsg(creatorID, memIDs) {
        var result = '',
            memNames = '',
            memName = '';

        for (var i = 0; i < memIDs.length; i++) {
            if (User.ownerID != memIDs[i]) {
                memName = ChatHelper.getName(memIDs[i]);

                if (i == 0) {
                    memNames = memName;
                } else {
                    memNames = memNames + '、' + memName;
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

                if (i == 0) {
                    memNames = memName;
                } else {
                    memNames = memNames + '、' + memName;
                }
            }
        }

        result = creatorName + '邀请你和' + memNames + '加入群聊';
        return result;
    },



    // 提示信息加入缓存
    addInfoToCache(chatID, GrpChangeMsg) {
        var flag = true;
        if (User.grpChgInfo.length !== 0) { // 不是第一次
            // 有缓存后，要查询是否是这个chat的信息
            for (var i = 0; i < User.grpChgInfo.length; i++) {
                if (User.grpChgInfo[i].chatId == chatID) {
                    flag = false;
                    User.grpChgInfo[i].grpMsg.push({
                        msg: GrpChangeMsg,
                        updateAt: new Date()
                    });
                    break;
                }
            }
        }

        if (flag) {
            this.addNewChatIDTogrpInfo(chatID, GrpChangeMsg);
        }
    },
    addNewChatIDTogrpInfo(chatID, GrpChangeMsg) {
        var grpMsg = [];
        grpMsg.push({
            msg: GrpChangeMsg,
            updateAt: new Date()
        });
        User.grpChgInfo.push({
            chatId: chatID,
            grpMsg: grpMsg
        });
    },

    // 添加多人会话信息进入chatView
    showgrpMsgInChat(grpChangeMsg, date) {
        const chatView = Ext.Viewport.lookup('IM').lookup('im-main').down('#chatView'),
            chatStore = chatView.getStore();

        var record = chatStore.add({
            updateTime: date,
            GrpChangeMsg: grpChangeMsg,
            showGrpChange: true
        });

        ChatHelper.onScroll(chatView);

        this.isShowTime(chatStore, record);
    },

    /* ******************************** member_removed *********************************************/

    handleMemRemoveEvent(msg) {
        const me = this,
            data = msg.data;

        var removeMemMsg = '';
        // 分三种情况，移除者，被移除者，其余人
        if (data.remover_id == User.ownerID) { // 移除者, 自己的信息在本地就展示，暂时没做
            removeMemMsg = me.createMeRemoveSBMsg(data.remover_id, data.user_id);

            if (User.crtChannelId == data.chat_id) { // 在当前频道,展示
                me.showgrpMsgInChat(removeMemMsg, new Date());
                me.removeChatMem(data.user_id);
            }

            // me.addInfoToCache(data.chat_id, removeMemMsg);

        } else if (data.user_id == User.ownerID) { // 被移除者
            removeMemMsg = me.createSBRemoveMeMsg(data.remover_id, data.user_id);

            if (User.crtChannelId == data.chat_id) { // 在当前频道,展示
                me.showgrpMsgInChat(removeMemMsg, new Date());
                me.removeChatMem(data.user_id);
            }

            me.addInfoToCache(data.chat_id, removeMemMsg);
        }
        else { // 其他人,不提示
            if (User.crtChannelId == data.chat_id) {
                me.removeChatMem(data.user_id);
            }
        }

        me.removeMemFormCache(data.chat_id, data.user_id);
    },

    createMeRemoveSBMsg(removerID, userID) {
        var result = '';
        if (removerID == userID) {
            result = '你退出了群聊';
        } else {
            var userName = ChatHelper.getName(userID);
            result = '你将' + userName + '移出了群聊';
        }

        return result;
    },
    createSBRemoveMeMsg(removerID, userID) {
        var removerName = ChatHelper.getName(removerID),
            userName = ChatHelper.getName(userID);
        return '你被' + removerName + '移出了群聊';
    },

    // User.allChannels移除成员
    removeMemFormCache(chatID, beRemovedID) {
        for (var i = 0; i < User.allChannels.length; i++) {
            if (User.allChannels[i].chat.chat_id == chatID) {
                for (var j = 0; j < User.allChannels[i].members.length; j++) {
                    if (User.allChannels[i].members[j].user_id == beRemovedID) {
                        User.allChannels[i].members.splice(j, 1); // 将数据从数组中移除
                        break;
                    }
                }

                break; // 移除后不循环
            }
        }
    },

    // 多人会话人员列表移除成员
    removeChatMem(beRemovedID) {
        var store = Ext.Viewport.lookup('IM').lookup('im-main').down('#groupList').getStore();
        if (store) {
            var record = store.getById(beRemovedID);
            store.remove(record);
        }
    },

    /* ******************************** members_added *********************************************/

    handleMemAddEvent(msg) {
        const me = this,
            data = msg.data,
            userIDs = JSON.parse(data.user_ids);

        var addMemMsg = '';

        if (data.operator_id == User.ownerID) { // 自己添加人员
            addMemMsg = me.createMeAddSBMsg(data.operator_id, userIDs);
        } else {
            addMemMsg = me.createSBAddSBMsg(data.operator_id, userIDs);
        }

        if (User.crtChannelId == data.chat_id) { // 在当前频道,展示
            me.showgrpMsgInChat(addMemMsg, new Date());

            me.addChatMems(data.operator_id, userIDs);
        }

        me.addInfoToCache(data.chat_id, addMemMsg);

        me.addMemsToChatCache(data.chat_id, userIDs);
    },

    // 你邀请xxx、xxx加入了群聊
    createMeAddSBMsg(operatorID, userIDs) {
        var msg = '',
            name = '',
            result = '';

        for (var i = 0; i < userIDs.length; i++) {
            name = ChatHelper.getName(userIDs[i]);

            if (i == 0) {
                msg += name;
            } else {
                msg = msg + '、' + name;
            }
        }

        result = '你邀请' + msg + '加入了群聊';

        return result;
    },

    // xxx邀请xxx、xxx加入了群聊
    createSBAddSBMsg(operatorID, userIDs) {
        var msg = '',
            name = '',
            result = '';

        for (var i = 0; i < userIDs.length; i++) {
            name = ChatHelper.getName(userIDs[i]);

            if (i == 0) {
                msg += name;
            } else {
                msg = msg + '、' + name;
            }
        }

        // 创建者姓名
        name = ChatHelper.getName(operatorID);

        result = name + '邀请' + msg + '加入了群聊';

        return result;
    },

    addChatMems(chatID, userIDs) {
        var store = Ext.Viewport.lookup('IM').lookup('im-main').down('#groupList').getStore();
        if (store) {
            for (var i = 0; i < userIDs.length; i++) {
                store.add({
                    chat_id: chatID,
                    user_name: ChatHelper.getName(userIDs[i]),
                    user_id: userIDs[i],
                    status: StatusHelper.getStatus(userIDs[i])
                });
            }
        }
    },

    addMemsToChatCache(chatID, userIDs) {
        var userName = '',
            status = '';
        for (var i = 0; i < User.allChannels.length; i++) {
            if (User.allChannels[i].chat.chat_id == chatID) {
                for (var j = 0; j < userIDs.length; j++) {
                    status = StatusHelper.getStatus(userIDs[j]);
                    userName = ChatHelper.getName(userIDs[j]);
                    User.allChannels[i].members.push({
                        chat_id: chatID,
                        status: status,
                        user_id: userIDs[j],
                        user_name: userName
                    });
                }

            }
        }
    },

    /* *********************************** 更换管理员 **********************************************************/

    handleMgrChgEvent(msg) {
        var data = msg.data;
        var chgMgrMsg = '';
        if (data.old_manager == User.ownerID) {
            chgMgrMsg = this.meChgMgrToSB(data.new_manager);

            if (User.crtChannelId == data.chat_id) {
                this.showgrpMsgInChat(chgMgrMsg, new Date());
            }
        } else if (data.new_manager == User.ownerID) {
            chgMgrMsg = this.sbChgMgrToMe(data.old_manager);

            if (User.crtChannelId == data.chat_id) {
                this.showgrpMsgInChat(chgMgrMsg, new Date());
            }
        }

        this.chgMgrToCahe(data.chat_id, data.new_manager, data.old_manager);

    },

    // 你将群主转让给xxx
    meChgMgrToSB(newMgr) {
        var name = ChatHelper.getName(newMgr);
        return '你将群主转让给' + name;
    },

    //  xxx将群主转让给你
    sbChgMgrToMe(oldMgr) {
        var name = ChatHelper.getName(oldMgr);
        return name + '将群主转让给你';
    },

    // 缓存中更新管理员
    chgMgrToCahe(chatID, newMgr, oldMgr) {
        for (var i = 0; i < User.allChannels.length; i++) {
            if (chatID == User.allChannels[i].chat.chat_id) {
                User.allChannels[i].chat.manager_id == newMgr;
                for (var j = 0; j < User.allChannels[i].members.length; j++) {
                    if (User.allChannels[i].members[j].user_id == oldMgr) {
                        User.allChannels[i].members.splice(j, 1);
                        break;
                    }
                }
                break;
            }
        }
    },

    /* *********************************** 标题头更改 **********************************/

    handleChgChatHeader(msg) {
        var me = this,
            data = msg.data,
            opID = data.operator_id,
            chatInfo = JSON.stringify(data.chat),
            chgHeaderMsg = '';

        if (User.ownerID == opID) {
            chgHeaderMsg = me.createMeChgHeaderMsg(chatInfo.header);
        } else {
            chgHeaderMsg = me.createSBChgHeaderMsg(chatInfo.header, opID);
        }

        if (User.crtChannelId == chatInfo.chat_id) {
            me.showgrpMsgInChat(chgHeaderMsg, new Date());
            Ext.Viewport.lookup('IM').getViewModel().set('sendoName', chatInfo.header);
        }

        me.chgHeaderToCache(chatInfo.chat_id, chatInfo.header);
    },

    createMeChgHeaderMsg(header) {
        return '你修改群名为:' + header;
    },

    createSBChgHeaderMsg(header, opID) {
        var name = ChatHelper.getName(opID);
        return name + '修改群名为:' + header;
    },

    chgHeaderToCache(chatID, header) {
        var chat = PreferenceHelper.getChatFromCacheByID(chatID);
        chat.chat.header = header;
        chat.chat.is_manual = 'Y';
    }
});