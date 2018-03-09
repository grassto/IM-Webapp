Ext.define('IM.view.leftTab.recentChat.RecentChatController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.recentChat',

    /**
     * 最近会话选中事件
     * @param {Ext.dataview.List} me 对应的list
     * @param {Ext.list.Location} location
     */
    onSelRecentMem(view, location) {
        var me = this;
        // debugger;
        me.onShowChatView();
        me.setRightTitle(location.record.data.name);
        me.fireEvent('openCnl', location.record.data.id);

        me.onShowGrpMem(location.record.data, view);

        me.setTitleStatus(location.record.data);
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

    // /**
    //  * 打开会话，获取历史记录进行绑定
    //  * @param {string} selCnlID 当前选中的频道ID
    //  */
    // openChannel(crtChannelID) {
    //     User.crtChannelId = crtChannelID;
    //     // debugger;

    //     var me = this,
    //         chatView = me.getView().up('IM').lookup('im-main').down('#chatView'),
    //         message;
    //     var chatStore = chatView.store;
    //     chatStore.removeAll();
    //     Utils.ajaxByZY('get', 'channels/' + crtChannelID + '/posts', {
    //         success: function (data) {
    //             var order = data.order,
    //                 posts = data.posts;
    //             User.posts = [];
    //             for (var i = order.length - 1; i >= 0; i--) {
    //                 posts[order[i]].username = me.getName(posts[order[i]].user_id);
    //                 User.posts.push(posts[order[i]]);
    //                 message = me.textToHtml(posts[order[i]].message);

    //                 if (posts[order[i]].file_ids) {
    //                     for (var j = 0; j < posts[order[i]].file_ids.length; j++) {
    //                         // 若是自己发送的消息，则靠右排列
    //                         if (posts[order[i]].user_id == User.ownerID) {
    //                             chatStore.add({ ROL: 'right', senderName: posts[order[i]].username, sendText: message, updateTime: new Date(posts[order[i]].update_at), file: Config.httpUrlForGo + '/files/' + posts[order[i]].file_ids[j] + '/thumbnail' });
    //                         }
    //                         else {
    //                             chatStore.add({ senderName: posts[order[i]].username, sendText: message, updateTime: new Date(posts[order[i]].update_at), file: Config.httpUrlForGo + '/files/' + posts[order[i]].file_ids[j] + '/thumbnail' });
    //                         }
    //                     }
    //                 }
    //                 else {
    //                     if (posts[order[i]].user_id == User.ownerID) {
    //                         chatStore.add({ ROL: 'right', senderName: posts[order[i]].username, sendText: message, updateTime: new Date(posts[order[i]].update_at) });
    //                     }
    //                     else {
    //                         chatStore.add({ senderName: posts[order[i]].username, sendText: message, updateTime: new Date(posts[order[i]].update_at) });
    //                     }
    //                 }
    //             }

    //             me.onScroll(chatView);
    //         }
    //     });
    // },

    // /**
    //  *  根据id获取昵称
    //  */
    // getName(uid) {
    //     for (var i = 0; i < User.allUsers.length; i++) {
    //         if (User.allUsers[i].id === uid) {
    //             return User.allUsers[i].nickname;
    //         }
    //     }
    //     return '';
    // },

    // /**
    //  * 聊天展示区，滚动条自动滚动到最下方
    //  * @param {object} chatView 容器
    //  */
    // onScroll(chatView) {
    //     var sc = chatView.getScrollable(),
    //     scHeight = sc.getScrollElement().dom.scrollHeight;
    //     sc.scrollTo(0, scHeight + 1000);
    // },

    // // 替换字符串中的回车
    // textToHtml(text) {
    //     return text.replace(/\n/g, '<br/>').replace(/\r/g, '<br/>').replace(/\r\n/g, '<br/>');
    // }
});