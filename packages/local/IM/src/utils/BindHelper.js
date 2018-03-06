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
    loadRecentChat(leftMembers) {
        // debugger;
        var store = leftMembers.getStore();
        for (let i = 0; i < User.allChannels.length; i++) {
            // if (User.allChannels[i].type == 'D') {
            //     store.add({
            //         id: User.allChannels[i].id,
            //         name: User.allChannels[i].channelname,
            //         type: 'D'
            //     });
            // }
            // else {
            //     store.add({
            //         id: User.allChannels[i].id,
            //         name: User.allChannels[i].display_name,
            //         type: 'G'
            //     });
            // }

            store.add({
                id: User.allChannels[i].chat.chat_id,
                name: User.allChannels[i].chat.channelname,
                type: User.allChannels[i].chat.chat_type
            });

        }
    },


    // 加载组织结构树信息(之后还需处理)
    loadOrganization(orgTree) {
        var me = this,
            treeStore = orgTree.getStore(),
            target = orgTree.getSelections()[0] || treeStore.getRoot(),
            nodes = [],
            orgs = User.organization.concat(),
            users = User.allUsers;
        // otherUsers = User.allOthers;

        // 创建节点树
        for (var i = 0; i < orgs.length; i++) {
            if (orgs[i].parent_id === '') {// 根节点
                target.data.name = orgs[i].org_name;
                target.data.id = orgs[i].org_id;

                orgs.splice(i, 1);
                nodes.push(target);

                // 递归创建子节点
                me.createNodes(nodes, orgs);
                break;
            }
        }

        // 得到tree的所有树节点，并存入nodes
        nodes = me.getNodes(target, nodes);
        // debugger;

        // 将user添加到树上
        for (var j = 0; j < nodes.length; j++) {
            for (var k = 0; k < users.length; k++) {
                // org_ids要注意
                if (users[k].org_ids == nodes[j].data.id) {
                    nodes[j].appendChild({
                        id: users[k].user_id,
                        name: users[k].user_name,
                        def_role_name: users[k].def_role_name,
                        leaf: true
                    });
                }
            }
        }
    },

    createNodes(root, orgs) {
        var me = this,
            // result = {},
            nodes = [],
            node;

        for (var i = 0; i < root.length; i++) { // 遍历节点
            for (var j = 0; j < orgs.length; j++) { // 添加子节点
                if (orgs[j].parent_id == root[i].data.id) {
                    node = root[i].appendChild({
                        id: orgs[j].org_id,
                        name: orgs[j].org_name,
                        leaf: false
                    });
                    nodes.push(node);

                    // delete orgs[j];
                    orgs.splice(j, 1);
                    j = j - 1;
                }
            }
        }

        // for (var k = 0; k < orgs.length; k++) {
        //     if (!orgs[k]) {
        //         orgs.splice(k, 1);
        //     }
        // }

        if (orgs.length > 0) {
            me.createNodes(nodes, orgs);
        }

        // result.nodes = nodes;
        // result.orgs = orgs;

        // return result;
    },

    getNodes(node, nodes) {
        var me = this;
        for (var i = 0; i < node.childNodes.length; i++) {
            nodes.push(node.childNodes[i]);
            // if (node.childNodes[i].childNodes.length > 0) {
            me.getNodes(node.childNodes[i], nodes);
            // }
        }
        return nodes;
    },

    /**
     * 所有数据的是否展示时间
     * @param {Ext.data.Store} chatStore
     */
    onShowChatTime(chatStore) {
        var data = chatStore.data.items,
            length = data.length;
        // 从第二个开始进行排查
        for (var i = 1; i < length; i++) {
            if (data[i].data.updateTime == data[i - 1].data.updateTime) {
                chatStore.getAt(i).set('showTime', false);
            }
        }
    },

    setDetails() {

    }

});