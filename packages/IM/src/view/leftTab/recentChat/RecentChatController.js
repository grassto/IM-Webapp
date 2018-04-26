Ext.define('IM.view.leftTab.recentChat.RecentChatController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.recentChat',

    requires: [
        'IMCommon.local.LocalDataMgr'
    ],

    init() {
        // 先从本地拉取数据
        var localChat = LocalDataMgr.getRecentChat();
        // 绑定本地数据至页面
        this.bindLocalData(localChat);
    },
    
    bindLocalData(localChat) {
        var store = this.getView().getStore();
        store.add(localChat);
    },


    /**
     * 最近会话选中事件
     * @param {Ext.dataview.List} me 对应的list
     * @param {Ext.list.Location} location
     */
    onSelRecentMem(view, location) {
        const data = location.record.data;
        if(data.id !== User.crtChannelId) {
            if(data.type === 'D') {
                ChatHelper.openDirectChat(data.id);
            } else if(data.type === 'G') {
                ChatHelper.openGroupChat(data.id);
            }
        }
        // ChatHelper.chgToIMView();
        
        // debugger;
        // me.onShowChatView();
        // me.setRightTitle(location.record.data.name);
        // me.fireEvent('openCnl', location.record.data.id);

        // me.onShowGrpMem(location.record.data, view);

        // me.setTitleStatus(location.record.data);
        // me.onShowStatus(location.record.data);

    },

    /**
     * 展示右侧聊天页面
     */
    onShowChatView() {
        const rootView = this.getView().up('IM'),
            imMainView = rootView.lookup('im-main');
        if (!imMainView) { // 存在了就不切换
            var detailsView = rootView.lookup('details'),
                blankView = rootView.lookup('pageblank');
            if (blankView) { // 不存在im-main容器，则添加
                this.fireEvent('showRight', 'im-main', 'pageblank');
            }
            if (detailsView) {
                this.fireEvent('showRight', 'im-main', 'details');
            }
        }
    },

    /**
     * 改变右侧标题头的姓名
     * @param {string} name 名字
     */
    setRightTitle(name) {
        var viewmodel = this.getViewModel();
        viewmodel.set('sendToName', name);
        viewmodel.set('isOrgDetail', false);
    },

    /**
     * 展示频道中的成员
     * @param {json} data 选中的频道数据
     */
    onShowGrpMem(data, view) {
        var me = this,
            groupMemsView = view.up('IM').lookup('im-main').down('#groupList'),
            memStore = groupMemsView.getStore();
        if (data.type == 'D') {

            groupMemsView.hide();

        } else if (data.type == 'G') {
            groupMemsView.show();
            memStore.removeAll();
            var mems = BindHelper.getMemsByChatId(data.id);

            mems = me.handleStatus(mems);

            memStore.add(mems);
        }

    },

    handleStatus(mems) {
        for (var i = 0; i < mems.length; i++) {
            mems[i].status = StatusHelper.getStatus(mems[i].user_id);
        }
        return mems;
    },

    setTitleStatus(data) {
        var viewModel = Ext.Viewport.down('IM').getViewModel();
        if (data.type == 'D') {
            viewModel.set({
                'showStatus': 'inline',
                'status': data.status
            });
        } else if (data.type == 'G') {
            viewModel.set('showStatus', 'none');
        }
    }

});