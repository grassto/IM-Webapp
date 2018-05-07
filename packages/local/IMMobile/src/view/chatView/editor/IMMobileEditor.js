Ext.define('IMMobile.view.chatView.editor.IMMobileEditor', {
    extend: 'Ext.Container',
    xtype: 'IMMobile-Editor',

    requires: [
        'IMMobile.view.chatView.editor.RichEditor'
    ],

    uses: [
        'Common.field.comment.EmojiPanel'
    ],

    layout: 'hbox',

    initialize() {
        const me = this,
            btn = me.down('#sendBtn'),
            btnEmoji = me.down('#btnEmoji');
        btn.on({
            tap: 'onSendMsg',
            scope: me
        });

        btnEmoji.on({
            tap: 'onShowEmoji',
            scope: me
        });
    },

    items: [{
        xtype: 'IMMobile-RichEditor',
        itemId: 'MobileEditor',
        errorTarget: null,
        flex: 1
    }, {
        xtype: 'button',
        iconCls: 'x-fa fa-smile-o',
        itemId: 'btnEmoji',
        hidden: true
    }, {
        xtype: 'button',
        itemId: 'sendBtn',
        text: '发送',
        ui: 'action'
    }],

    // 表情、文本发送
    onSendMsg() {
        const me = this,
            editor = me.down('#MobileEditor'),
            chatView = me.up('IMMobile-chatView').down('#IMMobileChatView'),
            chatViewStore = chatView.getStore();

        var text = editor.getSubmitValue();
        text = window.minEmoji(text);

        if (text) {
            var message = {
                base_message: {
                    chat_id: User.crtChannelId,
                    message: text
                }
            };
            
            // 最近会话最后发送时间更新，方便排序
            var recChatStore = Ext.Viewport.lookup('IMMobile').down('#navView').down('IMMobile-Chat').down('#ChatList').getStore();
            recChatStore.getById(User.crtChannelId).set('last_post_at', new Date());

            // 给正在发送的圈圈
            chatViewStore.add({
                senderName: User.crtUser.user_name,
                sendText: text,
                ROL: 'right',
                updateTime: new Date()
            });
            Utils.ajaxByZY('post', 'posts', {
                params: JSON.stringify(message),
                success: function (data) {
                    console.log('发送成功', data);
                    // 去除圈圈
                },
                failure: function (data) {
                    // 处理发送失败
                    alert('发送失败');
                }
            });

            editor.clear();
        }
    },

    // emoji展示
    onShowEmoji(btn) {
        const me = this;
        let panel = Ext.getCmp('global-emojipanel');
        if (!panel) {
            panel = Ext.widget('emojipanel', {
                id: 'global-emojipanel'
            });
        }
        panel.on({
            ok: 'onChooseEmj',
            hide: 'onHideEmjPanel',
            scope: me
        });

        // me.up('IMMobile-chatView').add(panel);

        panel.showBy(btn, 'tl-bl?');
    },

    onChooseEmj(panel, ch) {
        this.down('#MobileEditor').insertObject(`<span class="em emj${window.minEmojiIdx(ch)}"></span>`, ch);
    },

    onHideEmjPanel(panel) {
        panel.un({
            ok: 'onChooseEmj',
            hide: 'onHideEmjPanel',
            scope: this
        });
    }
});