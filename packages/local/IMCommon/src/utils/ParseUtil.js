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
     * 利用正则拆分img标签
     * @param {string} msg 消息体
     * @return {Array} [{type:xxx,value:xxx},{type:xxx,value:xxx}...]
     */
    parsePATMsg(msg) {
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
                out.push({
                    type: 'text',
                    value: msg.substring(startIndex, r.index)
                }); // 文本
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
                value: msg.substr(startIndex)
            });
        }

        return out;
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
                `<img class="viewPic loaded" src="${path}"/>`,
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
});