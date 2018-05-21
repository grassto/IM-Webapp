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

                        if (memsID.length == 1) { // 组织结构下仅有一人
                            me.createDirectChat(memsID[0].id, memsID[0].name);
                        } else {
                            // 不判断，都是新增多人会话
                            me.createGroupChat(memsID);
                        }
                    }
                });
            } else {
                me.createDirectChat(record.get('id'), record.get('name'));
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
    openDirectChat(cid, isCreate) {
        var record = this.sameOpenChat(cid, isCreate);

        StatusHelper.setRightStatus(record.data.status, 'inline');// 设置状态

        this.showGrpMem(cid, 'D'); // 右侧的人员列表页面是否显示
    },

    openGroupChat(cid, isCreate) {
        this.sameOpenChat(cid, isCreate);

        StatusHelper.setRightStatus('', 'none');// 设置状态

        this.showGrpMem(cid, 'G'); // 右侧的人员列表页面展示
    },

    /**
     * 提取出打开会话公共的部分（单人、多人）,若是新发起的会话，则不需要去获取历史记录
     * @param {string} cid 会话id
     * @param {*} isCreate 是否是新发起的会话  true/undefined
     */
    sameOpenChat(cid, isCreate) {
        this.chgToIMView(); // 先跳转

        const me = this,
            chatView = Ext.Viewport.lookup('IM').down('#recentChat'),
            chatStore = chatView.getStore(),
            record = chatStore.getById(cid);

        if (User.crtChannelId == cid) return record;
        User.crtChannelId = cid;

        if (record) { // 讲道理，这里肯定有这个record
            // chatView.setSelection(record); // 设置选中

            if (record.data.unReadNum !== 0) { // 若选中的频道有未读信息
                me.setUnReadToRead(record); // 取消未读

                if (Config.isPC) {
                    LocalDataMgr.rctSetUnreadToRead(cid);
                }
            }

            BindHelper.setRightTitle(record.data.name, record.data.type); // 设置标题头

            // if (!isCreate) { // 不是新创建的会话
            me.getHistory(cid); // 获取历史记录
            // }

        }

        return record;
    },

    /**
     * 是否展示频道中的成员
     */
    showGrpMem(cid, type) {
        var me = this,
            imView = Ext.Viewport.lookup('IM'),
            groupMemsView = imView.lookup('im-main').down('#groupList'),
            memStore = groupMemsView.getStore();
        if (type == 'D') {

            groupMemsView.hide();

        } else if (type == 'G') {
            groupMemsView.show();
            memStore.removeAll();

            var rctStore = imView.down('#recentChat').getStore(),
                rctRecord = rctStore.getById(cid),
                mems = rctRecord.get('members');

            mems = me.handleMemListStatus(mems);

            memStore.add(mems);
        }

    },

    handleMemListStatus(mems) {
        if(mems) {
            if(!mems.length) return;
            for (var i = 0; i < mems.length; i++) {
                if (mems[i].user_id == User.ownerID) {
                    mems[i].status = 0;
                } else {
                    mems[i].status = StatusHelper.getStatus(mems[i].user_id);
                }
            }
        } else {
            // 先去本地数据库取，若没有，则去服务器取
        }

        return mems;
    },

    getHistory(cid) {
        var me = this,
            chatView = Ext.Viewport.lookup('IM').lookup('im-main').down('#chatView'),
            store = Ext.getStore(cid),
            isScrolToDown = false;

        // 每一个会话给一个store
        if (!store) {
            store = Ext.factory({
                storeId: cid,
                model: 'IM.model.Chat',
                isFirst: true
            }, Ext.data.Store);

            isScrolToDown = true;
        } else {
            store.isFirst = false;
        }

        chatView.setStore(store);
        AddDataUtil.onScroll(chatView);

        // isScrolToDown = true; // 若是第一次打开这个会话，则滚动到最下方

        // 从本地获取历史记录,若是web版，则不管它
        if (Config.isPC) {
            if (store.isFirst) {

                // 查出前20条数据
                LocalDataMgr.getHistory(me.bindLocalHistory, 0, cid);
            }

            // 多少条未读
            var perPage = Ext.Viewport.lookup('IM').down('#recentChat').getStore().getById(cid).get('unReadNum');

            if (perPage) { // 有未读
                perPage = 20;
                // 获取最后更新时间的回调函数,根据这个时间去服务器端请求数据
                var getTimeSuc = function (resultSet) {
                    var rows = resultSet.rows,
                        lastTime;
                    if (rows.length > 0) {
                        lastTime = rows.item(0).CreateAt;
                    } else {
                        lastTime = 0;
                    }

                    // 获取未读消息,(page默认为0，per_page默认为20)
                    Utils.ajaxByZY('get', 'chats/' + cid + '/posts/unread', {
                        success: function (data) {
                            console.log('分页获取的历史消息：', data);

                            var msgList = data.message_list;
                            if (msgList && msgList.length > 0) {

                                LocalDataMgr.insertOrUpdateRct(cid); // 更新Rct，应该在ws接收到post消息的时候就去更新
                                // 本地数据更新
                                LocalDataMgr.initAddToMsg(msgList);
                                BindHelper.bindAllMsg(msgList, store); // 绑定数据

                                AddDataUtil.onScroll(chatView);

                                // me.onShowChatTime(store);// 处理时间，一分钟内不显示
                            }
                        }
                    }, '', '&per_page=' + perPage + '&time=' + lastTime);

                };

                LocalDataMgr.getLastMsgTime(cid, getTimeSuc);
            }
        } else {
            store.removeAll();
            Utils.ajaxByZY('get', 'chats/' + cid + '/posts', {
                success: function (data) {

                    BindHelper.bindAllMsg(data, store); // 绑定数据

                    me.onScroll(chatView);

                    // me.onShowChatTime(store);// 处理时间，一分钟内不显示
                }
            });
        }



        if (isScrolToDown) {
            me.onScroll(chatView); // 滚动条滚动到最下方
        }

    },

    // 本地拉取历史记录进行绑定
    bindLocalHistory(trans, resultSet) {
        var rows = resultSet.rows,
            len = rows.length;

        var view = Ext.Viewport.lookup('IM').lookup('im-main').down('#chatView'),
        store = view.getStore(),
            datas = [],
            row = {};

        var isShowTime = true,
            text = '',
            preTime, now;
        for (var i = len - 1; i >= 0; i--) {
            row = rows.item(i);
            // 同一分钟不显示时间
            if (i < len - 1) {
                preTime = Utils.datetime2Ago(new Date(rows.item(i + 1).CreateAt), true);
                now = Utils.datetime2Ago(new Date(row.CreateAt), true);
                if (preTime == now) {
                    isShowTime = false;
                } else {
                    isShowTime = true;
                }
            } else {
                isShowTime = true;
            }

            switch (row.MsgType) {
                case MsgType.TextMsg:
                    text = window.minEmoji(row.Content);
                    datas.push({
                        msg_id: row.MsgID,
                        msg_type: row.MsgType,
                        senderName: row.SenderName,
                        sendText: text,
                        ROL: row.SenderID == User.ownerID ? 'right' : '',
                        updateTime: new Date(row.CreateAt),
                        showTime: isShowTime
                    });
                    break;
                case MsgType.ImgMsg:
                    // text = ImgMgr.parsePic(FileUtil.getFileName(row.FilePath));
                    text = ParseUtil.getLocalPic(row.FilePath);
                    datas.push({
                        msg_id: row.MsgID,
                        msg_type: row.MsgType,
                        senderName: row.SenderName,
                        sendText: text,
                        ROL: row.SenderID == User.ownerID ? 'right' : '',
                        updateTime: new Date(row.CreateAt),
                        showTime: isShowTime
                    });
                    break;
                case MsgType.FileMsg:
                    break;
                case MsgType.GroupNotice:
                    datas.push({
                        showTime: isShowTime,
                        updateTime: new Date(row.CreateAt),
                        GrpChangeMsg: row.Content,
                        showGrpChange: true
                    });
                    break;
                default:
                    console.log('暂未支持该类型消息：', row.MsgType);
                    break;
            }

        }
        // <debug>
        console.log(datas);
        // </debug>
        store.add(datas);

        AddDataUtil.onScroll(view);
    },

    // 获取更多的历史消息(现只从本地拉)
    getMoreHistory(cid) {
        if (Config.isPC) {
            var me = this,
                chatView = Ext.Viewport.lookup('IM').down('#chatView'),
                chatStore = chatView.getStore(),
                start = chatStore.getData().length; // 从第多少条开始查，这个不对

            // 分页查出20条数据,根据时间来
            LocalDataMgr.getHistory(me.bindLocalHistory, start, cid);
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
                var record = Ext.Viewport.lookup('IM').down('#recentChat').getStore().getById(data.chat_id);
                // 页面store中是否有该数据
                if (!record) { // 不存在

                    // 本地
                    if (Config.isPC) {
                        data.display_name = nickname;
                        data.unread_count = 0;
                        data.last_sender_id = User.ownerID;
                        data.last_sender_name = User.crtUser.user_name;
                        data.last_message = '';
                        LocalDataMgr.createDitChat(data);
                    }

                    me.addChatCache(data); // 内存中加入chat的信息

                    BindHelper.addChannelToRecent(data, uid, nickname);
                }

                me.openChatAfterCreate(data, nickname); // 创建会话成功后，打开会话界面

                // me.openDirectChat(data.chat_id); // 打开频道
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
                    // me.addChatCache(data);

                    BindHelper.addChannelToRecent(data, '', data.header);

                    // 数据绑定
                    // var recentChatView = Ext.Viewport.down('IM').down('#recentChat'),
                    //     chatStore = recentChatView.getStore();
                    // chatStore.insert(0, {
                    //     chat_id: data.chat_id,
                    //     name: nickname,
                    //     type: data.chat_type,
                    //     last_post_at: data.update_at,
                    //     status: status,
                    //     chat_name: data.chat_name,
                    //     members: data.members
                    // });

                    if (Config.isPC) {
                        LocalDataMgr.createGrpChat(data);
                    }

                    me.openChatAfterCreate(data);

                },
                failure: function (data) {
                    console.log('创建多人会话失败', data);
                    Utils.toastShort('发起会话失败');
                }
            });
        }
    },

    /**
     * 新建会话后调用，主要是处理存放MSG的store
     * @param {json} data 服务端传回的数据
     * @param {string} nickname 需要展示的chat名称
     */
    openChatAfterCreate(data, nickname) {
        const me = this;
        me.chgToIMView(); // 先跳转
        User.crtChannelId = data.chat_id; // 设置crtCID

        var imView = Ext.Viewport.lookup('IM'),
            rctView = imView.down('#recentChat'),
            mainView = imView.lookup('im-main'),
            chatView = mainView.down('#chatView'),
            grpView = mainView.down('#groupList');

        rctView.setSelection(rctView.getStore().getById(data.chat_id)); // 设置最近会话选中
        
        var store = Ext.factory({
            storeId: data.chat_id,
            model: 'IM.model.Chat',
            isFirst: true
        }, Ext.data.Store);

        chatView.setStore(store);

        switch (data.chat_type) {
            case ChatType.Direct:
                grpView.hide();
                break;
            case ChatType.Group:
                nickname = data.header;
                // 右侧人员列表展示
                grpView.show();
                var grpStore = grpView.getStore();
                grpStore.removeAll();
                var mems = me.handleMemListStatus(data.members);
                grpStore.add(mems);

                // 加入群聊提示信息
                var grpMsg = GroupNotice.createNewGrpNotice(data.creator_id, data.members);
                store.add({
                    updateTime: data.create_at,
                    GrpChangeMsg: grpMsg,
                    showGrpChange: true
                });
                break;
            default:
                break;
        }
        BindHelper.setRightTitle(nickname, data.chat_type); // 右侧标题头

        
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

});