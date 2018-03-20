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
        var me = this,
            store = leftMembers.getStore(),
            status;
        for (let i = 0; i < User.allChannels.length; i++) {
            if (User.allChannels[i].chat.chat_type == 'D') {
                status = StatusHelper.getStatus(StatusHelper.getUserIDByChatName(User.allChannels[i].chat.chat_name));
            } else {
                status = '不显示';
            }

            var isUnRead = false,
            unReadNum = 0;
            for (var j = 0; j < User.allChannels[i].members.length; j++) {
                // debugger;
                if (User.allChannels[i].members[j].user_id == User.ownerID) { // 自己的未读
                    unReadNum += User.allChannels[i].members[j].unread_count;
                    break;
                }
            }
            if(unReadNum > 0) {
                isUnRead = true;
            }

            store.add({
                id: User.allChannels[i].chat.chat_id,
                name: User.allChannels[i].chat.channelname,
                type: User.allChannels[i].chat.chat_type,
                status: status,
                chat_name: User.allChannels[i].chat.chat_name,
                isUnRead: isUnRead,
                unReadNum: unReadNum
            });
        }
    },

    


    // 加载组织结构树信息(之后还需处理)
    loadOrganization(orgTree, defaultSelMems) {
        var me = this,
            treeStore = orgTree.getStore(),
            target = orgTree.getSelections()[0] || treeStore.getRoot(),
            nodes = [],
            orgs = User.organization.concat(), // 数组的深拷贝，不会修改原数组的值
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

        // 判断是否默认选中, 不用
        var isdefUsr = false;


        // 将user添加到树上
        for (var j = 0; j < nodes.length; j++) {
            for (var k = 0; k < users.length; k++) {
                // org_ids要注意
                if (users[k].org_ids == nodes[j].data.id) {

                    if (defaultSelMems) { // 多人会话框组织数据
                        isdefUsr = me.getIsDef(users[k].user_id, defaultSelMems);
                    }

                    nodes[j].appendChild({
                        id: users[k].user_id,
                        name: users[k].user_name,
                        def_role_name: users[k].def_role_name,
                        leaf: true,
                        isSel: isdefUsr
                    });
                }
            }
        }
    },

    /**
     * 发起多人会话时默认选中的用户
     * @param {string} uid 比较的人的id
     * @param {Array} defaultSelMems 默认选中的人
     */
    getIsDef(uid, defaultSelMems) {
        var flag = false;
        for (var i = 0; i < defaultSelMems.length; i++) {
            if (defaultSelMems[i] == uid) {
                flag = true;
                break;
            }
        }
        return flag;
    },

    // 创建子节点
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

    // 获取所有的子节点
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
     * 添加数据至最近会话
     * @param {json} data 数据
     * @param {string} uid 根据userid是否存在来判断是否展示status
     * @param {json} data 数据
     */
    addChannelToRecent(data, uid, nickname) {
        const recentChatView = Ext.Viewport.down('IM').down('#recentChat'),
            chatStore = recentChatView.getStore();

        var status = ''; // 为空则不展示，多人会话时
        // 区分单人和多人
        if (uid) {
            status = StatusHelper.getStatus(uid);
        }

        var record = chatStore.add({
            id: data.chat_id,
            name: nickname,
            type: data.chat_type,
            last_post_at: new Date(data.update_at),
            status: status
        });

        recentChatView.setSelection(record);
        chatStore.sort();
    },

    /**
     * 递归添加leaf节点id
     * @param {*} record 组织结构树节点信息
     * @param {*} memsID 需要添加的id
     */
    getLeafIDFromTree(record, memsID) {
        const me = this;

        if (!record.data.leaf) {// 不是叶子节点leaf
            for (var i = 0; i < record.childNodes.length; i++) {
                me.getLeafIDFromTree(record.childNodes[i], memsID);
            }
        } else {
            memsID.push(record.data.id);
        }

        return memsID;
    },


    onAddMemToGroup(listData) {
        var memsID = [];
        for (var i = 0; i < listData.length; i++) {
            memsID.push(listData[i].data.id);
        }
        // for (var i = 0; i < User.crtChatMembers.length; i++) {
        //     memsID.push(User.crtChatMembers[i]);
        // }

        this.addMemToGroup(memsID);
    },

    addMemToGroup(memsID) {
        // 若是从担任会话发起的多人会话，则新建多人会话
        if (User.crtChatMembers.length == 2) {
            memsID.push(User.crtChatMembers[0]);
            memsID.push(User.crtChatMembers[1]);

        } else {
            Utils.ajaxByZY('post', 'chats/' + User.crtChannelId + '/members', {
                params: JSON.stringify(memsID),
                success: function (data) {
                    var IMView = Ext.Viewport.down('IM'),
                        recentChat = IMView.down('#recentChat'),
                        chatStore = recentChat.getStore(),
                        record;
                    if (User.crtChatMembers.length == 2) {// 从单人会话过来的，则增加一个新频道，在页面进行展示
                        record = chatStore.insert(0, {
                            id: data.chat_id,
                            name: data.chat_name,
                            type: data.chat_type
                        });
                        recentChat.setSelection(record); // 设置选中
                        User.crtChannelId = data.chat_id; // 当前选中的频道
                        if (data.chat_name.length > 8) {
                            data.chat_name = data.chat_name.substr(0, 8) + '...';
                        }
                        IMView.getViewModel().set({
                            'sendToName': data.chat_name,
                            'isOrgDetail': false
                        });
                        if (IMView.lookup('im-main')) {
                            IMView.lookup('im-main').down('#chatView').getStore().removeAll();
                        }


                        User.allChannels.push({
                            chat: {
                                channelname: data.chat_name,
                                chat_id: data.chat_id,
                                chat_name: data.chat_name,
                                chat_type: data.chat_type
                            },
                            members: {
                                chat_id: data.chat_id,
                                user_id: User.ownerID
                            }
                        });

                    } else if (User.crtChatMembers.length > 2) {
                        // 修改store的数据
                    }
                }
            });
        }
    },


    addChatToList(listView, data) {

        User.allChannels.push({
            chat: {
                channelname: data.chat_name,
                chat_id: data.chat_id,
                chat_name: data.chat_name,
                chat_type: data.chat_type
            },
            members: {
                chat_id: data.chat_id,
                user_id: User.ownerID
            }
        });
        // User.allChannels.push({ id: cid, name: cName });
        var channelStore = listView.getStore(),
            chatName;
        if (data.chat_name.length > 8) {
            chatName = data.chat_name.substr(0, 8) + '...';
        }
        channelStore.insert(0, {
            id: data.chat_id,
            name: chatName,
            isUnRead: false,
            unReadNum: 0,
            last_post_at: new Date(data.update_at)
        });
    },


    /**
     * 根据chat_id查询出频道中的人员
     * @param {string} chatID 频道ID
     */
    getMemsByChatId(chatID) {
        var length = User.allChannels.length;
        for (var i = 0; i < length; i++) {
            if (User.allChannels[i].chat.chat_id === chatID) {
                return User.allChannels[i].members;
            }
        }
        return '';
    },


    /**
     * 进行历史消息的绑定
     * @param {json} data 获取历史消息api传来的数据（chats/direct）
     * @param {*} chatStore 需要绑定数据的store
     */
    bindMsg(data, chatStore) {
        if (data) {
            var order = data.order,
                posts = data.messages,
                message,
                fileIDs = [],
                ROL = '';
            User.posts = [];
            for (var i = order.length - 1; i >= 0; i--) {
                posts[order[i]].username = ChatHelper.getName(posts[order[i]].user_id);
                User.posts.push(posts[order[i]]);
                message = posts[order[i]].message;

                if (posts[order[i]].msg_type == 'I') {
                    fileIDs = [];
                    message = '[' + posts[order[i]].attach_id + ']';
                    fileIDs.push(posts[order[i]].attach_id);
                }

                message = window.minEmoji(message); // emoji解析
                message = ParseHelper.parsePic(message, fileIDs); // 图片解析
                message = ParseHelper.parseURL(message); // URL解析

                if (posts[order[i]].user_id == User.ownerID) {
                    ROL = 'right';
                } else {
                    ROL = '';
                }
                chatStore.add({
                    msg_id: posts[order[i]].msg_id,
                    senderName: posts[order[i]].username,
                    sendText: message,
                    ROL: ROL,
                    updateTime: new Date(posts[order[i]].update_at)
                });

                if(posts[order[i]].msg_type == 'I') {
                    
                    var url = Config.httpUrlForGo + 'files/' + posts[order[i]].attach_id + '/thumbnail';
                        // 图片若未加载完成，则显示loading,加载出现异常，显示默认图片
                        window.imagess(url, posts[order[i]].attach_id);
                }
            }
        }
    },


    setRightTitle(name) {
        // 长度超过8时，截取
        if (name.length > 8) {
            name = name.substr(0, 8) + '...';
        }
        Ext.Viewport.lookup('IM').getViewModel().set({
            'sendToName': name
        });
    }

});