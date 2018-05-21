Ext.define('IMCommon.utils.SendUtil', {
    alternateClassName: 'SendUtil',
    singleton: true,

    /**
     * 拆分消息进行发送并绑定（移动端与PC端的store的field都是一样的）
     * @param {*} editor 编辑框
     * @param {*} chatID 当前会话的ID
     * @param {*} rctStore 需要绑定数据的最近回话列表的store
     * @param {*} msgView 需要绑定数据的消息视图
     */
    sendMsg(editor, chatID, rctStore, msgView) {
        var me = this,
            msgStore = msgView.getStore();

        // if(!me.canSend(chatID, rctStore)) return;// 是否可以在此会话中发消息

        var msg = editor.getSubmitValue(), // 消息体
            childs = ParseUtil.parsePATMsg(msg),
            len = childs.length;

        if (len <= 0) {
            Utils.toastShort('不能发送空白消息');
            return;
        }

        var msgs = [], // 消息数组
            msgDatas = []; // msgStore中的数据
            

        for (var i = 0; i < len; i++) {
            var guid = LocalDataMgr.newGuid(),
                showTime = true,
                msgData = {};

            if (msgStore.data.length > 0) {
                if (Utils.datetime2Ago(msgStore.getAt(msgStore.data.length - 1).get('last_post_at')) == Utils.datetime2Ago(new Date())) {
                    showTime = false;
                }
            }


            // 区分消息类型
            if (childs[i].type == 'img') {
                var img = document.createElement('IMG');
                img.innerHTML = childs[i].value;

                if (img.childNodes[0].hasAttribute('data-url')) {
                    msgData = {
                        client_id: guid,
                        chat_id: chatID,
                        msg_type: MsgType.ImgMsg,
                        user_id: User.ownerID,
                        user_name: User.crtUser.user_name
                    };

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
                        // sendText: childs[i].value, // 图片则直接放img标签上去
                        sendText: ParseUtil.getLocalImg(childs[i].value),
                        msg_type: MsgType.ImgMsg,
                        last_post_at: new Date(),
                        updateTime: new Date(),
                        sendStatus: 1, // 发送态
                        ROL: 'right',
                        showTime: i ==0 ?showTime:false,
                        fileURL: img.childNodes[0].getAttribute('data-url') // 上传图片时需用到的URL
                    });

                    // 发送失败的就不管它了，也不能重新发送
                    // if (Config.needLocal) {
                    //     // 将图片写到本地指定的路径下
                    //     me.writeFile(img.childNodes[0].getAttribute('data-url'), function(r) {
                    //         LocalDataMgr.execSendImg(msgData, r.nativeURL, FileUtil.getFileName(r.nativeURL));
                    //     });
                    // }
                    if (Config.needLocal) {
                        LocalDataMgr.execSendImg(msgData);
                    }
                } else {
                    // 第三方图片下载失败的，可能还有人直接输入<img src="">这种，先不考虑
                }
            } else {
                if (ParseUtil.trim(childs[i].value)) {
                    msgData = {
                        client_id: guid,
                        chat_id: chatID,
                        message: childs[i].value,
                        msg_type: MsgType.TextMsg,
                        user_id: User.ownerID,
                        user_name: User.crtUser.user_name
                    };

                    msgs.push({
                        client_id: guid,
                        chat_id: chatID,
                        message: childs[i].value,
                        msg_type: MsgType.TextMsg,
                        user_id: User.ownerID,
                        user_name: User.crtUser.user_name
                    });

                    msgDatas.push({
                        client_id: guid,
                        senderName: User.crtUser.user_name,
                        sendText: childs[i].value,
                        msg_type: MsgType.TextMsg,
                        last_post_at: new Date(),
                        updateTime: new Date(),
                        sendStatus: 1, // 发送态
                        ROL: 'right',
                        showTime: i ==0 ?showTime:false
                    });

                    if (Config.needLocal) {
                        LocalDataMgr.execSendText(msgData);
                    }
                }

            }
        }

        // 最近会话数据绑定,应该也有消息的发送状态
        rctStore.getById(chatID).set({
            last_post_msg: msgs[len - 1].message, // ParseUtil.getRctLastMsg(rctStore.getById(chatID).get('chat_type'), msgs[len - 1].msg_type, msgs[len - 1].message, User.crtUser.user_name),
            last_msg_type: msgs[len - 1].msg_type,
            last_post_at: new Date(),
            last_post_name: User.crtUser.user_name
        });

        var content = ParseUtil.getRctLastMsg(rctStore.getById(chatID).get('chat_type')||rctStore.getById(chatID).get('type'), msgs[len - 1].msg_type, msgs[len - 1].message, User.crtUser.user_name);
        LocalDataMgr.updateRctBySend(content, new Date(), chatID);

        // 消息数据绑定，都为未成功态
        var msgRecords = msgStore.add(msgDatas);
        // 清空输入框
        editor.clear();

        // 滚动条滚到最下方
        AddDataUtil.onScroll(msgView);

        // if (Config.needLocal) {
        //     LocalDataMgr.execSendMsg(msgs);
        // }

        // 消息发送
        Utils.ajaxByZY('post', 'posts/post2', {
            params: JSON.stringify(msgs),
            success: function (data) {
                // <debug>
                console.log('消息发送成功', data);
                // </debug>

                var pics = [];
                for (var i = 0; i < data.length; i++) {
                    // 文字消息都标志为成功
                    if (data[i].msg_type == MsgType.TextMsg) {
                        // record数组是一一对应的
                        msgRecords[i].set({
                            sendStatus: 0,
                            msg_id: data[i].msg_id
                        });

                        if (Config.needLocal) {
                            LocalDataMgr.updateSendText(data[i]);
                        }
                    } else if (data[i].msg_type == MsgType.ImgMsg) { // 图片消息
                        // 学习江工写的下载图片的方法，使用img标签去上传图片并移动文件路径
                        msgRecords[i].set({
                            msg_id: data[i].msg_id
                        });

                        data[i].fileURL = msgDatas[i].fileURL;
                        pics.push(data[i]);

                        if (Config.needLocal) {
                            LocalDataMgr.updateSendImg(data[i]);
                        }
                    }
                }

                // 图片上传
                if (pics.length > 0) {
                    UpImgMgr.pushImgToQue(pics);
                }

            },
            failure: function (err) {
                // 处理消息发送失败
            }
        });
    },

    /**
     * 将图片写入本地指定路径
     * @param {*} fullName 
     */
    writeFile(fullName, success) {
        var me = this,
            name = FileUtil.getFileName(fullName);

        if (Config.isPC) {
            var root = {
                name: name,
                fullPath: fullName,
                nativeURL: fullName
            };
            var fs = new FileSystem(name, root);

            var ft = new FileEntry(name, fullName, fs);

            var fsNew = new FileSystem(name, { name: name, fullPath: me.getFullImgPath() });

            var directory = new DirectoryEntry('images', me.getFullImgPath(), fsNew);

            ft.copyTo(directory, name, function (r) {
                if (success) {
                    success(r);
                }

            }, function (err) {
                console.log('图片写入本地指定路径时发生错误', err);
            });
        } else if (Config.isPhone) {

        }
    },

    /**
     * 获取本地存储的完整路径
     */
    getFullImgPath() {
        return cefMain.file.dataDirectory + '\\' + User.ownerID + '\\images';
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