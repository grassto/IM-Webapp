Ext.define('IM.view.groupSel.GroupSelController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.groupSel',

    /**
     * show之前组织组织结构树信息,主要是选中当前频道下的所有人，并且不能再编辑
     */
    onBeforeShow() {
        var orgView = this.getView().down('#grpSel-org'),
            grpStore = orgView.getStore();
        // orgView.expandAll(); // 不展开会找不到
        // orgView.collapseAll(); // 全部收起 在这全部收起也找不到

        GroupSelHelper.handleChatMem();
        // debugger;
        GroupSelHelper.setDefaultSel(grpStore);
    },

    onSearch() {
        console.log('搜索');
    },

    init() {
        var grp = this.getView().down('#grpSel-org');

        BindHelper.loadOrganization(grp);
    },

    onAddMem(grid, info) {
        var me = this,
            list = me.getView().down('#grpSelMem'),
            data = info.record.data;
        me.addMemToList(data, list);
        // me.getView().down('#btnDelAll').setHidden(false);
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


        if (User.isPlus) { // 由加号发起的多人会话
            if (User.crtChatMembers.length > 0 && listData.length > 0) {
                me.showChatView(); // 显示聊天页面
                if (listData.length == 1 && User.crtChatMembers.length == 1) {
                    me.onOpenDirectChat(listData); // 个人
                }
                else {
                    me.onOpenGroupChat(listData); // 群聊
                }

            }
        } else {
            if(listData.length > 0) {
                BindHelper.onAddMemToGroup(listData);
            }
        }

        view.hide();
    },

    // 展示聊天页面
    showChatView() {
        Ext.Viewport.down('IM').getController().showRightView('im-main', 'pageblank');
        Ext.Viewport.down('IM').getController().showRightView('im-main', 'details');
    },

    onOpenDirectChat(listData) {
        var imView = Ext.Viewport.down('IM'),
            mainView = imView.lookup('im-main');
        // debugger;
        mainView.getController().openChat(listData[0].data.id, listData[0].data.name);
        imView.getViewModel().set({
            'sendToName': listData[0].data.name,
            'isOrgDetail': false
        });
    },

    /**
     * 选中多人发起会话
     * @param {*} listData 
     */
    onOpenGroupChat(listData) {
        var me = this,
            members = [];
        for (var i = 0; i < User.crtChatMembers.length; i++) {
            members.push(User.crtChatMembers[i]);
        }
        // debugger;
        for (var i = 0; i < listData.length; i++) {
            members.push(listData[i].data.id);
        }

        me.createGroupChat(members);

    },

    /**
     * 创建多人会话，并进行展示，User.crtChannelId
     * @param {Array} members 参与的成员
     */
    createGroupChat(members) {
        var me = this;
        Utils.mask(Ext.Viewport);
        Utils.ajaxByZY('post', 'chats/group', {
            // async: false,
            params: JSON.stringify(members),
            success: function (data) {
                console.log('创建多人会话成功', data);
                // debugger;

                User.crtChannelId = data.chat_id;
                me.handleUserCache(data);

                me.addChannelToRecent(data);

                if (data.chat_name.length > 8) {
                    data.chat_name = data.chat_name.substr(0, 8) + '...';
                }
                Ext.Viewport.down('IM').getViewModel().set({
                    'sendToName': data.chat_name,
                    'isOrgDetail': false
                });
                if(Ext.Viewport.down('IM').lookup('im-main')) {
                    Ext.Viewport.down('IM').lookup('im-main').down('#chatView').getStore().removeAll();
                }
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
     * 通过请求将members放入缓存
     * @param {object} handleUserCache 需要放入缓存的数据
     */
    handleUserCache(data) {
        var mems = [];

        Utils.ajaxByZY('get', 'chats/' + data.chat_id + '/members', {
            success: function (result) {
                mems = result;
                User.allChannels.push({
                    chat: data,
                    members: mems
                });
            }
        });
    },

    /**
     * 添加数据至最近会话
     * @param {json} data 数据
     */
    addChannelToRecent(data) {
        const recentChatView = Ext.Viewport.down('IM').down('#recentChat'),
            chatStore = recentChatView.getStore();

        var record = chatStore.add({
            id: data.chat_id,
            name: data.chat_name,
            type: data.chat_type,
            last_post_at: new Date(data.update_at)
        });

        recentChatView.setSelection(record);
        chatStore.sort();
    },

    /**
     * 关闭GroupSel弹出层
     */
    onCancle() {
        this.getView().hide();
    },

    /**
     * 删除list中选中人
     * @param {*} value record
     */
    onDisclosureTap(value) {
        const view = this.getView(),
            store = view.down('#grpSelMem').getStore();
        store.remove(value);
        // debugger;

        // 组织结构树设置未选中
        var uid = value.data.id,
            orgStore = view.down('#grpSel-org').getStore(),
            orgSelRecord = orgStore.getNodeById(uid);
        // orgSelIndex = orgStore.find('id', uid),
        // orgSelRecord = orgStore.getAt(orgSelIndex);
        if (orgSelRecord) {
            orgSelRecord.set('isSel', false);
        }

        // 设置删除所有隐藏
        // if (store.data.length == 0) {
        //     view.down('#btnDelAll').setHidden(true);
        // }
    },

    /**
     * 隐藏前将所有状态都设为初始状态
     */
    onBeforeHide() {
        var view = this.getView();
        view.down('#grpSelMem').getStore().removeAll(); // list清空
        // view.down('#btnDelAll').setHidden(true); // 删除所有按钮隐藏

        this.orgHideDefault();
    },

    /**
     * 组织结构树设置为初始状态
     */
    orgHideDefault() {
        var orgView = this.getView().down('#grpSel-org'),
            orgStore = orgView.getStore();
        orgView.expandAll(); // 不展开会找不到

        var items = orgStore.getData().items;
        for (var i = 0; i < items.length; i++) {
            items[i].set('isSel', false);
        }

        orgView.collapseAll();
    }
});