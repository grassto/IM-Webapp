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
                'showRight': 'showRightView'
            },
            'left-orgController': {
                'showRight': 'showRightView'
            },
            'im-right-main': {
                'grpSel': 'onShowGrpSel'
            }
        }
    },

    init: function () {
        var me = this;
        me.callParent(arguments);

        // 设置当前用户头像
        var viewmodel = me.getViewModel();
        var avatar = AvatarMgr.getAvatarHtmlByName(viewmodel.get('ownerName'));
        viewmodel.set('avatar', avatar);

        // 搜索框
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

        // 打开连接
        me.mounted();
    },

    /**
     * 右侧的页面切换
     * @param {string} xtype 需要展示的xtype
     * @param {string} oldType 需要删除的xtype
     */
    showRightView(xtype, oldType) {
        // debugger;
        const me = this,
            view = me.getView();

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
        // view.setActiveItem(rightView);

        return rightView;
    },

    /**
     * 详细界面，转到IM聊天界面
     */
    btnOnChgToIM() {
        var me = this,
            record = me.getViewModel().get('orgSelRecord');
        if (!record.data.leaf) {
            Ext.Msg.confirm('提示', '确定要发起群聊吗？', function (btn) {
                if (btn == 'yes') {
                    me.chgToIMView();
                    me.getView().lookup('im-main').getController().onOpenChat();
                }
            });
        } else {
            me.chgToIMView();
            me.getView().lookup('im-main').getController().onOpenChat();
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

    /* *************************************连接相关**************************************/

    /**
     * websocket接收请求后执行，将数据绑定至页面
     * @param {object} msg 服务器返回的数据
     */
    handleNewPostEvent(msg) {
        var me = this,
            data = JSON.parse(msg.data.post),
            cName = msg.data.channel_name,
            cid = msg.broadcast.channel_id,
            // text = Utils.htmlEncode(data.message),
            text = data.message,
            flag = true;

        /* ****************************************** 未读提示 ********************************************************************/
        if (msg.data.channel_display_name == '多人会话') {
            // 不是自己发的
            if (data.user_id !== User.ownerID) {

                // 选中的不是当前频道，给未读通知
                if (User.crtChannelId !== cid) {
                    me.promptUnRead(cid);
                }
                // 给通知
                me.notify('多人会话：' + me.getName(data.user_id), data.message);
            }
        }
        else { // 个人用户
            // 先判断是不是发给你的,若是的
            if (cName.indexOf(User.ownerID) > -1) {
                // 当前缓存中的所有频道中包含该频道
                for (var i = 0; i < User.allChannels.length; i++) {
                    // 找到了,给未读提示，直接退出
                    if (User.allChannels[i].id == cid) {
                        flag = false;

                        // 选中的不是当前频道
                        if (User.crtChannelId !== cid) {
                            me.promptUnRead(cid);

                            if (data.user_id !== User.ownerID) {
                                me.notify(me.getName(data.user_id), data.message);
                            }
                            break;
                        }
                    }
                }
                // 未找到相同的channelid，则添加
                if (flag) {
                    User.allChannels.push({ id: cid, name: cName });
                    var channelStore = me.getView().down('#left_members').getStore();
                    channelStore.add({
                        id: cid,
                        name: me.getName(data.user_id),
                        isUnRead: true,
                        unReadNum: 1
                    });

                    me.notify(me.getName(data.user_id), data.message);
                }
            }
        }


        /* ****************************************** 当前频道，消息展示 ********************************************************************/
        // 若选中的是当前频道，则在聊天区展示数据
        if (User.crtChannelId == data.channel_id) {
            data.username = me.getName(data.user_id);
            User.posts.push(data);
            text = window.minEmoji(text);
            text = me.antiParse(text);

            // var chatView = Ext.app.Application.instance.viewport.getController().getView().down('main #chatView');
            var chatView = me.getView().lookup('im-main').down('#chatView');
            // if (data.file_ids) {
            //     for (var i = 0; i < data.file_ids.length; i++) {
            //         if (User.ownerID == data.user_id) {
            //             chatView.store.add({ ROL: 'right', senderName: data.username, sendText: text, updateTime: new Date(data.update_at), file: Config.httpUrlForGo + '/files/' + data.file_ids[i] + '/thumbnail' });
            //         }
            //         else {
            //             chatView.store.add({ senderName: data.username, sendText: text, updateTime: new Date(data.update_at), file: Config.httpUrlForGo + '/files/' + data.file_ids[i] + '/thumbnail' });
            //         }
            //     }
            // }
            // else {
            //     if (User.ownerID == data.user_id) {
            //         chatView.store.add({ ROL: 'right', senderName: data.username, sendText: text, updateTime: new Date(data.update_at) });
            //     }
            //     else {
            //         chatView.store.add({ senderName: data.username, sendText: text, updateTime: new Date(data.update_at) });
            //     }
            // }


            if (User.ownerID == data.user_id) {
                chatView.store.add({ ROL: 'right', senderName: data.username, sendText: text, updateTime: new Date(data.update_at) });
            }
            else {
                chatView.store.add({ senderName: data.username, sendText: text, updateTime: new Date(data.update_at) });
            }
            // debugger;
            me.onScroll(chatView);
        }
    },

    antiParse(text) {
        var reg = /\[\w+\]/g;
        var result = text.replace(reg, function (str) {
            var out = '',
                id = str.substring(1, str.length - 2);
            Utils.ajaxByZY('GET', 'files/' + id + '/hasFile', {
                params: JSON.stringify(id),
                success: function (data) {
                    debugger;
                }
            });
        });
    },

    // 提示未读
    promptUnRead(cid) {
        var store = this.getView().down('#left_members').getStore(),
            record = store.getById(cid);
        record.set('isUnRead', true);
        record.set('unReadNum', record.get('unReadNum') + 1);
    },

    // 消息通知
    notify(senderName, sendText) {
        if (!window.Notification) {
            alert("浏览器不支持通知！");
        }
        console.log(window.Notification.permission);
        if (window.Notification.permission != 'granted') {
            Notification.requestPermission(function (status) {
                //status是授权状态，如果用户允许显示桌面通知，则status为'granted'
                console.log('status: ' + status);
                //permission只读属性:
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
                console.log("显示通知");
                setTimeout(function () { n.close() }, 8000);
            };
            n.onclick = function () {
                window.focus();
                n.close();
            };
            n.onclose = function () {
                console.log("通知关闭");
            };
            n.onerror = function () {
                console.log('产生错误');
            }
        }
    },

    getName(uid) {
        for (var i = 0; i < User.allUsers.length; i++) {
            if (User.allUsers[i].id === uid) {
                return User.allUsers[i].nickname;
            }
        }
        return '';
    },

    onScroll(chatView) {
        var sc = chatView.getScrollable(),
            scHeight = sc.getScrollElement().dom.scrollHeight;
        sc.scrollTo(0, scHeight + 1000);
    },


    mounted() {
        var me = this;
        me.getMe();
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
        me.getMembers();
        // me.getPreferences();
    },

    // 获取个人信息
    getMe() {
        var me = this;
        Utils.ajaxByZY('GET', 'users/me', {
            success: function (data) {
                // debugger;
                console.log('个人信息：');
                console.log(data);
                User.crtUser = data;
                var viewmodel = me.getView().getViewModel();
                viewmodel.set('ownerName', data.nickname);
                viewmodel.set('ownerMail', data.email);
                viewmodel.set('avatar', AvatarMgr.getAvatarHtmlByName(data.nickname));
            }
        });
    },

    // 获取所有成员
    getMembers() {
        var me = this,
            orgTree = me.getView().down('#left-organization');
        Utils.ajaxByZY('GET', 'users', {
            success: function (data) {
                console.log('所有人员：');
                console.log(data);
                User.allUsers = data;
                for (let i = 0; i < data.length; i++) {
                    if (data[i].id !== User.ownerID) {
                        // debugger;
                        User.allOthers.push(data[i]);
                    }
                }

                BindHelper.loadOrganization(me.getView());

                me.getChannels();

                // 定时获取状态 30s
                // me.getStatus(data);
                // setInterval(() => {
                //     me.getStatus(data);
                // }, 60 * 1000);
            }
        });

    },

    // 获取频道，单人对话也是频道
    getChannels() {
        var me = this;
        Utils.ajaxByZY('get', 'users/me/channels', {
            success: function (data) {
                console.log('所有频道：');
                console.log(data);

                for (let i = 0; i < data.length; i++) {
                    if (data[i].type == 'D') {
                        for (let j = 0; j < User.allOthers.length; j++) {
                            if (data[i].name.indexOf(User.allOthers[j].id) > -1) {
                                data[i].channelname = User.allOthers[j].nickname;
                                User.allChannels.push(data[i]);
                                break;
                            }
                        }
                    }
                    else {
                        User.allChannels.push(data[i]);
                    }
                }
                BindHelper.loadRecentChat(me.getView());

                // 设置默认选中第一个
                // var record = me.getView().down('#left_members').getStore().getAt(0);
                // me.onSelectChannel('', '', '', record);
            }
        });
    },

    // 状态信息
    getStatus(us) {
        var me = this,
            uArray = [],
            tmp = (User.allUsers != null && User.allUsers.length > 0) ? User.allUsers : us;
        for (let i = 0; i < tmp.length; i++) {
            uArray.push(tmp[i].id);
        }
        Utils.ajax('POST', 'users/status/ids', {
            params: JSON.stringify(uArray),
            success: function (data) {
                console.log('所有人员状态：');
                console.log(data);
                User.allStatus = data;
            }
        });
    },



    /* **************************************** 切换tab ***********************************/
    // 切换tab时调用
    onTabChanges() {

    },



    /* **************************************** 弹出的dialog ***********************************/
    // 群聊选人
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
        this.callParent();
    },


    /* **************************************** 注销 ***********************************/

    onLogout() {
        this.fireEvent('logout');
    }
});