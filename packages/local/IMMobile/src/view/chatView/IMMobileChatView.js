Ext.define('IMMobile.view.chatView.IMMobileChatView', {
    extend: 'Ext.Panel',
    xtype: 'IMMobile-chatView',

    requires: [
        'IMMobile.view.base.Container',
        'IMMobile.view.widget.Navbar',
        'Ext.dataview.DataView',
        'IMMobile.view.chatView.editor.IMMobileEditor',

        'IMCommon.view.MsgView',
        'IMCommon.model.Msg',
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
        xtype: 'msgView',
        itemId: 'IMMobileChatView',
        flex: 1
        // 动态设置store
        // store: {
        //     model: 'IMCommon.model.Chat'
        // },
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
                        model: 'IMCommon.model.Msg'
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