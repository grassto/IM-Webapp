Ext.define('IMMobile.view.chatView.IMMobileChatView', {
    extend: 'Ext.Panel',
    xtype: 'IMMobile-chatView',

    requires: [
        'IMMobile.view.base.Container',
        'IMMobile.view.widget.Navbar',
        'Ext.dataview.DataView',
        'IMMobile.view.chatView.editor.IMMobileEditor',

        'IMCommon.model.Chat',
        'IMCommon.utils.AddDataUtil',
        'IMCommon.utils.AvatarUtil'
    ],

    uses: [
        'MX.util.ImgUtil'
    ],

    cls: 'IMMobile-ChatViewWrp',

    layout: 'vbox',
    viewModel: {
        data: {
            title: '测试'
        }
    },

    items: [{
        xtype: 'IMMobile-Navbar',
        itemId: 'chatViewNav',
        items: [{
            xtype: 'component',
            // align: 'left',
            flex: 1,
            bind: {
                html: '<div class="imMobile-nav-title">{title}</div>'
            }
        }, {
            iconCls: 'x-fa fa-user',
            align: 'right'
        }]
    }, {
        xtype: 'dataview',
        itemId: 'IMMobileChatView',
        cls: 'IMMobile-chatView',
        infinite: true,
        variableHeights: true,
        flex: 1,
        // 动态设置store
        // store: {
        //     model: 'IMCommon.model.Chat'
        // },
        itemTpl: '<tpl if="values.showTime">' + // 一分钟内时间不重复展示
            '<div style="width:100%;color:#6f6a60;text-align:center;margin-bottom:10px;">{updateTime}</div>' +
        '</tpl>' +
        '<tpl if="values.showGrpChange">' + // 展示多人会话提示信息
            '<div class="grpChangeNote">{GrpChangeMsg}</div>' +
        '<tpl else>' + // 正常的消息
            '<tpl if="values.ROL!==\'right\'">' + // 头像是否展示
                '<div class="evAvatar" style="float:{ROL};">' +
                '<a class="avatar link-avatar firstletter " letter="{[AvatarUtil.getFirstLetter(values.senderName)]} " style="margin:0 0 0 10px;float:{ROL};{[AvatarUtil.getColorStyle(values.senderName)]}">' +
                '</a>' +
                '</div>' +
            '</tpl>' +
            '<div style="text-align:{ROL};/*min-height:60px;overflow:hidden;*/">' +
                '<tpl if="values.ROL==\'right\'">' +// 自己的，
                '<div class="bubble">' +
                '<tpl else>' + // 他人的
                '<div class="bubble" style="background-color:navajowhite">' +
                '</tpl>' +
                    '<tpl if="values.msg_type == \'F\'">' + // file展示
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
                    '<tpl elseif="values.msg_type == \'I\'">' + // 图片，直接拼好过来
                        '{sendText}' +
                    '<tpl else>' + // 文本展示
                        '<div class="plain">' +
                            '{sendText}' +
                        '</div>' +
                    '</tpl>' +
                '</div>' +
            '</div>' +
        '</tpl>'
    }, {
        xtype: 'IMMobile-Editor'
    }],


    defaultListenerScope: true,

    initialize() {
        const me = this;

        me.down('#IMMobileChatView').on({
            childlongpress: 'onLongPress',
            childTap: 'onChildTap',
            scope: me
        });

        // me.down('#IMMobileChatView').getStore().on({
        //     add: 'onAdd',
        //     destroyable: true,
        //     scope: me
        // });


        // 初始化页面相关信息
        me.openChat();
    },

    onChildTap(view, location) {
        const record = location.record;
        if (!record) return;

        const e = location.event,
            t = Ext.fly(e.target);
        if (t.hasCls('viewPic')) {
            var thumbSrc = t.dom.src;
            // 请求原图浏览
            ImgUtil.viewImgs(thumbSrc.substring(0, thumbSrc.indexOf('thumbnail') - 1));
        }
    },

    // 长按事件
    onLongPress(view, location) {
        alert(234);
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
            // const chatID = me.getChatID(User.chatMemID);
            // if(chatID) {
            //     me.getMsgs(chatID);
            // } else {
            //     me.createChat(User.chatMemID);
            // }
            me.createDirectChat(User.chatMemID);
        } else { // 直接点击最近会话进来的
            me.getMsgs(User.crtChannelId);
        }

        me.setTitle();

    },

    // 设置标题头
    setTitle() {
        this.getViewModel().set({
            title: User.crtChatName
        });

        // this.down('#chatViewNav').setTitleMsg(User.crtChatName);
    },

    // 根据userid来判断是否存在chat
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

                User.chatMemID = ''; // 应该放在这
            }, callback: function() {
                Utils.unMask(me);
            }
        });
    },

    createDirectChat(userID) {
        const me = this;
        Utils.ajaxByZY('post', 'chats/direct', {
            params: JSON.stringify([User.ownerID, userID]),
            success: function (data) {
                // User.chatMemID = '';
                // 最近会话store
                var store = Ext.Viewport.lookup('IMMobile').down('#navView').down('IMMobile-MainTabPanel').down('#IMMobile_Chat').getStore(),
                record = store.getById(data.chat_id);

                if(!record) { // 创建的新会话
                    if(Config.isPhone) {
                        data.display_name = User.crtChatName;
                        data.unread_count = 0;
                        data.last_sender_id = User.ownerID;
                        data.last_sender_name = User.crtUser.user_name;
                        data.last_message = '';
                        LocalDataMgr.createDitChat(data);
                    }

                    // 最近会话加入新的会话
                    store.insert(0, {
                        chat_id: data.chat_id,
                        name: User.crtChatName,
                        type: data.chat_type,
                        last_post_at: data.update_at,
                        status: -2, // 不显示状态
                        chat_name: data.chat_name,
                        members: data.members
                    });

                    // 创建新的store，更换view的store
                    var newStore = Ext.factory({
                        storeId: data.chat_id,
                        model: 'IMCommon.model.Chat'
                    }, Ext.data.Store);
                    
                    me.setStore(newStore);
                } else { // 直接打开会话
                    me.getMsgs(data.chat_id); // 打开频道
                }

                
            },
            failure: function (data) {
                console.log(data);
                alert('创建出错');
            }
        });
    }
});