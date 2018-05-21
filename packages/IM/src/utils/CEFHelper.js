Ext.define('IM.utils.CEFHelper', {
    alternateClassName: 'CEFHelper',
    singleton: true,

    addNotice(data) {
        if (window.cefMain) {
            const store = Ext.Viewport.lookup('IM').down('#recentChat').getStore(),
                record = store.getById(data.chat_id);

            // 未读条数
            var unreadNum = record.get('unReadNum');

            // 消息，分类型
            var message = '';
            if (data.msg_type == MsgType.TextMsg) {
                message = data.message;
            } else if (data.msg_type == MsgType.ImgMsg) {
                // message = '[' + data.attach_id + ']';
                message = '[图片]';
            } else if(data.msg_type == MsgType.FileMsg) {
                message = '[文件]';
            }

            // header
            var header = '';
            if(data.chat_type == ChatType.Direct) {
                header = data.user_name;
            } else if(data.chat_type == ChatType.Group) {
                header = '多人会话：' + data.user_name;
            }

            var notice = JSON.stringify({
                chat_id: data.chat_id,
                header: header,
                message: message,
                badge: unreadNum,
                create_at: data.create_at,
                chat_type: data.chat_type,
                sender: data.user_name
            });

            window.cefMain.addNotice(notice);
        }
    },

    initNotice(data) {
        if (window.cefMain) {
            if (data && data.length) {


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
                            message: data[i].chat.last_message,
                            message_type: data[i].chat.last_msg_type, // 这个应该需要的，cef还没
                            badge: data[i].chat.unread_count,
                            create_at: data[i].chat.last_post_at, // 这边就传这个吧
                            chat_type: data[i].chat.chat_type,
                            sender: data[i].chat.last_sender
                        });
                    }
                }

                notices = JSON.stringify(notices);
                window.cefMain.initNotice(notices);
            }

        }
    }
});