Ext.define('IMMobile.view.chatView.editor.IMMobileEditor', {
    extend: 'Ext.Container',
    xtype: 'IMMobile-Editor',

    requires: [
        'IMMobile.view.chatView.editor.RichEditor'
    ],

    layout: 'hbox',

    initialize() {
        const me = this,
            btn = me.down('#sendBtn');
        btn.on({
            tap: 'onSendMsg',
            scope: me
        });
    },

    items: [{
        xtype: 'IMMobile-RichEditor',
        itemId: 'MobileEditor',
        flex: 1
    }, {
        xtype: 'button',
        itemId: 'sendBtn',
        text: '发送'
    }],

    // 纯文本发送
    onSendMsg() {
        const me = this,
            editor = me.down('#MobileEditor'),
            chatView = me.up('IMMobile-chatView').down('#IMMobileChatView'),
            chatViewStore = chatView.getStore();

        var text = editor.getSubmitValue();

        if (text) {
            var message = {
                base_message: {
                    chat_id: User.crtChannelId,
                    message: text
                }
            };

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
    }
});