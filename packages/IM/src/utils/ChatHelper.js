Ext.define('IM.utils.ChatHelper', {
    alternateClassName: 'ChatHelper',
    singleton: true,

    /**
     * 从组织结构树那边过来的
     */
    doubleToIMView() {
        var me = this,
            record = User.detailByOrg;

        // 选中的不是自己
        if (User.ownerID !== record.data.id) {
            if (!record.data.leaf) {
                Ext.Msg.confirm('提示', '确定要发起群聊吗？', function (btn) {
                    if (btn == 'yes') {
                        // me.chgToIMView();
                        var memsID = [];
                        memsID = BindHelper.getLeafIDFromTree(record, memsID);

                        // 不判断，都是新增多人会话
                        me.createGroupChat(memsID);
                    }
                });
            } else {
                // me.chgToIMView();
                me.onOpenDirectChat(record.data.id, record.data.name);
            }
        } else {
            Utils.toastLong('之后再处理');
        }

    },




    /* *************************************** 页面跳转 *******************************************/
    /**
    * 右侧页面切换为聊天页面
    */
    chgToIMView() {
        const me = this,
            rootView = Ext.Viewport.lookup('IM'),
            imMainView = rootView.lookup('im-main');
        if (!imMainView) { // 存在了就不切换
            var detailsView = rootView.lookup('details'),
                blankView = rootView.lookup('pageblank');
            if (blankView) { // 不存在im-main容器，则添加
                me.showRightView('im-main', 'pageblank');
            }
            if (detailsView) {
                me.showRightView('im-main', 'details');
            }
        }
    },
    chgToDetailView() {
        const me = this,
            rootView = Ext.Viewport.lookup('IM'),
            imMainView = rootView.lookup('details');
        if (!imMainView) { // 存在了就不切换
            var detailsView = rootView.lookup('im-main'),
                blankView = rootView.lookup('pageblank');
            if (blankView) {
                me.showRightView('details', 'pageblank');
            }
            if (detailsView) {
                me.showRightView('details', 'im-main');
            }
        }
    },
    /**
    * 右侧的页面切换
    * @param {string} xtype 需要展示的xtype
    * @param {string} oldType 需要删除的xtype
    */
    showRightView(xtype, oldType) {
        // debugger;
        const view = Ext.Viewport.lookup('IM');

        // oldType = view.lookup(oldType);
        if (oldType) {
            oldType = view.lookup(oldType);
            view.remove(oldType, true);
        }
        let rightView = view.lookup(xtype); // 需要添加的
        if (!rightView) {
            rightView = view.add({
                flex: 1,
                xtype: xtype,
                reference: xtype
            });
        }

        return rightView;
    },




    /* ****************************** 缓存 ************************************/

    /**
     * 根据用户编号从缓存中查看是否有同该用户的会话,
     * chat_name:C1034__C1064
     * @param {string} uid 用户编号
     */
    getChatID(uid) {
        var chatName = '',
            userIds = '';
        // for (var i = 0; i < User.allChannels.length; i++) {
        //     if (User.allChannels[i].chat.chat_name.indexOf(uid) > -1) {
        //         return User.allChannels[i].chat.chat_id;
        //     }
        // }

        // 服务端传来就的结构变了
        for (var i = 0; i < User.allChannels.length; i++) {
            chatName = User.allChannels[i].chat.chat_name;
            userIds = chatName.split('__'); // 拆分字符串
            if (userIds.length === 2) {
                for (var j = 0; j < 2; j++) {
                    if (userIds[j] === uid) {
                        return User.allChannels[i].chat.chat_id;
                    }
                }
            }
        }
        return '';
    },

    getChatType(cid) {
        var result = '';
        for (var i = 0; i < User.allChannels.length; i++) {
            if (User.allChannels[i].chat.chat_id == cid) {
                result = User.allChannels[i].chat.chat_type;
                break;
            }
        }

        return result;
    },

    /**
     *  根据id获取昵称
     * @param {string} uid 用户id
     */
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

    getOtherUserID(chatName) {
        var result = '';
        var userIds = chatName.split('__'); // 拆分字符串
        if (userIds.length === 2) {
            for (var j = 0; j < 2; j++) {
                if (userIds[j] !== User.ownerID) {
                    result = userIds[j];
                    break;
                }
            }
        }
        return result;
    },

    getChatHeader(cid) {
        var result = '';
        for (var i = 0; i < User.allChannels.length; i++) {
            if (User.allChannels[i].chat.chat_id == cid) {
                result = User.allChannels[i].chat.header;
                break;
            }
        }
        return result;
    },

    /**
     * 组织User.allChannels为：{chat:..., members:...}
     * @param {json} data 只有chat数据
     */
    addChatCache(data) {
        // 因为此处没有members的数据，所以再请求一次
        var cid = data.chat_id;
        Utils.ajaxByZY('get', 'chats/' + cid + '/members', {
            async: false, // 在此不能异步，不然数据不统一
            success: function (result) {
                User.allChannels.push({
                    chat: data,
                    members: result
                });
            }
        });
    },

    handleHeaderCache(chatID, header) {
        for (var i = 0; i < User.allChannels.length; i++) {
            if (User.allChannels[i].chat.chat_id == chatID) {
                User.allChannels[i].chat.channelname = header;
                User.allChannels[i].chat.header = header;
            }
        }
    },


    /* *************************************** 获取 **********************************************/

    /**
     * 打开单人会话，若没有则新建
     * @param {string} uid id
     * @param {string} nickname 名字
     */
    onOpenDirectChat(uid, nickname) {
        var me = this,
            cid = me.getChatID(uid); // chat_id

        if (cid !== '') { // 存在会话，打开
            me.openDirectChat(cid);
        } else { // 不存在，创建会话
            me.createDirectChat(uid, nickname);
        }
    },

    openChat(cid) {
        var me = this;

        // 根据store的数据判断
        var view = Ext.Viewport.lookup('IM').down('#recentChat'),
            store = view.getStore(),
            record = store.getById(cid);
        if (record) {
            view.setSelection(record);
            if (record.data.type == ChatType.Direct) {
                me.openDirectChat(cid);
            } else if (record.data.type == ChatType.Group) {
                me.openGroupChat(cid);
            }
        }
    },

    /**
     * 通过chat_id来设置左侧chat的选中，并获取历史记录
     * @param {string} cid chat_id
     */
    openDirectChat(cid) {
        this.chgToIMView(); // 先跳转

        User.crtChannelId = cid;
        const me = this,
            chatView = Ext.Viewport.lookup('IM').down('#recentChat'),
            chatStore = chatView.getStore(),
            record = chatStore.getById(cid);

        if (record) { // 讲道理，这里肯定有这个record
            // chatView.setSelection(record); // 设置选中

            if (record.data.unReadNum !== 0) { // 若选中的频道有未读信息
                me.setUnReadToRead(record); // 取消未读
            }

            BindHelper.setRightTitle(record.data.name, record.data.type); // 设置标题头

            StatusHelper.setRightStatus(record.data.status, 'inline');// 设置状态

            me.getHistory(cid); // 获取历史记录

            me.showGrpMem(cid, 'D'); // 右侧的人员列表页面是否显示
        }
    },

    openGroupChat(cid) {
        this.openDirectChat(cid);

        // 与打开单人频道的差别
        StatusHelper.setRightStatus('', 'none');// 设置状态

        this.showGrpMem(cid, 'G'); // 右侧的人员列表页面展示
    },

    /**
     * 是否展示频道中的成员
     */
    showGrpMem(cid, type) {
        var me = this,
            groupMemsView = Ext.Viewport.lookup('IM').lookup('im-main').down('#groupList'),
            memStore = groupMemsView.getStore();
        if (type == 'D') {

            groupMemsView.hide();

        } else if (type == 'G') {
            groupMemsView.show();
            memStore.removeAll();
            var mems = BindHelper.getMemsByChatId(cid);

            mems = me.handleMemListStatus(mems);

            memStore.add(mems);
        }

    },

    handleMemListStatus(mems) {
        for (var i = 0; i < mems.length; i++) {
            mems[i].status = StatusHelper.getStatus(mems[i].user_id);
        }
        return mems;
    },

    /**
     * 获取历史消息
     * @param {string} cid chat_id
     */
    getHistory(cid) {
        var me = this,
            chatView = Ext.Viewport.lookup('IM').down('#chatView'),
            chatStore = chatView.getStore();

        chatStore.removeAll(); // 清空聊天数据

        // 从本地获取历史记录,若是web版，则不管它
        if (Config.isPC) {
            var start = chatStore.getData().length;
            // 分页查出20条数据
            LocalDataMgr.getHistory(me.bindLocalHistory, start);
            me.onScroll(chatView); // 滚动条滚动打最下方
            me.onShowChatTime(chatStore);

            // 获取最后更新时间的回调函数
            var getTimeSuc = function (resultSet) {
                var rows = resultSet.rows;
                if (rows.length > 0) {
                    var lastTime = rows.item(0).CreateAt;

                    // 获取未读消息,(page默认为0，per_page默认为20)
                    Utils.ajaxByZY('get', 'chats/' + cid + '/posts/unread?per_page=' + start + '&time=' + lastTime, {
                        success: function(data) {
                            var msgList = data.message_list;
                            if(msgList.length > 0) {
                                // 本地数据更新
                                LocalDataMgr.insertToMsg(msgList);

                                BindHelper.bindAllMsg(msgList, chatStore); // 绑定数据

                                me.onScroll(chatView);// 可视区滚动到最下方
                                me.onShowChatTime(chatStore);// 处理时间，一分钟内不显示
                            }
                        }
                    });
                }
            };

            LocalDataMgr.getLastMsgTime(cid, getTimeSuc);


        }


        // Utils.ajaxByZY('get', 'chats/' + cid + '/posts', {
        //     success: function (data) {

        //         BindHelper.bindAllMsg(data, chatStore); // 绑定数据

        //         me.onScroll(chatView);// 可视区滚动到最下方

        //         me.onShowChatTime(chatStore);// 处理时间，一分钟内不显示
        //     }
        // });
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
                User.allChannels.push(data); // 处理内存
                var uid = '',
                    nickname = '';
                if (data.chat.chat_type == 'D') {
                    var ids = data.chat.chat_name.split('__');
                    for (var i = 0; i < ids.length; i++) {
                        if (ids[i] !== User.ownerID) {
                            uid = ids[i];
                            nickname = me.getName(ids[i]);
                            break;
                        }
                    }
                } else if (data.chat.chat_type == 'G') {
                    nickname = data.chat.header;
                }
                // 数据绑定至页面
                BindHelper.addChannelToRecent(data.chat, uid, nickname);
            }
        });
    },


    /* ******************************* 新建 ***************************************/

    createDirectChat(uid, nickname) {
        const me = this;
        Utils.ajaxByZY('post', 'chats/direct', {
            params: JSON.stringify([User.ownerID, uid]),
            success: function (data) {

                me.addChatCache(data); // 内存中加入chat的信息

                BindHelper.addChannelToRecent(data, uid, nickname);

                me.openDirectChat(data.chat_id); // 打开频道
            },
            failure: function (data) {
                console.log(data);
                alert('创建出错');
            }
        });
    },

    createGroupChat(memsID) {
        const me = this;
        if (memsID.length == 1) { // 只有一个人,则为单人会话
            var userName = me.getName(memsID[0]);
            me.onOpenDirectChat(memsID[0], userName);
        } else {
            Utils.ajaxByZY('post', 'chats/group', {
                // async: false,
                params: JSON.stringify(memsID),
                success: function (data) {
                    console.log('创建多人会话成功', data);

                    // User.crtChannelId = data.chat_id;
                    me.addChatCache(data);

                    BindHelper.addChannelToRecent(data, '', data.header);

                    me.openGroupChat(data.chat_id);

                },
                failure: function (data) {
                    console.log('创建多人会话失败', data);
                }
            });
        }
    },

    /**
     * 多人会话添加用户
     * @param {Array} memsID 选中用户的id
     */
    addMemToGroup(memsID) {
        Utils.ajaxByZY('post', 'chats/' + User.crtChannelId + '/members', {
            params: JSON.stringify(memsID),
            success: function (data) {
                if (data) {
                    console.log('添加成功', data);
                }
                // 添加成员，移除成员，都在websocket中处理
                // debugger;
                // var IMView = Ext.Viewport.down('IM'),
                //     recentChat = IMView.down('#recentChat'),
                //     chatStore = recentChat.getStore(),
                //     record;
                //  if (User.crtChatMembers.length > 2) {
                //     // 修改store的数据
                // }
            }
        });

    },

    /* *************************************  **********************************************/

    /**
     * 将未读消息设为已读
     * @param {Ext.data.Model} record 当前选中的chat_id的store的数据
     */
    setUnReadToRead(record) {

        Utils.ajaxByZY('post', 'chats/members/' + User.ownerID + '/view', {
            params: JSON.stringify({ chat_id: User.crtChannelId }),
            success: function (data) {
                if (data.Status == 'OK') {
                    record.set('isUnRead', false);
                    record.set('unReadNum', 0);
                }
            }
        });

    },

    /**
     * 滚动条滚到最底部
     * @param {component} chatView 需要滚动的区域
     */
    onScroll(chatView) {
        var sc = chatView.getScrollable(),
            scHeight = sc.getScrollElement().dom.scrollHeight,
            scTop = sc.getScrollElement().dom.scrollTop;
        // sc.scrollTo(0, scHeight - scTop);
        sc.scrollTo(0, scHeight/* , {
            duration: 100
        }*/);

    },

    /**
    * 处理时间，一分钟内不显示
    * @param {Ext.data.Store} chatStore
    */
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

    // 本地拉取历史记录进行绑定
    bindLocalHistory(trans, resultSet) {
        var rows = resultSet.rows,
            len = rows.length;

        var store = Ext.Viewport.lookup('IM').lookup('im-main').down('#chatView').getStore(),
            datas = [],
            row = {};
        for (var i = 0; i < len; i++) {
            row = rows.items(i);
            switch (row.MsgType) {
                case MsgType.TextMsg:
                    datas.push({
                        msg_id: row.MsgID,
                        senderName: row.SenderName,
                        sendText: row.Content,
                        ROL: row.SenderID == User.ownerID ? 'right' : 'left',
                        updateTime: new Date(row.CreateAt)
                    });
                    break;
                case MsgType.ImgMsg:
                    break;
                case MsgType.FileMsg:
                    break;
                default:
                    break;
            }

        }
        store.add(datas);
    }

});