Ext.define('IMMobile.view.chatView.IMMobileChatView', {
    extend: 'Ext.Panel',
    xtype: 'IMMobile-chatView',

    requires: [
        'IMMobile.view.widget.Navbar',
        'Ext.dataview.DataView',
        'IMMobile.view.chatView.editor.IMMobileEditor',

        'IMCommon.model.Chat',
        'IMCommon.utils.AddDataUtil',
        'IMCommon.utils.AvatarUtil'
    ],

    layout: 'vbox',

    items: [{
        xtype: 'IMMobile-Navbar',
        items: [{
            xtype: 'component',
            html: '<div class="imMobile-nav-title">测试</div>'
        }, {
            align: 'right',
            iconCls: 'x-fa fa-user'
        }]
    }, {
        xtype: 'dataview',
        itemId: 'IMMobileChatView',
        cls: 'IMMobile-chatView',
        flex: 1,
        store: {
            model: 'IMCommon.model.Chat'
        },
        itemTpl: '<tpl if="values.showTime">' + // 一分钟内时间不重复展示
            '<div style="width:100%;color:#6f6a60;text-align:center;margin-bottom:10px;">{updateTime}</div>' +
        '</tpl>' +
        '<tpl if="values.showGrpChange">' + // 展示多人会话提示信息
            '<div class="grpChangeNote">{GrpChangeMsg}</div>' +
        '<tpl else>' + // 正常的消息
            '<tpl if="values.ROL!==\'right\'">' + // 头像是否展示
                '<div class="evAvatar" style="float:{ROL};">' +
                '<a class="avatar link-avatar firstletter " letter="{[AvatarUtil.getFirstLetter(values.senderName)]} " style="margin:0;float:{ROL};{[AvatarUtil.getColorStyle(values.senderName)]}">' +
                '</a>' +
                '</div>' +
            '</tpl>' +
            '<div style="text-align:{ROL};/*min-height:60px;overflow:hidden;*/">' +
                '<tpl if="values.ROL==\'right\'">' +// 自己的，
                '<div class="bubble">' +
                '<tpl else>' + // 他人的
                '<div class="bubble" style="background-color:navajowhite">' +
                '</tpl>' +
                    '<div class="plain">' +
                    '<tpl if="values.msg_type==\'F\'">' + // file展示
                        '<div class="fileMsg">' +
                            '<div class="fileWrapper">' +
                                '<div class="fileIcon"></div>' +
                                '<div class="fileName">{fileName}</div>' +
                                '<div>{fileSize:fileSize}</div>' +
                            '</div>' +
                            '<div>' + // 分为两块
                                '<tpl if="values.fileStatus == 1">' +
                                    '<div class="fileProgress">' +
                                        '<div style="width:{fileProgress}%;" class="fileLoaded">{fileProgress}%</div>' +
                                    '</div>' +
                                    '<div class="fileClose">取消</div>' +
                                '<tpl elseif="values.fileStatus == 2">' +
                                    // '<p class="fileDone">上传成功</p>' +
                                    '<a class="fileDone">预览</a>' + // 之后支持
                                    '<a class="fileDone" target="_blank" href="{[ParseHelper.appendFilePrefix(values.file_id)]}">下载</a>' +
                                '<tpl elseif="values.fileStatus == 3">' +
                                    '<div class="fileDone">上传失败</div>' +
                                '</tpl>' +
                            '</div>' +
                        '</div>' +
                    '<tpl else>' + // 文本或图片，直接拼好过来
                        '{sendText}' +
                    '</tpl>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</tpl>'
    }, {
        xtype: 'IMMobile-Editor'
    }],


    defaultListenerScope: true,

    initialize() {
        const me = this;
        me.down('#IMMobileChatView').getStore().on({
            add: 'onAdd',
            destroyable: true,
            scope: me
        });
        me.openChat();
    },

    // store调用add方法后调用
    onAdd() {
        const chatView = this.down('#IMMobileChatView'),
            store = chatView.getStore();
        AddDataUtil.onScroll(chatView);// 可视区滚动到最下方
        AddDataUtil.onShowChatTime(store);// 处理时间，一分钟内不显示
    },

    openChat() {
        const me = this;

        if(User.chatMemID) { // 若存在，则表示是从组织结构那边过来的
            const chatID = me.getChatID(User.chatMemID);
            if(chatID) {
                me.getMsgs(chatID);
            } else {
                me.createChat(User.chatMemID);
            }
        } else {
            me.getMsgs(User.crtChannelId);
        }

    },

    getChatID(uid) {
        var chatName = '',
            userIds = '';

        for (var i = 0; i < User.allChannels.length; i++) {
            chatName = User.allChannels[i].chat.chat_name;
            userIds = chatName.split('__'); // 拆分字符串
            if (userIds.length === 2) {
                for (var j = 0; j < 2; j++) {
                    if (userIds[j] === uid) {
                        return User.allChannels[i].chat.chat_id;
                    }
                }
            }
        }
        return '';
    },

    getMsgs(chatID) {
        const me = this;
        Utils.mask(me);
        Utils.ajaxByZY('get', 'chats/' + chatID + '/posts', {
            success: function (data) {
                var view = me.down('#IMMobileChatView');
                AddDataUtil.addAllMsg(view, data);

                Utils.unMask(me);
            }
        });
    },

    createChat(userID) {
        const me = this;
        Utils.ajaxByZY('post', 'chats/direct', {
            params: JSON.stringify([User.ownerID, userID]),
            success: function (data) {
                User.chatMemID = '';

                AddDataUtil.addChatToRecent(data.chat_id);

                me.getMsgs(data.chat_id); // 打开频道
            },
            failure: function (data) {
                console.log(data);
                alert('创建出错');
            }
        });
    }
});