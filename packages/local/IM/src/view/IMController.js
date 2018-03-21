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

    /**
     * 右侧的页面切换
     * @param {string} xtype 需要展示的xtype
     * @param {string} oldType 需要删除的xtype
     */
    showRightView(xtype, oldType) {
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

        // 选中的不是自己
        if (User.ownerID !== record.data.id) {
            if (!record.data.leaf) {
                Ext.Msg.confirm('提示', '确定要发起群聊吗？', function (btn) {
                    if (btn == 'yes') {
                        me.chgToIMView();
                        var memsID = [];
                        memsID = BindHelper.getLeafDataFromTree(record, memsID);
                        
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
     * 反解析
     * @param {string} text 消息内容
     * @param {array} fileIds 文件id
     */
    antiParse(text, fileIds) {
        var reg = /\[\w+\]/g;
        var result = text.replace(reg, function (str) {
            var out = '',
                id = str.substring(1, str.length - 1);
            
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
                    SocketEventHelper.handleNewPostEvent(msg);
                    break;
                case 'group_added':
                    SocketEventHelper.handleGrpAddEvent(msg);
                    break;
                case 'members_added':
                    SocketEventHelper.handleMemAddEvent(msg);
                    break;
                case 'member_removed':
                    SocketEventHelper.handleMemRemoveEvent(msg);
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