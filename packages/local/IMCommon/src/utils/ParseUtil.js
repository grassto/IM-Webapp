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
        startIndex = 0, // 上一个img标签的最后位置+1
        r = ''; // 匹配到的IMG标签
        while(r = reg.exec(msg)) {
            if(r.index == 0) {
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
            startIndex = r.index + r[0].length + 1;
        }

        // 判断最后一个图片后是否还有文本
        if(msg.length > startIndex) {
            out.push({
                type: 'text',
                value: msg.substr(startIndex)
            });
        }

        return out;
    },

    /**
     * 去除file:///
     * @param {*} url 
     */
    getFileURL(url) {
        var reg = /file:[\/]+/g;
        url = url.replace(reg, '');
        return url;
    }
});