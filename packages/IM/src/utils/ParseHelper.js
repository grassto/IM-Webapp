Ext.define('IM.utils.ParseHelper', {
    alternateClassName: 'ParseHelper',
    singleton: true,

    /**
     * 发送图片前，拆分图文混排数据
     * @param {string} msg 消息内容（html）
     * @return {Array} 消息数组
     */
    parseWord(msg) {
        var result = [],
            reg = /\<img[^\>]*src="([^"]*)"[^\>]*\>/g;

        return result;
    },

    // 解析URL有问题，先不急着做
    parseURL(message) {
        // debugger;
        var reg = /^(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?$/ig;
        var result = message.replace(reg, function (str) {
            return '<a href="' + str + '">' + str + '</a>';
        });
        return result;
    },

    /**
     * 发送消息时进行解析
     * @param {string} sendPicHtml 带img的文本
     */
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

    onParseFile(text) {
        var result = '';

        return result;
    },

    /**
     * 将文本消息转为图片
     * @param {string} message '文本[26字符的图片ID]文本'
     * @param {Array} fileIds 文件id
     */
    parsePic(message, fileIds) {
        // file_id为26位的guid号
        var reg = /\[\w{26}\]/ig;
        var result = message.replace(reg, function (str) {
            var out = '',
                id = str.substring(1, str.length - 1);
            // // // debugger;
            if (fileIds && fileIds.length > 0) {
                for (var i = 0; i < fileIds.length; i++) {
                    if (fileIds[i] == id) {
                        // out = '<img style="height:60px;" class="viewPic" src="' + Config.httpUrlForGo + 'files/' + id + '">';  // "'/thumbnail">';
                        out = '<img id="' + id + '" style="/*width:40px;height:40px;*/' + Ext.getResourcePath('images/loading.gif') +') no-repeat center center;" class="viewPic" src="' + Config.httpUrlForGo + 'files/' + id + '/thumbnail">';
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

    parseToPic(message, fileId) {
        if (fileId) {
            return '<img id="' + fileId + '" style="background:url(' + Ext.getResourcePath('images/loading.gif') +') no-repeat center center;" class="viewPic" src="' + Config.httpUrlForGo + 'files/' + fileId + '/thumbnail">';
        }
        return message;
    },

    // 替换字符串中的回车
    textToHtml(text) {
        return text.replace(/\n/g, '<br/>').replace(/\r/g, '<br/>').replace(/\r\n/g, '<br/>');
    },


    htmlToText(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        const result = div.innerText;

        return result;
    },

    /**
     * 解析服务器端获取的数据
     * @param {json} data 从服务器端获取的数据
     */
    getMsgData(data) {
        const me = this;
        var result = {};

        if (data.wrapper_type == MsgWrapperType.Notice) { // 多人通知信息
            var grpChangeMsg = ''; // 组织提示信息
            var memIDs = me.getNoticeMemsByContent(data.notice.operator_id, data.notice.content);

            if (data.notice.operator_id == User.ownerID) { // 发起者的展示信息
                switch (data.notice.notice_type) {
                    case NoticeType.CreateGrp:
                        grpChangeMsg = SocketEventHelper.createOwnWelcomeMsg(data.notice.operator_id, memIDs);
                        break;
                    case NoticeType.AddMem:
                        grpChangeMsg = SocketEventHelper.createMeAddSBMsg(data.notice.operator_id, memIDs);
                        break;
                    case NoticeType.RemoveMem:
                        grpChangeMsg = SocketEventHelper.createMeRemoveSBMsg(data.notice.operator_id, memIDs[0]);
                        break;
                    case NoticeType.ChgTitle:
                        grpChangeMsg = SocketEventHelper.createMeChgHeaderMsg(data.notice.content);
                        break;
                    case NoticeType.ChgManager:
                        grpChangeMsg = SocketEventHelper.meChgMgrToSB(memIDs[0]);
                        break;
                    default:
                        break;
                }
            } else { // 被操作者的展示信息
                switch (data.notice.notice_type) {
                    case NoticeType.CreateGrp:
                        grpChangeMsg = SocketEventHelper.createOtherWelcomeMsg(data.notice.operator_id, memIDs);
                        break;
                    case NoticeType.AddMem:
                        grpChangeMsg = SocketEventHelper.createSBAddSBMsg(data.notice.operator_id, memIDs);
                        break;
                    case NoticeType.RemoveMem:
                        grpChangeMsg = SocketEventHelper.createSBRemoveMeMsg(data.notice.operator_id, memIDs[0]);
                        break;
                    case NoticeType.ChgTitle:
                        grpChangeMsg = SocketEventHelper.createSBChgHeaderMsg(data.notice.content, data.notice.operator_id);
                        break;
                    case NoticeType.ChgManager:
                        grpChangeMsg = SocketEventHelper.sbChgMgrToMe(data.notice.operator_id);
                        break;
                    default:
                        break;
                }
            }

            result = {
                updateTime: new Date(data.create_at),
                GrpChangeMsg: grpChangeMsg,
                showGrpChange: true
            };
        } else if (data.wrapper_type == MsgWrapperType.Message) { // 平常的消息
            var message = data.message, // IMMsg表中的信息
                userName = '', // 在缓存中查找用户名
                ROL = '', // 区别自己和他人的消息，自己的靠右
                text = ''; // 发送的文本

            if (message.user_id == User.ownerID) {
                ROL = 'right';
            }

            // userName = ChatHelper.getName(message.user_id);
            userName = message.user_name;

            if (message.msg_type == MsgType.TextMsg) {
                text = window.minEmoji(message.message); // emoji解析
                result = {
                    msg_id: message.msg_id,
                    senderName: message.user_name,
                    sendText: text,
                    ROL: ROL,
                    updateTime: new Date(message.update_at)
                };
            } else if (message.msg_type == MsgType.ImgMsg) {
                // text = '<img id="' + message.attach_id + '" style="/*width:40px;height:40px;*/background:url(' + Ext.getResourcePath('images/loading.gif') +') no-repeat center center;" class="viewPic" src="' + Config.httpUrlForGo + 'files/' + message.attach_id + '/thumbnail">';
                text = ImgMgr.parsePic(message.attach_id); // 这边是要给本地数据库的回调的

                // 处理本地数据库
                // LocalDataMgr.afterUploadSuc(data.files[i], path);

                // 处理滚动条
                //var url = Config.httpUrlForGo + 'files/' + message.attach_id + '/thumbnail';
                // 图片若未加载完成，则显示loading,加载出现异常，显示默认图片
                //window.imagess(url, message.attach_id);
                result = {
                    msg_id: message.msg_id,
                    senderName: userName,
                    sendText: text,
                    ROL: ROL,
                    updateTime: new Date(message.update_at)
                };
            } else if (message.msg_type == MsgType.FileMsg) {
                result = {
                    msg_id: message.msg_id,
                    msg_type: MsgType.FileMsg,
                    file_id: message.attach_id,
                    fileName: '服务端之后做',
                    fileSize: '服务端之后做',
                    fileStatus: 2,
                    senderName: userName,
                    ROL: ROL,
                    updateTime: new Date(message.update_at)
                };
            }
            if (result) {
                result.msg_type = message.msg_type;
            }


        }

        return result;
    },

    /**
     * 获取被操作者，返回数组
     * @param {string} opID 创建者id
     * @param {string} memsIdStr 参与者的id
     */
    getNoticeMemsByContent(opID, memsIdStr) {
        var ids = memsIdStr.split(',');
        for (var i = 0; i < ids.length; i++) {
            if (ids[i] == opID) {
                ids.splice(i, 1);
                break;
            }
        }

        return ids;
    },


    appendFilePrefix(fileID) {
        return Config.httpUrlForGo + 'files/' + fileID;
    }
});