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
                // doubleTapOrg: 'btnOnChgToIM'
            },
            'im-right-main': {
                grpSel: 'onShowGrpSel',
                // antiParse: 'antiParse',
                listToTop: 'doLeftListToTop'
            }
        }
    },

    init: function () {
        var me = this;
        me.callParent(arguments);

        me.handleCEF();

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
        ChatHelper.showRightView('pageblank');
    },

    // 是否展示关闭头
    handleCEF() {
        if(window.cefMain) {
            this.getViewModel().set('isHideBrowseTitle', false);
        }
    },

    /**
     * 右侧的页面切换
     * @param {string} xtype 需要展示的xtype
     * @param {string} oldType 需要删除的xtype
     */
    showRightView(xtype, oldType) {
        const me = this,
            view = me.getView().down('#exceptTitle');

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
     * 最近会话移至最上方（不要）
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


    /* *************************************连接相关**************************************************/

    /**
     * 打开连接
     */
    mounted() {
        var me = this,
            view = me.getView(),
            viewModel = view.getViewModel();

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
        Ext.Msg.alert('版本号', 'IM 2.0.0.100');
    },


    /* **************************************** 注销 ***********************************/

    onLogout() {
        this.fireEvent('logout');
    },

    /* **************************************** 测试连接 ***********************************/
    onTest() {
        // Utils.ajaxByZY('get', 'users/C1064/status', {
        //     success: function (data) {
        //         debugger;
        //     }
        // });
        Ext.Viewport.getController().showView('testView');
    }
});