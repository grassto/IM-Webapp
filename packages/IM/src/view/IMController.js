Ext.define('IM.view.IMController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.IM',

    requires: [
        'IM.utils.AvatarMgr',
        'IM.utils.WebSocketHelper',
        'IM.utils.BindHelper',
        'MX.util.Utils'
    ],
    uses: [
        'IMCommon.local.LocalDataMgr',
        'IMCommon.local.InitDb'
    ],

    listen: {
        controller: {
            'recentChat': {
                showRight: 'showRightView'
            },
            'left-orgController': {
                showRight: 'showRightView',
                // doubleTapOrg: 'btnOnChgToIM'
            },
            'im-right-main': {
                grpSel: 'onShowGrpSel',
                // antiParse: 'antiParse',
                // listToTop: 'doLeftListToTop'
            }
        }
    },

    init: function () {
        var me = this;
        me.callParent(arguments);

        if (Config.isPC) {
            Utils.mask(me.getView().down('#recentChat')); // 遮罩
            InitDb.initDB(() => {
                me.showLocalData();// 展示本地数据
                Utils.unMask(me.getView().down('#recentChat'));

                me.mounted();// 打开连接
            });

            me.handleCEF(); // 是否展示关闭、最大化、最小化按钮
        } else {
            me.mounted();// 打开连接
        }

        me.handleSearch();// 左侧搜索框，快速搜索联系人

        ChatHelper.showRightView('pageblank');// 右侧页面展示
    },

    // 展示本地数据库数据
    showLocalData() {
        var me = this;

        // ownData = LocalDataMgr.getOwnInfo(User.ownerID, me.bindLocalAva),
        LocalDataMgr.getRecentChat(me.bindRecChats); // 最近会话
    },

    // 初始化绑定本地最近会话数据
    bindRecChats(trans, resultSet) {
        var rows = resultSet.rows,
            len = rows.length;

        var recentStore = Ext.Viewport.lookup('IM').down('#recentChat').getStore(),
            datas = [],
            row = {};
        for (var i = 0; i < len; i++) {
            row = rows.item(i);
            datas.push({
                id: row.ChatID,
                name: row.DisplayName,
                type: row.ChatType,
                status: -2, // 不显示状态
                isUnRead: row.UnreadCount > 0,
                unReadNum: row.UnreadCount,
                last_post_at: row.LastPostAt,
                last_post_userName: row.LastUserName,
                last_msg_type: row.LastMsgType,
                last_post_msg: row.LastMsg
            });
        }
        recentStore.add(datas);
    },


    // bindLocalAva(trans, resultSet) {
    //     debugger;
    //     var rows = resultSet.rows,
    //     len = rows.length;
    //     if(len > 0) {
    //     }
    // },

    // 是否展示关闭头
    handleCEF() {
        this.getViewModel().set('isHideBrowseTitle', false);
    },

    handleSearch() {
        var me = this,
            form = me.lookup('searchForm');
        var map = new Ext.util.KeyMap({
            target: form.element,
            key: 13, // or Ext.event.Event.ENTER
            handler() {
                // me.onSearch();
            },
            scope: me
        });
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



    /* *************************************处理Websocket请求**************************************************/


    /* *************************************连接相关**************************************************/

    /**
     * 打开连接
     */
    mounted() {
        var me = this,
            view = me.getView();

        ConnectHelper.getMe(view.getViewModel());
        ConnectHelper.getUnreadChats(view);
        // ConnectHelper.getMembers(view); // 延期到点击组织结构的tab的时候才去加载

        WebSocketHelper.initialize(Config.wsGoUrl);
        WebSocketHelper.setEventCallback((msg) => {
            switch (msg.event) {
                case SocketEventType.posted:
                    SocketEventHelper.handleNewPostEvent(msg);
                    break;
                case SocketEventType.createGrp:
                    SocketEventHelper.handleGrpAddEvent(msg);
                    break;
                case SocketEventType.memAdd:
                    SocketEventHelper.handleMemAddEvent(msg);
                    break;
                case SocketEventType.memRemove:
                    SocketEventHelper.handleMemRemoveEvent(msg);
                    break;
                case SocketEventType.chgManager:
                    SocketEventHelper.handleMgrChgEvent(msg);
                    break;
                case SocketEventType.updateChat:
                    SocketEventHelper.handleChgChatHeader(msg);
                    break;
                default:
                    break;
            }
        });
        WebSocketHelper.setReconnectCallback(function () {
            ConnectHelper.getMe(view.getViewModel());
            User.isFirstCon = true; // 初次加载组织结构树
            // ConnectHelper.getMembers(view);
            ConnectHelper.getUnreadChats(view);
        });
    },



    /* **************************************** 切换tab ***********************************/
    // 切换tab时调用
    onTabChanges(tabpanel, tab, oldTab) {
        var me = this,
            xtype,
            oldType;

        // 根据iconCls来判断所点击的是哪个tabbar
        // 当前点击的xtype
        if (tab.iconCls == 'x-fa fa-comment') {
            xtype = 'recentChat';
        } else if (tab.iconCls == 'x-fa fa-user') {
            xtype = 'left-organization';
            // 组织结构树第一次加载
            if (User.isFirstCon) {
                User.isFirstCon = false;
                ConnectHelper.getMembers(me.getView());
            }
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

    // 使用子控件的隐藏与展示来切换
    showMiddle(xtype, oldType) {
        const me = this,
            view = me.getView().down('#middleView');

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
        this.callParent();
    },

    onShowAbout() {
        Ext.Msg.alert('版本号', 'IM ' + Config.version);
    },


    /* **************************************** 注销 ***********************************/

    onLogout() {
        this.fireEvent('logout');
    }
});