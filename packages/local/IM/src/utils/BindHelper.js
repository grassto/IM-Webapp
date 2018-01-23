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
        // debugger;
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
        var orgTree = mainView.down('#left-organization'),
            // treeStore = orgTree.getViewModel().data.navItems,
            treeStore = orgTree.getStore(),
            target = orgTree.getSelections()[0] || treeStore.getRoot(),
            node = [];

        // 设置根节点
        target.data.name = 'PushSoft';

        for (let i = 0; i < User.allOthers.length; i++) {
            User.allOthers[i].name = User.allOthers[i].nickname;
            User.allOthers[i].leaf = true;
            // User.allOthers[i].iconCls = 'hide-icon';
            node.push(User.allOthers[i]);
        }
        target.appendChild(node);
    },


    setDetails() {
        
    }

});