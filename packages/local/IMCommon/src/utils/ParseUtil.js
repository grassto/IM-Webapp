Ext.define('IMCommon.utils.ParseUtil', {
    alternateClassName: 'ParseUtil',
    singleton: true,

    /**
     * 将文本消息转为图片
     * @param {string} message 纯文本消息
     * @param {Array} fileIds 文件id
     */
    parsePic(message, fileId) {
        if (fileId) {
            return ImgMgr.parsePic(fileId);
            // return '<img id="' + fileId + '" style="background:url(' + Ext.getResourcePath('images/loading.gif') + ') no-repeat center center;" class="viewPic" src="' + Config.httpUrlForGo + 'files/' + fileId + '/thumbnail">';
        }
        return message;
    },

    parseDirectChatName(dataWrap, userID) {
        var chatName = '';
        if (dataWrap.members[0].user_id !== userID) {
            chatName = dataWrap.members[0].user_name;
        } else {
            chatName = dataWrap.members[1].user_name;
        }

        return chatName;
    },

    /**
     * 拆分图文混排消息,这样会多出空的子节点
     * @param {string} msg
     * @return {Array}
     */
    parsePTMsg(msg) {
        var div = document.createElement('div');
        div.innerHTML = msg;
        return div.childNodes;
    },

    /**
     * 之后再改
     * 利用正则拆分img标签,这边应该都是html，因为要放到页面展示，在存入数据库的时候，再改为text
     * @param {string} msg 消息体
     * @return {Array} [{type:xxx,value:xxx},{type:xxx,value:xxx}...]
     */
    parsePATMsg(msg) {
        var me = this;
        var reg = /\<img[^\>]*src="([^"]*)"[^\>]*\>/g;

        var out = [], // 返回值
            startIndex = 0, // 上一个img标签的最后位置
            r = ''; // 匹配到的IMG标签
        while (r = reg.exec(msg)) {
            if (r.index == 0) {
                out.push({
                    type: 'img',
                    value: msg.substr(0, r[0].length)
                });
            } else {
                // 若去除了两边的空格还有值，则加入
                if (me.trim(me.replaceBrNbsp(msg.substring(startIndex, r.index)))) {
                    out.push({// 文本
                        type: 'text',
                        value: me.replaceBrNbsp(msg.substring(startIndex, r.index))
                    });
                }
                out.push({
                    type: 'img',
                    value: msg.substr(r.index, r[0].length + 1)
                });
            }
            startIndex = r.index + r[0].length;
        }

        // 判断最后一个图片后是否还有文本
        if (msg.length > startIndex) {
            out.push({
                type: 'text',
                value: me.replaceBrNbsp(msg.substr(startIndex))
            });
        }

        return out;
    },

    /**
     * 去除<br>
     * nbsp;改为空格
     * @param {*} html
     */
    replaceBrNbsp(html) {
        // 空格直接存为nbsp;也好去取
        return html.replace(/<br\s*\/?>/gi, '\r\n').replace(/&nbsp;/gi, ' ');
    },

    /**
     * 替换字符串中的空格和回车为&nbsp; <br>
     * @param {*} str
     */
    parseToHtml(str) {
        return str.replace(/\r\n/g, '<br>').replace(/\s/g, '&nbsp;');
    },

    /**
     * 去除字符串两端的空格
     * @param {string} str
     */
    trim(str) {
        return str.replace(/(^[\s\n\t]+|[\s\n\t]+$)/g, '');
    },

    /**
     * 根据不同的情况拼凑Rct的lastMsg
     * @param {*} chatType 
     * @param {*} msgType 
     * @param {*} msg 
     * @param {*} username 
     */
    getRctLastMsg(chatType, msgType, msg, username) {
        var content = '';
        if (chatType == ChatType.Group) {
            content += `${username}：`;
        }

        switch (msgType) {
            case MsgType.TextMsg:
                content += msg;
                break;
            case MsgType.ImgMsg:
                content += '[图片]';
                break;
            case MsgType.FileMsg:
                content += '[文件]';
                break;
            default:
                break;
        }
    },

    /**
     * 给传入的string类型的img标签添加样式类，使其可以浏览
     * @param {string} img
     */
    getLocalImg(img) {
        var ss = $(img).addClass('viewPic loaded');
        img = ss[0].outerHTML;

        return [
            '<div class="imgBlock">',
            img,
            '</div>'
        ].join('');
    },

    /**
     * 去除file:///
     * @param {*} url 
     */
    getFileURL(url) {
        var reg = /file:[\/]+/g;
        url = url.replace(reg, '');
        return url;
    },

    /**
     * 根据传入的路径拼凑img标签
     * @param {*} path 本地数据库图片路径
     */
    getLocalPic(path) {
        if (path) {
            path = this.getLocalFileURL(path);
            return [
                '<div class="imgBlock">',
                `<img class="viewPic loaded" src="${path}" data-original="${path}"/>`,
                '</div>'
            ].join('');
        }

        return [
            '<div class="imgBlock">',
            `<img class="" src="${Ext.getResourcePath('images/failed.png')}"/>`,
            '<div class="img-tip">加载失败</div>',
            '</div>'
        ].join('');
    },
    /**
     * 将file:///转为localfile:///
     * @param {*} url
     */
    getLocalFileURL(url) {
        var reg = /file:[\/]+/g;
        url = url.replace(reg, 'localfile:///');

        return url;
    },

    /**
     * 单人会话，从服务器返回的members中获取user_name
     * @param {Array} mems
     */
    getDctNameFromMems(mems) {
        if (mems[0].user_id !== User.ownerID) {
            return mems[0].user_name;
        }
        return mems[1].user_name;
    },


    /**
     * 获取群聊提示
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


    getGrpNotice(data) {
        var me = this,
            res = '';
        switch (data.notice_type) {
            case NoticeType.CreateGrp:
                res = me.getCreateNotice(data);
                break;
            default:
                break;
        }

        return res;
    },

    /**
     * 拼新建会话信息
     * @param {*} data
     */
    getCreateNotice(data) {
        var ids = '', names = '', res = '';
        if(data.content instanceof Array) {
            ids = data.content;
        } else {
            ids = data.content.split(',');
        }
        if(data.content_ex instanceof Array) {
            names = data.content_ex;
        } else {
            names = data.content_ex.split(',');
        }

        if (data.operator_id == User.ownerID) {
            res += '你邀请';

            var mems = [];
            for (var i = 0; i < ids.length; i++) {
                if (data.operator_id != ids[i]) {
                    mems.push(names[i]);
                }
                res += mems.join('、');
            }
        } else {
            res += `${data.operator_name}邀请你和`;

            var mems = [];
            for (var i = 0; i < ids.length; i++) {
                if (data.operator_id != ids[i] && User.owner != ids[i]) {
                    mems.push(names[i]);
                }
            }
            res += mems.join('、');
        }

        res += '加入群聊';
        return res;
    }
});