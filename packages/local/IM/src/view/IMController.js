Ext.define('IM.view.IMController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.IM',

    requires: [
        'IM.utils.AvatarMgr',
        'IM.utils.WebSocketHelper',
        'IM.utils.BindHelper',
        'MX.util.Utils'
    ],

    listen: {
        controller: {
            'recentChat': {
                showRight: 'showRightView'
            },
            'left-orgController': {
                showRight: 'showRightView',
                doubleTapOrg: 'btnOnChgToIM'
            },
            'im-right-main': {
                grpSel: 'onShowGrpSel',
                antiParse: 'antiParse',
                listToTop: 'doLeftListToTop'
            }
        }
    },

    init: function () {
        var me = this;
        me.callParent(arguments);

        // 打开连接
        me.mounted();

        // 设置当前用户头像
        var viewmodel = me.getViewModel();
        var avatar = AvatarMgr.getAvatarHtmlByName(viewmodel.get('ownerName'));
        viewmodel.set('avatar', avatar);

        // 左侧搜索框，快速搜索联系人
        var form = me.lookup('searchForm');
        var map = new Ext.util.KeyMap({
            target: form.element,
            key: 13, // or Ext.event.Event.ENTER
            handler() {
                // me.onSearch();
            },
            scope: me
        });

        // 右侧页面展示
        me.showRightView('pageblank');
    },

    // 使用子控件的隐藏与展示来切换
    showMiddle(xtype, oldType) {
        const me = this,
            view = me.getView().down('#middleView');

        // // debugger;
        oldType = view.down('#' + oldType);
        if (oldType) {
            oldType.hide();
        }

        let middleView = view.down('#' + xtype);
        if (!middleView) {
            middleView = view.add({
                xtype: xtype,
                reference: xtype,
                itemId: xtype,
                flex: 1,
                cls: 'left_tab'
            });
        } else {
            middleView.show();
        }
        // view.setActiveItem(middleView);

        return middleView;
    },

    /**
     * 右侧的页面切换
     * @param {string} xtype 需要展示的xtype
     * @param {string} oldType 需要删除的xtype
     */
    showRightView(xtype, oldType) {
        // // // debugger;
        const me = this,
            view = me.getView();

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
        // view.setActiveItem(rightView);

        return rightView;
    },

    /**
     * 详细界面，转到IM聊天界面
     */
    btnOnChgToIM() {
        var me = this,
            record = me.getViewModel().get('orgSelRecord');
        // debugger;
        // 选中的不是自己
        if (User.ownerID !== record.data.id) {
            if (!record.data.leaf) {
                Ext.Msg.confirm('提示', '确定要发起群聊吗？', function (btn) {
                    if (btn == 'yes') {
                        me.chgToIMView();
                        var memsID = [];
                        memsID = BindHelper.getLeafDataFromTree(record, memsID);
                        // debugger;
                        ChatHelper.createGroupChat(memsID);
                    }
                });
            } else {
                me.chgToIMView();
                me.getView().lookup('im-main').getController().onOpenChat();

                // var viewModel = me.getViewModel(),
                //     name = viewModel.get('sendToName');
                // me.doLeftListToTop(name);
            }
        }

    },

    /**
    * 右侧页面切换为聊天页面
    */
    chgToIMView() {
        const me = this,
            rootView = me.getView(),
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
     * 最近会话移至最上方
     */
    doLeftListToTop(id) {
        const me = this,
            list = me.getView().down('#recentChat'),
            listStore = list.getStore(),
            record = listStore.getById(id);
        // listItem = list.getItem(record);

        if (record) {
            record.set('last_post_at', new Date());
            list.setSelection(record); // 设置选中
            listStore.sort('last_post_at', 'DESC'); // 动态排序
            // listStore.sort();
        }
    },


    /* *************************************处理Websocket请求**************************************************/

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
            userName = me.getName(data.user_id),
            flag = true; // 缓存中是否需要新增频道,是true，否false


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
            // if (User.crtChannelId !== cid) {
            if (User.ownerID != data.user_id) { // 不是自己发的
                if (User.crtChannelId !== cid) {
                    me.promptUnRead(cid);
                } else { // 在当前频道，有未读数量，但是不展示
                    me.promptFakeRead(cid);
                }

            }

            // }


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

                    ChatHelper.addChatToRecent(data.chat_id);

                    me.notify(userName, data.message);
                }


                // 选中的不是当前频道
                // if (User.crtChannelId !== cid) {
                if (User.ownerID != data.user_id) {
                    if (User.crtChannelId !== cid) {
                        me.promptUnRead(cid);
                    } else { // 在当前频道，有未读数量，但是不展示
                        me.promptFakeRead(cid);
                    }
                }
                // me.resetLastPostTime(userName, new Date(data.update_at));

                // }
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
            ChatHelper.onScroll(chatView);

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

            if (data.msg_type == 'I') {

                var url = Config.httpUrlForGo + 'files/' + data.attach_id + '/thumbnail';
                // 图片若未加载完成，则显示loading,加载出现异常，显示默认图片
                window.imagess(url, data.attach_id);
            }
        }
        /* ****************************************************** 最近会话重新排序 ******************************************************************************************************/
        me.reSortRecentList();
    },

    /**
     * 反解析
     * @param {string} text 消息内容
     * @param {array} fileIds 文件id
     */
    antiParse(text, fileIds) {
        var reg = /\[\w+\]/g;
        var result = text.replace(reg, function (str) {
            var out = '',
                id = str.substring(1, str.length - 1);
            // // // debugger;
            if (fileIds) {
                for (var i = 0; i < fileIds.length; i++) {
                    if (fileIds[i] == id) {
                        out = '<img class="viewPic" src="' + Config.httpUrlForGo + 'files/' + id + '">'; //+ '/thumbnail">';
                        break;
                    } else {
                        out = str;
                    }
                }
            }
            // Utils.ajaxByZY('GET', 'files/' + id + '/hasFile', {
            //     async: false, // 此处不能使用异步加载
            //     // params: JSON.stringify(id),
            //     success: function (data) {
            //         if (data == 'yes') {
            //             out = '<img class="viewPic" src="' + Config.httpUrlForGo + 'files/' + id + '/thumbnail">';
            //         } else {
            //             out = str;
            //         }
            //     }
            // });
            return out;
        });
        return result;
    },

    /**
     * 提示未读
     * @param {string} cid 用户id
     */
    promptUnRead(cid) {
        var store = this.getView().down('#recentChat').getStore(),
            record = store.getById(cid);
        record.set('isUnRead', true);
        record.set('unReadNum', record.get('unReadNum') + 1);
    },

    // 在当前频道，有未读数量，但是不展示
    promptFakeRead(cid) {
        var store = this.getView().down('#recentChat').getStore(),
            record = store.getById(cid);
        record.set('isUnRead', false);
        record.set('unReadNum', record.get('unReadNum') + 1);
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

    getName(uid) {
        for (var i = 0; i < User.allUsers.length; i++) {
            if (User.allUsers[i].user_id === uid) {
                return User.allUsers[i].user_name;
            }
        }
        return '';
    },

    /**
     * 根据channel名查找相应的record，并修改record的值
     * @param {string} userName channel名
     * @param {Date} date 日期时间
     */
    resetLastPostTime(userName, date) {
        var me = this,
            RStore = me.getView().down('#recentChat').getStore(),
            record = RStore.getAt(RStore.find('name', userName));
        // 更新record的值
        record.set('last_post_at', date);
    },

    /**
     * 最近会话重新排序
     */
    reSortRecentList() {
        var me = this,
            list = me.getView().down('#recentChat'),
            listStore = list.getStore();

        // listStore.sort('last_post_at', 'DESC');
        listStore.sort();
    },



    /* *************************************连接相关**************************************************/

    /**
     * 打开连接
     */
    mounted() {
        var me = this,
            view = me.getView(),
            viewModel = view.getViewModel();

        WebSocketHelper.initialize(Config.wsDevGoUrl);
        WebSocketHelper.setEventCallback((msg) => {
            switch (msg.event) {
                case 'posted':
                    me.handleNewPostEvent(msg);
                    break;
                default:
                    break;
            }
        });
    },



    /* **************************************** 切换tab ***********************************/
    // 切换tab时调用
    onTabChanges(tabpanel, tab, oldTab) {
        // // // debugger;
        var me = this,
            xtype,
            oldType;

        // 根据iconCls来判断所点击的是哪个tabbar
        // 当前点击的xtype
        if (tab.iconCls == 'x-fa fa-comment') {
            xtype = 'recentChat';
        } else if (tab.iconCls == 'x-fa fa-user') {
            xtype = 'left-organization';
        } else if (tab.iconCls == 'x-fa fa-th-large') {
            xtype = 'setting';
        }

        // 上次选中的xtype
        if (oldTab.iconCls == 'x-fa fa-comment') {
            oldType = 'recentChat';
        } else if (oldTab.iconCls == 'x-fa fa-user') {
            oldType = 'left-organization';
        } else if (oldTab.iconCls == 'x-fa fa-th-large') {
            oldType = 'setting';
        }


        me.showMiddle(xtype, oldType);
    },



    /* **************************************** 弹出的dialog ***********************************/
    // 群聊选人
    showGrpSel() {
        User.isPlus = true; // 判断是哪个按钮

        this.onShowGrpSel();
    },
    onShowGrpSel() {
        var view = this.getView(),
            grpSel = this.grpSel;

        if (!grpSel) {
            grpSel = Ext.apply({
                ownerCmp: view
            }, view.grpSel);

            this.grpSel = grpSel = Ext.create(grpSel);
        }

        grpSel.show();
    },

    // 消息管理器
    onShowMsgManger() {
        var me = this,
            msgMgr = me.msgMgr;

        if (!msgMgr) {
            msgMgr = Ext.widget('msgManager', {});
            me.msgMgr = msgMgr;
        }
        if (msgMgr.getParent() !== Ext.Viewport) {
            Ext.Viewport.add(msgMgr);
        }

        msgMgr.show();
    },
    // 收藏夹
    onShowFav() {
        var view = this.getView(),
            fav = this.fav;

        if (!fav) {
            fav = Ext.apply({
                ownerCmp: view
            }, view.fav);

            this.fav = fav = Ext.create(fav);
        }

        fav.show();
    },

    destroy: function () {
        Ext.destroy(this.fav);
        Ext.destroy(this.msgMgr);
        Ext.destroy(this.grpSel);
        Ext.destroy(this.grpSel2);
        this.callParent();
    },

    onShowAbout() {
        Ext.Msg.alert('版本号', 'IM 2.0.0.100');
    },


    /* **************************************** 注销 ***********************************/

    onLogout() {
        this.fireEvent('logout');
    },

    /* **************************************** 测试连接 ***********************************/
    onTestConnect() {
        Utils.ajaxByZY('get', 'users/C1064/status', {
            success: function (data) {
                debugger;
            }
        });
    }
});