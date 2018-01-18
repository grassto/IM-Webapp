Ext.define('IM.utils.BindHelper', {
    alternateClassName: 'BindHelper',
    singleton: true,

    // 加载个人信息
    loadOwner(mainView) {
        var viewModel = mainView.getViewModel();
        viewModel.set('ownerName', User.crtUser.nickname);
        viewModel.set('ownerMail', User.crtUser.email);
    },

    // 最近会话
    loadRecentChat(mainView) {
        var leftMembers = mainView.down('#left_members'),
            store = leftMembers.getStore();
        for (let i = 0; i < User.allChannels.length; i++) {
            if (User.allChannels[i].type == 'D') {
                store.add({
                    id: User.allChannels[i].id,
                    name: User.allChannels[i].channelname,
                    type: 'D'
                });
            }
            else {
                store.add({
                    id: User.allChannels[i].id,
                    name: User.allChannels[i].display_name,
                    type: 'G'
                });
            }
        }
    },


    // 加载组织结构树信息(之后还需处理)
    loadOrganization(mainView) {
        // debugger;
        var orgTree = mainView.down('#organization'),
            treeStore = orgTree.getViewModel().data.navItems,
            target = orgTree.getSelections()[0] || treeStore.getRoot(),
            node = [];

        for (let i = 0; i < User.allOthers.length; i++) {
            User.allOthers[i].name = User.allOthers[i].nickname;
            User.allOthers[i].leaf = true;
            User.allOthers[i].iconCls = 'hide-icon';
            node.push(User.allOthers[i]);
        }
        target.appendChild(node);
    }

});