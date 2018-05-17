Ext.define('IMCommon.utils.AddDataUtil', {
    alternateClassName: 'AddDataUtil',
    singleton: true,

    addAllMsg(view, data) {
        if (data.length > 0) {
            var records = [],
                record,
                store = view.getStore();

            for (var i = 0; i < data.length; i++) {
                // data[i].wrapper_type  message/notice
                record = this.getMsgData(data[i]);
                records.push(record);
            }

            store.add(records);
        }
    },

    getMsgData(data) {
        const me = this;
        var result = {};

        if (data.wrapper_type == MsgWrapperType.Notice) { // 多人通知信息
            var grpChangeMsg = ''; // 组织提示信息
            var memIDs = me.getNoticeMemsByContent(data.notice.operator_id, data.notice.content);

            if (data.notice.operator_id == User.ownerID) { // 发起者的展示信息
                switch (data.notice.notice_type) {
                    case NoticeType.CreateGrp:
                        grpChangeMsg = SocketEventUtil.createOwnWelcomeMsg(data.notice.operator_id, memIDs);
                        break;
                    case NoticeType.AddMem:
                        grpChangeMsg = SocketEventUtil.createMeAddSBMsg(data.notice.operator_id, memIDs);
                        break;
                    case NoticeType.RemoveMem:
                        grpChangeMsg = SocketEventUtil.createMeRemoveSBMsg(data.notice.operator_id, memIDs[0]);
                        break;
                    case NoticeType.ChgTitle:
                        grpChangeMsg = SocketEventUtil.createMeChgHeaderMsg(data.notice.content);
                        break;
                    case NoticeType.ChgManager:
                        grpChangeMsg = SocketEventUtil.meChgMgrToSB(memIDs[0]);
                        break;
                    default:
                        break;
                }
            } else { // 被操作者的展示信息
                switch (data.notice.notice_type) {
                    case NoticeType.CreateGrp:
                        grpChangeMsg = SocketEventUtil.createOtherWelcomeMsg(data.notice.operator_id, memIDs);
                        break;
                    case NoticeType.AddMem:
                        grpChangeMsg = SocketEventUtil.createSBAddSBMsg(data.notice.operator_id, memIDs);
                        break;
                    case NoticeType.RemoveMem:
                        grpChangeMsg = SocketEventUtil.createSBRemoveMeMsg(data.notice.operator_id, memIDs[0]);
                        break;
                    case NoticeType.ChgTitle:
                        grpChangeMsg = SocketEventUtil.createSBChgHeaderMsg(data.notice.content, data.notice.operator_id);
                        break;
                    case NoticeType.ChgManager:
                        grpChangeMsg = SocketEventUtil.sbChgMgrToMe(data.notice.operator_id);
                        break;
                    default:
                        break;
                }
            }

            result = {
                updateTime: new Date(data.create_at),
                GrpChangeMsg: grpChangeMsg,
                showGrpChange: true
            };
        } else if (data.wrapper_type == MsgWrapperType.Message) { // 平常的消息
            var message = data.message, // IMMsg表中的信息
                userName = '', // 在缓存中查找用户名
                ROL = '', // 区别自己和他人的消息，自己的靠右
                text = ''; // 发送的文本

            if (message.user_id == User.ownerID) {
                ROL = 'right';
            }

            userName = me.getName(message.user_id);

            if (message.msg_type == MsgType.TextMsg) {
                text = window.minEmoji(message.message); // emoji解析
                result = {
                    msg_id: message.msg_id,
                    senderName: userName,
                    sendText: text,
                    ROL: ROL,
                    updateTime: new Date(message.update_at)
                };
            } else if (message.msg_type == MsgType.ImgMsg) {
                text = ImgMgr.parsePic(message.attach_id); // 需保存本地
                // text = '<img id="' + message.attach_id + '" style="/*width:40px;height:40px;*/background:url(' + Ext.getResourcePath('images/loading.gif') +') no-repeat center center;" class="viewPic" src="' + Config.httpUrlForGo + 'files/' + message.attach_id + '/thumbnail">';;

                // 处理滚动条
                //var url = Config.httpUrlForGo + 'files/' + message.attach_id + '/thumbnail';
                // 图片若未加载完成，则显示loading,加载出现异常，显示默认图片
                //window.imagess(url, message.attach_id);
                result = {
                    msg_id: message.msg_id,
                    senderName: userName,
                    sendText: text,
                    ROL: ROL,
                    updateTime: new Date(message.update_at)
                };
            } else if (message.msg_type == MsgType.FileMsg) {
                result = {
                    msg_type: MsgType.FileMsg,
                    file_id: message.attach_id,
                    fileName: '服务端之后做',
                    fileSize: '服务端之后做',
                    fileStatus: 2,
                    senderName: userName,
                    ROL: ROL,
                    updateTime: new Date(message.update_at)
                };
            }

            if (result) {
                result.msg_type = message.msg_type;
            }

        }

        return result;
    },

    /**
    * 获取被操作者，返回数组
    * @param {string} opID 创建者id
    * @param {string} memsIdStr 参与者的id
    */
    getNoticeMemsByContent(opID, memsIdStr) {
        var ids = memsIdStr.split(',');
        for (var i = 0; i < ids.length; i++) {
            if (ids[i] == opID) {
                ids.splice(i, 1);
                break;
            }
        }

        return ids;
    },

    onScroll(chatView) {
        var sc = chatView.getScrollable(),
            scHeight = sc.getScrollElement().dom.scrollHeight,
            scTop = sc.getScrollElement().dom.scrollTop;
        sc.scrollTo(0, scHeight);
    },

    onShowChatTime(chatStore) {
        var data = chatStore.data.items,
            length = data.length;
        // 从第二个开始进行排查
        for (var i = 1; i < length; i++) {
            if (data[i].data.updateTime == data[i - 1].data.updateTime) {
                chatStore.getAt(i).set('showTime', false);
            }
        }
    },

    /**
     * 根据chatID组织数据到recentChat
     */
    addChatToRecent(cid) {
        const me = this;
        // 查询chat相关信息并存入缓存
        Utils.ajaxByZY('get', 'users/' + User.ownerID + '/chats/' + cid, {
            async: false,
            success: function (data) {
                var uid = '',
                    nickname = '';
                if (data.chat.chat_type == ChatType.Direct) {
                    var ids = data.chat.chat_name.split('__');
                    for (var i = 0; i < ids.length; i++) {
                        if (ids[i] !== User.ownerID) {
                            uid = ids[i];
                            nickname = me.getName(ids[i]);
                            data.chat.channelname = nickname;
                            break;
                        }
                    }
                } else if (data.chat.chat_type == ChatType.Group) {
                    nickname = data.chat.header;
                    data.chat.channelname = data.chat.header;
                }

                User.allChannels.push(data); // 处理内存
                // 数据绑定至页面
                me.bindChatToRecent(data.chat, uid, nickname);
            }
        });
    },

    bindChatToRecent(data, uid, nickname) {
        const recentChatView = Ext.Viewport.lookup('IMMobile').down('#IMMobile_Chat').down('#ChatList'),
            chatStore = recentChatView.getStore();

        var status = ''; // 为空则不展示，多人会话时
        // 区分单人和多人
        // if (uid) {
        //     status = StatusHelper.getStatus(uid);
        // }

        var record = chatStore.add({
            chat_id: data.chat_id,
            name: nickname,
            type: data.chat_type,
            last_post_at: new Date(data.update_at),
            status: status,
            chat_name: data.chat_name
        });

        // debugger;
        if (data.creator_id == User.ownerID) {
            recentChatView.setSelection(record);
        }
    },

    getName(uid) {
        var name = '';
        for (var i = 0; i < User.allUsers.length; i++) {
            if (User.allUsers[i].user_id === uid) {
                name = User.allUsers[i].user_name;
                break;
            }
        }
        if (name == '') {// 请求数据库查找
            // name = xxx;
            // User.allUsers.push(); // 加入缓存
        }
        return name;
    },



    // WS添加个人对话
    wsAddDirectChatToRct(store, data) {
        var rec = store.insert(0, {
            chat_id: data.chat_id,
            name: data.user_name,
            type: data.chat_type,
            status: 0, // 成功态
            chat_name: data.chat_name,
            last_post_at: data.update_at,
            last_post_msg: data.message,
            last_post_name: data.user_name,
            last_msg_type: data.msg_type
        });

        return rec[0];
    },

    // WS添加群聊
    wsAddGrpChatToRct(store, data) {
        var rec;
        // 没有人员信息，在此获取人员信息
        Utils.ajaxByZY('get', 'users/' + User.ownerID + '/chats/' + data.chat_id, {
            async: false, // ios不能用async:false，会报错
            success: function (res) {
                rec = store.insert(0, {
                    chat_id: data.chat_id,
                    name: res.chat.header,
                    type: data.chat_type,
                    status: 0, // 成功态
                    chat_name: data.chat_name,
                    members: res.members,
                    last_post_at: data.update_at,
                    last_post_msg: data.message,
                    last_post_name: data.user_name,
                    last_msg_type: data.msg_type
                });
            }
        });

        return rec[0];
    },

    /**
     * websocket收到请求后，增加数据进Rct
     * @param {*} store 需要加数据的store
     * @param {*} data 数据
     */
    wsAddChatToRct(store, data) {
        var result;
        switch (data.chat_type) {
            case ChatType.Direct:
                result = this.wsAddDirectChatToRct(store, data);
                break;
            case ChatType.Group:
                result = this.wsAddGrpChatToRct(store, data);
                break;
            default:
                break;
        }

        return result;
    },

    wsUpdateRct(store, data) {
        switch (data.chat_type) {
            case ChatType.Direct:
                this.wsUpdateDitRct(store, data);
                break;
            case ChatType.Group:
                this.wsUpdateGrpRct(store, data);
                break;
            default:
                break;
        }
    },

    wsUpdateDitRct(store, data) {
        
    },

    wsUpdateGrpRct(store, data) {},

});