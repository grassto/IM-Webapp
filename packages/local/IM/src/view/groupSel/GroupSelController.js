Ext.define('IM.view.groupSel.GroupSelController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.groupSel',


    onSearch() {
        console.log('搜索');
    },

    init() {
        // debugger;
        var grp = this.getView().down('#grpSel-org');
        BindHelper.loadOrganization(grp);
    },

    onAddMem(grid, info) {
        var me = this,
            list = me.getView().down('#grpSelMem'),
            data = info.record.data;
        me.addMemToList(data, list);
        me.getView().down('#btnDelAll').setHidden(false);
    },

    /**
     * 从树上选择节点添加到右侧list
     * @param {object} data 需要添加的数据信息
     * @param {object} list 目标list
     */
    addMemToList(data, list) {
        var me = this, result = [];
        if (data.leaf) {
            result.push(data);
            list.getStore().add(result);
        } else {
            if (data.children.length > 0) {
                for (var i = 0; i < data.children.length; i++) {
                    me.addMemToList(data.children[i], list);
                }
            }
        }
    },

    onDelAll() {
        var view = this.getView(),
            list = view.down('#grpSelMem'),
            btn = view.down('#btnDelAll');
        list.getStore().removeAll();
        btn.setHidden(true);
    },

    /**
     * 选中的用户发起多人会话
     */
    onOk() {
        const me = this,
            view = me.getView(),
            listStore = view.down('#grpSelMem').getStore(),
            listData = listStore.data.items;


        if (listData.length > 0) {

            me.showChatView(); // 显示聊天页面

            if (listData.length == 1) {
                me.onOpenDirectChat(listData); // 个人
            }
            else {
                me.onOpenGroupChat(listData); // 群聊
            }

        }

        view.hide();


    },

    showChatView() {
        Ext.Viewport.down('IM').getController().showRightView('im-main', 'pageblank');
        Ext.Viewport.down('IM').getController().showRightView('im-main', 'details');
    },

    onOpenDirectChat(listData) {
        var imView = Ext.Viewport.down('IM'),
            mainView = imView.lookup('im-main');
        mainView.getController().openChat(listData[0].data.id, listData[0].data.nickname);
        imView.getViewModel().set({
            'sendToName': listData[0].data.nickname,
            'isOrgDetail': false
        });
    },

    onOpenGroupChat(listData) {
        var me = this,
            members = [];
        members.push(User.ownerID);
        for (var i = 0; i < listData.length; i++) {
            members.push(listData[i].data.id);
        }

        Utils.mask(Ext.Viewport);
        Utils.ajaxByZY('post', 'channels/group', {
            params: JSON.stringify(members),
            success: function (data) {
                console.log('创建多人会话成功', data);
                // debugger;
                User.allChannels.push(data);
                User.crtChannelId = data.id;

                me.addChannelToRecent(data);

                if (data.display_name.length > 8) {
                    data.display_name = data.display_name.substr(0, 8) + '...';
                }
                Ext.Viewport.down('IM').getViewModel().set({
                    'sendToName': data.display_name,
                    'isOrgDetail': false
                });
                Ext.Viewport.down('IM').lookup('im-main').down('#chatView').getStore().removeAll();
            },
            failure: function (data) {
                console.log('创建多人会话失败', data);
            },
            callback() {
                Utils.unMask(Ext.Viewport);
            }
        });
    },

    /**
     * 添加数据至最近会话
     * @param {json} data 数据
     */
    addChannelToRecent(data) {
        const recentChatView = Ext.Viewport.down('IM').down('#left_members'),
            chatStore = recentChatView.getStore();

        chatStore.add({
            id: data.id,
            name: data.display_name,
            type: data.type
        });
    },

    onCancle() {
        this.getView().hide();
        // this.onHide();
    },

    /**
     * 删除list中选中人
     * @param {*} value record
     */
    onDisclosureTap(value) {
        this.getView().down('#grpSelMem').getStore().remove(value);
    },

    onBeforeHide() {
        var view = this.getView();
        view.down('#grpSelMem').getStore().removeAll();
        view.down('#btnDelAll').setHidden(true);
    }
});