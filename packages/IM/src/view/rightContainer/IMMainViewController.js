Ext.define('IM.view.rightContainer.IMMainViewController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.im-right-main',

    requires: [
        'MX.util.Utils',
        'IMCommon.utils.ChatUtil'
    ],

    listen: {
        controller: {
            'recentChat': {
                openCnl: 'onOpenChannel'
            },
            'left-orgController': {
                openChat: 'onOpenChat'
            }
        }
    },

    init() {
        var me = this,
            view = me.getView();
        // 页面的点击事件，是否取消未读，调用view的api
        view.element.on({
            tap: 'onViewTap',
            scope: me
        });

        // 多人会话人员列表右击事件
        view.down('#groupList').element.on({
            delegate: '.x-listitem',
            contextmenu: 'onGrpListRightClick',
            scope: me
        });
    },

    // 人员列表的右击事件
    onGrpListRightClick(e, el) {
        const me = this;
        var recordIndex = el.getAttribute('data-recordindex'),
            store = me.getView().down('#groupList').getStore(),
            record = store.getAt(recordIndex),
            chatID = record.get('chat_id'),
            userID = record.get('user_id');

        var text = me.getRemoveText(userID);

        // 是否需要展示更换管理员
        var manager = PreferenceHelper.getManagerFromCache(chatID),
            isHideChgMgr = true;
        if (manager == User.ownerID) {
            isHideChgMgr = false;
        }

        var menu = Ext.create('Ext.menu.Menu', {
            items: [{
                text: text,
                handler: function () {
                    var grpWarnMsg = PreferenceHelper.preGrpChat(); // 在多人会话中进行操作，提前需要的判断
                    if (grpWarnMsg == '') {
                        PreferenceHelper.hideChatMember(chatID, userID, store);
                    } else {
                        PreferenceHelper.warnGrpMem(grpWarnMsg);
                    }
                }
            }, {
                text: '更换管理员',
                hidden: isHideChgMgr,
                handler: function () {
                    var grpWarnMsg = PreferenceHelper.preGrpChat(); // 在多人会话中进行操作，提前需要的判断
                    if (grpWarnMsg == '') { // 可以执行操作
                        PreferenceHelper.chgManager(chatID, userID);
                    } else {
                        PreferenceHelper.warnGrpMem(grpWarnMsg);
                    }
                }
            }]
        });

        me.imitateShowAt(menu, e.getPoint());

        e.preventDefault();
    },

    // 判断是不是自己退出群聊，返回菜单的text
    getRemoveText(userID) {
        if (User.ownerID == userID) {
            return '退出群聊';
        }
        return '移出群聊';
    },

    // 参照showAt源码，更改x方向的位置
    imitateShowAt(menu, x, y) {
        if (menu.getFloated() || menu.isPositioned()) {
            if (arguments.length === 2) {
                if (x.x) {
                    y = x.y;
                    x = x.x - 70; // 减去的在这里写死了，不太好
                } else {
                    y = x[1];
                    x = x[0] - 70;
                }
            }
            menu.show();
            if (menu.isPositioned()) {
                menu.setLeft(x);
                menu.setTop(y);
            } else {
                menu.setX(x);
                menu.setY(y);
            }
        }
        return menu;

    },

    // 调用view的API
    onViewTap() {
        var view = this.getView().up('IM'),
            recentChat = view.down('#recentChat'),
            lastSel = recentChat.getSelectable().getLastSelected();
        var data = '';
        if (lastSel) { // 是否点击过
            data = lastSel.data;
            if (lastSel.length) {
                data = lastSel[0].data;
            }
            if (data.unReadNum > 0) {
                var record = recentChat.getStore().getById(data.id);
                ChatHelper.setUnReadToRead(record);
            }
        }
    },

    /* *********************************** rightTitle *************************************/
    /**
     * 右侧页面的发起群聊图标，选中后会在发起群聊的框中展示出已经选中的人
     */
    onShowGrpSel() {
        var grpWarnMsg = PreferenceHelper.preGrpChat();
        if (grpWarnMsg == '') {
            User.isPlus = false; // 判断是哪个按钮

            this.fireEvent('grpSel');
        } else {
            PreferenceHelper.warnGrpMem(grpWarnMsg);
        }
    },


    /* ********************************recentChat****************************************/

    /**
     * 打开会话，获取历史记录进行绑定
     * @param {string} crtChannelID 当前选中的频道ID
     */
    onOpenChannel(crtChannelID) {
        User.crtChannelId = crtChannelID;

        var me = this,
            chatView = me.getView().down('#chatView'),
            message;
        var chatStore = chatView.store;

        me.setUnReadToRead(crtChannelID);

        chatStore.removeAll();
        Utils.ajaxByZY('get', 'chats/' + crtChannelID + '/posts', {
            success: function (data) {
                var order = data.order,
                    posts = data.messages;
                for (var i = order.length - 1; i >= 0; i--) {
                    posts[order[i]].username = ChatHelper.getName(posts[order[i]].user_id);

                    message = posts[order[i]].message;

                    message = window.minEmoji(message); // emoji解析
                    // message = me.antiParse(message, posts[order[i]].files); // 图片解析
                    message = ParseHelper.parsePic(message, posts[order[i]].files); // 图片解析
                    message = ParseHelper.parseURL(message);

                    if (posts[order[i]].user_id == User.ownerID) {
                        chatStore.add({ msg_id: posts[order[i]].msg_id, ROL: 'right', senderName: posts[order[i]].username, sendText: message, updateTime: new Date(posts[order[i]].update_at) });
                    }
                    else {
                        chatStore.add({ msg_id: posts[order[i]].msg_id, senderName: posts[order[i]].username, sendText: message, updateTime: new Date(posts[order[i]].update_at) });
                    }
                }

                ChatHelper.onScroll(chatView);// 可视区滚动到最下方

                me.onShowChatTime(chatStore);// 处理时间，一分钟内不显示
            }
        });
    },
    /**
     * 消息反解析，利用正则字符串将图片的展示做好
     * @param {string} text 文本信息
     * @param {Array} fileIds 图片id
     */
    antiParse(text, fileIds) {
        var reg = /\[\w+\]/g;
        var result = text.replace(reg, function (str) {
            var out = '',
                id = str.substring(1, str.length - 1);
            if (fileIds) {
                for (var i = 0; i < fileIds.length; i++) {
                    if (fileIds[i] == id) {
                        out = '<img class="viewPic" src="' + Config.httpUrlForGo + 'files/' + id + '">';  // "'/thumbnail">';
                        break;
                    } else {
                        out = str;
                    }
                }
            }
            return out;
        });
        return result;
    },

    /**
     * 将未读消息设为已读
     * @param {string} crtChannelID 当前选中的chat_id
     */
    setUnReadToRead(crtChannelID) {
        var memStore = this.getView().up('IM').down('#recentChat').getStore();
        memStore.getById(crtChannelID).set('isUnRead', false);
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





    /* ********************************left-orgController****************************************/

    /**
     * 若选中的人无频道，则添加频道，若有，则直接获取历史消息
     */
    onOpenChat() {
        var record = this.getViewModel().get('orgSelRecord');
        if (record.data.leaf) {
            var me = this,
                uid = record.data.id;
            User.crtSelUserId = uid;

            me.openChat(uid, record.data.name);
        }
    },
    openChat(uid, nickname) {
        var me = this,
            channelId = me.getChatID(uid);
        var channelView = me.getView().up('IM').down('#recentChat'),
            channelStore = channelView.getStore();
        if (channelId !== '') {
            // 获取历史消息
            console.log('存在,获取历史消息');
            channelView.setSelection(channelStore.getById(channelId));
            me.onOpenChannel(channelId);

        } else {
            console.log('不存在，创建会话');
            // 创建会话
            Utils.ajaxByZY('post', 'chats/direct', {
                params: JSON.stringify([User.ownerID, uid]),
                success: function (data) {
                    User.allChannels.push({
                        chat: data,
                        members: {
                            chat_id: data.chat_id,
                            last_view_at: 0,
                            user_id: User.ownerID
                        }
                    });

                    var newRecord = channelStore.add({
                        id: data.chat_id,
                        name: nickname,
                        type: data.chat_type,
                        last_view_at: new Date(data.update_at)
                    });
                    channelView.setSelection(newRecord);
                    channelStore.sort();
                    me.onOpenChannel(data.chat_id);
                },
                failure: function (data) {
                    console.log(data);
                    alert('创建出错');
                }
            });
        }
    },

    // 根据内存缓存的User.allChannels来判断是否存在会话
    getChatID(cid) {
        for (var i = 0; i < User.allChannels.length; i++) {
            if (User.allChannels[i].chat.chat_name.indexOf(cid) > -1) {
                return User.allChannels[i].chat.chat_id;
            }
        }
        return '';
    },


    /* ********************************消息发送****************************************/
    /**
     * 增加参数，适配上传按钮上传文件
     * @param {string} files 文件id
     */
    onSend(files) {
        // 判断是否是被移除了的会话
        var grpWarnMsg = PreferenceHelper.preGrpChat();
        if (grpWarnMsg != '') {
            PreferenceHelper.warnGrpMem(grpWarnMsg);
        } else {
            const me = this,
                textAreaField = me.getView().down('richEditor'); // 编辑输入框

            var sendText = '', // 发送的文本
                fileIds = []; // 附件id

            if (files) {
                if (files.length == 26) {
                    fileIds.push(files);
                    sendText = '[' + files + ']';
                }
            } else { // 原先的处理方式，只考虑图片的
                for (var i = 0; i < User.files.length; i++) {
                    fileIds.push(User.files[i].file_id);
                }
            }
            var sendPicHtml = textAreaField.getSubmitValue(), // 图片表情解析
                sendHtml = ParseHelper.onParseMsg(sendPicHtml); // img标签解析
            sendText = ParseHelper.htmlToText(sendHtml);// 内容

            // 判断是否有内容或文件
            if (fileIds.length > 0 || sendText) {
                let message = {
                    base_message: {
                        chat_id: User.crtChannelId,
                        // create_at: 0,
                        message: sendText
                        // update_at: new Date().getTime()
                    },
                    files: fileIds
                };

                ChatUtil.onSend(JSON.stringify(message), me.onSendSuccess);

                // Utils.ajaxByZY('post', 'posts', {
                //     params: JSON.stringify(message),
                //     success: function (data) {
                //         // 将选中的人移至最上方
                //         // me.fireEvent('listToTop', data.user_id);
                //         console.log('发送成功', data);
                //         User.files = [];
                //     }
                // });

                textAreaField.clear(); // 清空编辑框

                // // 将选中的人移至最上方
                // var viewModel = me.getView().up('IM').getViewModel(),
                //     name = viewModel.get('sendToName');
            } else {// 可以在此给提示信息
                // btn.setTooltip('不能输入空内容');
                Utils.toastShort('发送内容不能为空');
            }
        }


    },

    onSendSuccess(data) {
        console.log('发送成功', data);
        User.files = [];
    },

    // 消息解析
    onParseMsg(sendPicHtml) {
        var reg = /\<img[^\>]*src="([^"]*)"[^\>]*\>/g;
        // var imgs = sendPicHtml.match(reg);
        // for(var i=0;i<imgs.length;i++) {
        //     $(imgs[i]).attr('id');
        // }
        var result = sendPicHtml.replace(reg, function (str) {
            var out = '',
                id = $(str).attr('id');
            return '[' + id + ']';
        });
        return result;
    },


    changeChatHeader() {
        Ext.Msg.prompt('修改标题', '请输入新标题', function (ok, title) {
            if (ok == 'ok') {
                Utils.ajaxByZY('PUT', 'chats/' + User.crtChannelId, {
                    params: JSON.stringify({
                        chat_id: User.crtChannelId,
                        header: title
                    }),
                    success: function (data) {
                        // 页面数据
                        BindHelper.setRightTitle(title);
                        var store = Ext.Viewport.lookup('IM').down('#recentChat').getStore(),
                            record = store.getById(User.crtChannelId);
                        record.set({ name: title });

                        // 缓存数据
                        ChatHelper.handleHeaderCache(User.crtChannelId, title);
                    }
                });

            }
        });
    },

    // 修改群名
    onTextBlur(field) {

        var text = field.getValue();
        if (text == '' || text == User.rightTitle) { // 置为空或者和原来相同的不更改
            // 将field的值设为原来的
            field.setValue(User.rightTitle);
        } else {
            // 更新多人会话之前的操作
            var grpWarnMsg = PreferenceHelper.preGrpChat();
            if (grpWarnMsg == '') {
                // 请求服务端，更改数据库的值
                console.log('请求服务端，更改数据库的值');

                // 终止上一次的ajax请求
                if (field._xhr) {
                    Ext.Ajax.abort(field._xhr);
                }
                field._xhr = Utils.ajaxByZY('put', 'chats/' + User.crtChannelId, {
                    params: JSON.stringify({
                        chat_id: User.crtChannelId,
                        header: text
                    }),
                    success: function (data) {
                        if (data) {
                            var record = Ext.Viewport.lookup('IM').down('#recentChat').getStore().getById(User.crtChannelId);
                            if (record) {
                                record.set('name', text); // 更新页面上的值

                                User.rightTitle = text; // 更新缓存
                            }
                        } else {
                            Utils.toastShort('请求更新失败');
                            field.setValue(User.rightTitle);
                        }
                    },
                    failure: function () {
                        Utils.toastShort('请求更新失败');
                        field.setValue(User.rightTitle);
                    }
                });
            } else {
                // 将field的值设为原来的
                field.setValue(User.rightTitle);
                PreferenceHelper.warnGrpMem(grpWarnMsg);
            }
        }

    },


    /* ************************************* cef ******************************************/
    cefClose() {
        if (window.cefMain) {
            window.cefMain.close();
        }
    },

    cefMax() {
        if (window.cefMain) {
            window.cefMain.max();
        }
    },

    cefMin() {
        if (window.cefMain) {
            window.cefMain.min();
        }
    }

});