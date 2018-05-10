/**
 * 处理连接，数据绑定等相关信息,
 * User.xxx
 * 绑定完成后，缓存中的数据crtUser,allUsers,organization,allOthers,allChannels,allStatus
 */
Ext.define('IM.utils.ConnectHelper', {
    alternateClassName: 'ConnectHelper',
    singleton: true,

    /**
     * 获取当前用户信息并进行数据绑定
     * @param {*} viewmodel 需要绑定数据的viewModel
     */
    getMe(viewmodel) {
        Utils.ajaxByZY('GET', 'users/me', {
            success: function (data) {
                console.log('个人信息：', data);
                // User.crtUser = data; // 个人信息在连接成功后即返回
                viewmodel.set({
                    'ownerName': data.user_name,
                    'avatar': AvatarMgr.getAvatarHtmlByName(data.user_name)
                });
            }
        });
    },

    /**
     * 获取所有用户信息
     * @param {*} view
     */
    getMembers(view) {
        const me = this,
            orgTree = view.down('#left-organization');
        Utils.mask(orgTree);
        Utils.ajaxByZY('GET', 'users/all', {
            async: false,
            success: function (data) {
                var org = data.organizations, // 组织结构信息
                    usersInfo = data.users; // 所有成员信息

                // 存入缓存
                User.allUsers = usersInfo;
                User.organization = org;

                if(Config.isPC) {
                    LocalDataMgr.initUpdateOrg(usersInfo, org);
                }

                var ids = []; // 获取状态时使用
                for (let i = 0; i < usersInfo.length; i++) {
                    if (usersInfo[i].user_id !== User.ownerID) {
                        User.allOthers.push(usersInfo[i]); // 记录所有其他成员信息，用来匹配频道的展示名

                    }
                    ids.push(usersInfo[i].user_id);
                }

                BindHelper.loadOrganization(orgTree);
                orgTree.expandAll(); // tree展开节点

                Utils.unMask(orgTree);// 不知道放这有没有用

                // 定时获取状态 60s， 最近会话列表的问题，对应的是chat，没有人的信息
                me.getStatus(ids);
                setInterval(() => {
                    me.getStatus(ids);
                }, 60 * 1000);


                // me.getChannels(view);
                // me.getUnreadChats(view);
            }, callback() {
                // Utils.unMask(orgTree);
            }
        });

    },

    // 从服务器端获取未读chats进行数据绑定
    getUnreadChats(view) {
        var me = this,
            recView = view.down('#recentChat');

        // Utils.mask(recView);
        Utils.ajaxByZY('GET', 'users/me/chats/unread', {
            success: function (data) {
                if (data) {
                    console.log('未读会话：', data);

                    CEFHelper.initNotice(data); // cef提示有未读

                    me.pushChatToCache(data);

                    if (Config.isPC) {
                        // 同步本地数据库，
                        LocalDataMgr.initUpdateChats(data);
                    }

                    // 将data的数据绑定至页面
                    BindHelper.bindUnreadChats(data);
                }

                // Utils.unMask(recView);
            }
        });
    },

    /**
     * 获取所有的chat，包括chat和chatMembers
     * @param {*} view
     */
    getChannels(view) {
        var me = this,
            recView = view.down('#recentChat');

        Utils.mask(recView);
        Utils.ajaxByZY('get', 'users/me/chats', {
            success: function (data) {
                console.log('所有频道：', data);

                // web版的提示
                // me.initNotify(data);

                CEFHelper.initNotice(data);

                me.pushChatToCache(data);

                // 同步本地数据库，
                LocalDataMgr.initUpdateChats(data);
                // 展示最新的数据
                BindHelper.loadRecentChat(recView);

                Utils.unMask(recView);
            }, callback() {
                // Utils.unMask(recView);
            }
        });
    },
    /**
     * 将chat的数据存入缓存
     * @param {json} data 需存入的数据
     */
    pushChatToCache(data) {
        for (let i = 0; i < data.length; i++) {
            if (data[i].chat.chat_type == 'D') { // 单人会话
                // chat_name为C1034__C1064这种，将其拼凑为姓名
                data[i].chat.channelname = data[i].chat.last_sender_name;

                User.allChannels.push(data[i]);
                // for (let j = 0; j < User.allOthers.length; j++) {
                //     if (data[i].chat.chat_name.indexOf(User.allOthers[j].user_id) > -1) {
                //         data[i].chat.channelname = User.allOthers[j].user_name;
                //         data[i].chat.header = User.allOthers[j].user_name;
                //         User.allChannels.push(data[i]);
                //         break;
                //     }
                // }
            }
            else {
                data[i].chat.channelname = data[i].chat.header;
                User.allChannels.push(data[i]);
            }
        }
    },

    // 解析直接频道的chatName
    parseDirectChatName(dataWrap, userID) {
        var chatName = '';
        if (dataWrap.members[0].user_id !== userID) {
            chatName = dataWrap.members[0].user_name;
        } else {
            chatName = dataWrap.members[1].user_name;
        }

        return chatName;
    },

    /**
     * 状态信息
     * @param {*Array} uArray 所有用户的id
     */
    getStatus(uArray) {
        Utils.ajaxByZY('POST', 'status/ids', {
            async: false,
            params: JSON.stringify(uArray),
            success: function (data) {
                // console.log('所有人员状态：', data);
                User.allStatus = data;
            }
        });
        // 处理最近会话列表数据
        StatusHelper.handleRecentList();
    },


    initNotify(data) {

    }
});