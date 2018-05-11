Ext.define('IMCommon.utils.SendUtil', {
    alternateClassName: 'SendUtil',
    singleton: true,

    /**
     * 拆分消息进行发送并绑定（移动端与PC端的store的field都是一样的）
     * @param {*} editor 编辑框
     * @param {*} chatID 当前会话的ID
     * @param {*} rctStore 需要绑定数据的最近回话列表的store
     * @param {*} MsgStore 需要绑定数据的消息视图的store
     */
    sendMsg(editor, chatID, rctStore, msgStore) {
        var me = this,
            msg = editor.value; // 消息体

        // if(!me.canSend(rctStore)) return;// 是否可以在此会话中发消息

        var msgs = [], // 消息数组
        msgDatas = []; // msgStore中的数据

        var childs = ParseUtil.parsePTMsg(msg),
            len = childs.length;
        for (var i = 0; i < len; i++) {
            var msgType = '',
                guid = LocalDataMgr.newGuid();

            // 区分消息类型
            if (childs[i].tagName == 'IMG') {

                if(childs[i].hasAttribute('data-url')) {
                    msgs.push({
                        client_id: guid,
                        chat_id: chatID,
                        msg_type: MsgType.ImgMsg,
                        user_id: User.ownerID,
                        user_name: User.crtUser.user_name
                    });

                    // 图片的展示需要再做一下
                    msgDatas.push({
                        client_id: guid,
                        senderName: User.crtUser.user_name,
                        sendText: childs[i], // 图片则直接放img标签上去，这个还得改
                        msg_type: MsgType.ImgMsg,
                        last_post_at: new Date(),
                        sendStatus: 1, // 发送态
                        ROL: 'right',
                        fileURL: childs[i].getAttribute('data-url') // 上传图片时需用到的URL
                    });
                    
                } else {
                    // 第三方图片下载失败的，可能还有人直接输入<img src="">这种，先不考虑
                }
            } else {
                msgs.push({
                    client_id: guid,
                    chat_id: chatID,
                    message: childs[i].data,
                    msg_type: MsgType.TextMsg,
                    user_id: User.ownerID,
                    user_name: User.crtUser.user_name
                });

                msgDatas.push({
                    client_id: guid,
                    senderName: User.crtUser.user_name,
                    sendText: childs[i].data,
                    msg_type: MsgType.TextMsg,
                    last_post_at: new Date(),
                    sendStatus: 1, // 发送态
                    ROL: 'right'
                });
            }
        }

        // 最近会话数据绑定,应该也有消息的发送状态
        rctStore.getById(chatID).set({
            last_msg_type: msgs[len - 1].msg_type == MsgType.TextMsg ? msgs[len - 1].message : '[图片]',
            last_post_msg: msgs[len - 1].msg_type,
            last_post_at: new Date(),
            last_post_name: User.crtUser.user_name
        });

        // 消息数据绑定，都为未成功态
        var msgRecords = msgStore.add(msgDatas);

        // 消息发送
        Utils.ajaxByZY('post', 'posts/post2', {
            params: JSON.stringify(msgs),
            success: function (data) {
                // <debug>
                console.log('消息发送成功', data);
                // </debug>

                var pics = [];
                for(var i = 0; i < data.length; i++) {
                    // 文字消息都标志为成功
                    if(data[i].msg_type == MsgType.TextMsg) {
                        // record数组是一一对应的
                        msgRecords[i].set({
                            sendStatus: 0,
                            msg_id: data[i].msg_id
                        });
                    } else if(data[i].msg_type == MsgType.ImgMsg) {
                        msgRecords[i].set({
                            msg_id: data[i].msg_id
                        });

                        data[i].fileURL = msgDatas[i].fileURL;
                        pics.push(data[i]);
                    }
                }

                // 图片上传
                if(pics.length > 0) {
                    UpImgMgr.pushImgToQue(pics);
                }
                
            }
        });

        // 发送消息


        if (Config.needLocal) {

        }
    },

    /**
     * 发送会话前进行判断，是否可以在该会话中发言
     * User.crtChannelId标志会话
     * @param {*} rctStore 最近会话的store
     */
    canSend(chatID, rctStore) {
        var record = rctStore.getById(chatID);

        if (!record) {
            Utils.toastShort('未能在会话列表中找到该会话');
            return false;
        }

        // 已经被删除的多人回话
        if (record.chat_type == 'R') {
            Utils.toastShort('对不起，您已被移出该会话');
            return false;
        }

    },



});