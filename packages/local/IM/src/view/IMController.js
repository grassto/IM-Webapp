Ext.define('IM.view.IMController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.IM',

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
            },
            'chatController': {
                'fav': 'onShowFav'
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
    * 右侧页面切换为聊天页面
    */
    onChgToIM() {
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
        var me = this;
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
    }
});