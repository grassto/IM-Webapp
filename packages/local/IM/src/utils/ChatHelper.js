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
                        me.chgToIMView();
                        var memsID = [];
                        memsID = BindHelper.getLeafIDFromTree(record, memsID);

                        // 不判断，都是新增多人会话
                        // me.onOpenGroupChat(memsID);

                        BindHelper.createGroup(memsID);
                    }
                });
            } else {
                me.chgToIMView();
                me.onOpenDirectChat(record.data.id, record.data.name);
            }
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
    /**
    * 右侧的页面切换
    * @param {string} xtype 需要展示的xtype
    * @param {string} oldType 需要删除的xtype
    */
    showRightView(xtype, oldType) {
        const view = Ext.Viewport.lookup('IM');

        oldType = view.lookup(oldType);
        if (oldType) {
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
                    if (userIds[i] === uid) {
                        return User.allChannels[i].chat.chat_id;
                    }
                }
            }
        }
        return '';
    },

    /**
     *  根据id获取昵称
     * @param {string} uid 用户id
     */
    getName(uid) {
        for (var i = 0; i < User.allUsers.length; i++) {
            if (User.allUsers[i].user_id === uid) {
                return User.allUsers[i].user_name;
            }
        }
        return '';
    },

    /**
     * 组织chat，members
     * @param {json} data 只有chat数据
     */
    handleChatCache(data) {
        // 因为此处没有members的数据，所以再请求一次
        var cid = data.chat_id;
        Utils.ajaxByZY('get', 'chats/' + cid + '/members', {
            success: function (result) {
                User.allChannels.push({
                    chat: data,
                    members: result
                });
            }
        });
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

    /**
     * 通过chat_id来设置左侧chat的选中，并获取历史记录
     * @param {string} cid chat_id
     */
    openDirectChat(cid) {
        const me = this,
            chatView = Ext.Viewport.lookup('IM').down('#recentChat'),
            chatStore = chatView.getStore();
        chatView.setSelection(chatStore.getById(cid)); // 设置选中

        me.getHistory(cid);
    },

    /**
     * 获取历史消息
     * @param {string} cid chat_id
     */
    getHistory(cid) {
        var me = this,
            chatView = Ext.Viewport.lookup('IM').down('#chatView'),
            chatStore = chatView.getStore();

        me.setUnReadToRead(cid); // 取消未读

        chatStore.removeAll(); // 清空聊天数据

        Utils.ajaxByZY('get', 'chats/' + cid + '/posts', {
            success: function (data) {

                BindHelper.bindMsg(data, chatStore); // 绑定数据

                me.onScroll(chatView);// 可视区滚动到最下方

                me.onShowChatTime(chatStore);// 处理时间，一分钟内不显示
            }
        });
    },


    /* ******************************* 新建 ***************************************/

    createDirectChat(uid, nickname) {
        const me = this;
        Utils.ajaxByZY('post', 'chats/direct', {
            params: JSON.stringify([User.ownerID, uid]),
            success: function (data) {

                me.handleChatCache(data); // 内存中加入chat的信息

                BindHelper.addChannelToRecent(data, nickname);

                me.getHistory(data.chat_id);
            },
            failure: function (data) {
                console.log(data);
                alert('创建出错');
            }
        });
    },





    /* *************************************  **********************************************/

    /**
     * 将未读消息设为已读
     * @param {string} crtChannelID 当前选中的chat_id
     */
    setUnReadToRead(crtChannelID) {
        var memStore = Ext.Viewport.lookup('IM').down('#recentChat').getStore();
        memStore.getById(crtChannelID).set('isUnRead', false);
    },

    /**
     * 滚动条滚到最底部
     * @param {component} chatView 需要滚动的区域
     */
    onScroll(chatView) {
        var sc = chatView.getScrollable(),
            scHeight = sc.getScrollElement().dom.scrollHeight,
            scTop = sc.getScrollElement().dom.scrollTop;
        sc.scrollTo(0, scHeight - scTop);
        // sc.scrollTo(0, scHeight);

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
    }

});