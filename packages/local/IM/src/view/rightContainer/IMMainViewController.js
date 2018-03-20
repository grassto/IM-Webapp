Ext.define('IM.view.rightContainer.IMMainViewController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.im-right-main',

    requires: [
        'MX.util.Utils'
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
        view.element.on({
            tap: 'onViewTap',
            scope: me
        });
    },

    onViewTap() {
        var view = this.getView().up('IM'),
        recentChat = view.down('#recentChat'),
        lastSel = recentChat.getSelectable().getLastSelected();
        var data = '';
        if(lastSel) { // 是否点击过
            data = lastSel.data;
            if(lastSel.length) {
                data = lastSel[0].data;
            }
            if(data.unReadNum > 0) {
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
        User.isPlus = false; // 判断是哪个按钮
        
        this.fireEvent('grpSel');
    },


    /* ********************************recentChat****************************************/

    /**
     * 打开会话，获取历史记录进行绑定
     * @param {string} crtChannelID 当前选中的频道ID
     */
    onOpenChannel(crtChannelID) {
        User.crtChannelId = crtChannelID;
        // // debugger;

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
                User.posts = [];
                for (var i = order.length - 1; i >= 0; i--) {
                    posts[order[i]].username = me.getName(posts[order[i]].user_id);
                    User.posts.push(posts[order[i]]);
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

                me.onScroll(chatView);// 可视区滚动到最下方

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
     *  根据id获取昵称
     * @param {string} uid 用户id
     */
    getName(uid) {
        for (var i = 0; i < User.allUsers.length; i++) {
            if (User.allUsers[i].user_id === uid) {
                return User.allUsers[i].user_name;
            }
        }
        return '';
    },

    /**
     * 聊天展示区，滚动条自动滚动到最下方
     * @param {object} chatView 容器
     */
    onScroll(chatView) {
        var sc = chatView.getScrollable(),
            scHeight = sc.getScrollElement().dom.scrollHeight;
        sc.scrollTo(0, scHeight + 1000);
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

    // 替换字符串中的回车
    textToHtml(text) {
        return text.replace(/\n/g, '<br/>').replace(/\r/g, '<br/>').replace(/\r\n/g, '<br/>');
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

    /**
     * 根据id来判断是否有频道存在
     * @param {sting} uid 选中的用户ID
     */
    getChannelId(uid) {
        var me = this;
        if (User.allChannels) {
            for (var i = 0; i < User.allChannels.length; i++) {
                if (User.allChannels[i].name.indexOf(uid) > -1) {
                    return User.allChannels[i].id;
                }
            }
        }
        return '';
    },



    /* ********************************消息发送****************************************/

    onSend() {
        var me = this,
            fileIds = [];
        for (var i = 0; i < User.files.length; i++) {
            fileIds.push(User.files[i].file_id);
        }

        var textAreaField = me.getView().down('richEditor'),
            sendPicHtml = textAreaField.getSubmitValue(), // 图片表情解析
            sendHtml = ParseHelper.onParseMsg(sendPicHtml), // img标签解析
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

            // // debugger;
            Utils.ajaxByZY('post', 'posts', {
                params: JSON.stringify(message),
                success: function (data) {
                    // 将选中的人移至最上方
                    me.fireEvent('listToTop', data.user_id);
                    console.log('发送成功', data);
                    User.files = [];
                }
            });

            textAreaField.clear(); // 清空编辑框

            // // 将选中的人移至最上方
            // var viewModel = me.getView().up('IM').getViewModel(),
            //     name = viewModel.get('sendToName');
        } else {// 可以在此给提示信息
            // btn.setTooltip('不能输入空内容');
        }
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


});