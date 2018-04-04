Ext.define('IM.utils.CEFHelper', {
    alternateClassName: 'CEFHelper',
    singleton: true,

    addNotice(data, header) {
        if (window.cefMain) {
            const store = Ext.Viewport.lookup('IM').down('#recentChat').getStore(),
                record = store.getById(data.chat_id);

            // 未读条数
            var unreadNum = record.get('unReadNum');
            if (unreadNum >= 0) {
                unreadNum += 1;
            }

            // 消息，分类型
            var message = '';
            if (data.msg_type == MsgType.TextMsg) {
                message = data.message;
            } else if (data.msg_type == MsgType.ImgMsg) {
                message = '[' + data.attach_id + ']';
            }

            // 发送者姓名
            var senderName = ChatHelper.getName(data.user_id);
            // 会话类型
            var chatType = ChatHelper.getChatType(data.chat_id);

            // 标题头，若是多人会话，缓存获取
            if (chatType == ChatType.Group) {
                header = ChatHelper.getChatHeader(data.chat_id);
            }


            var notice = JSON.stringify({
                chat_id: data.chat_id,
                header: header,
                message: message,
                badge: unreadNum,
                create_at: data.create_at,
                chat_type: chatType,
                sender: senderName
            });

            window.cefMain.addNotice(notice);
        }
    },

    initNotice(data) {
        if (window.cefMain) {
            var notices = [],
                header = '';

            for (var i = 0; i < data.length; i++) {
                if (data[i].chat.unread_count > 0) {
                    // 获取header
                    if (data[i].chat.chat_type == ChatType.Direct) {
                        var oid = ChatHelper.getOtherUserID(data[i].chat.chat_name);
                        header = ChatHelper.getName(oid);
                    } else if (data[i].chat.chat_type == ChatType.Group) {
                        header = data[i].chat.header;
                    }

                    notices.push({
                        chat_id: data[i].chat.chat_id,
                        header: header,
                        // message: data[i].chat.message,
                        badge: data[i].chat.unread_count,
                        create_at: data[i].chat.last_post_at, // 这边就传这个吧
                        chat_type: data[i].chat.chat_type,
                        // sender: 
                    });
                }
            }

            notices = JSON.stringify(notices);
            window.cefMain.initNotice(notices);
        }
    }
});