Ext.define('IMCommon.utils.ParseUtil', {
    alternateClassName: 'ParseUtil',
    singleton: true,

    /**
     * 将文本消息转为图片
     * @param {string} message 纯文本消息
     * @param {Array} fileIds 文件id
     */
    parsePic(message, fileId) {
        if(fileId) {
            return ImgMgr.parsePic(fileId);
            // return '<img id="' + fileId + '" style="background:url(' + Ext.getResourcePath('images/loading.gif') + ') no-repeat center center;" class="viewPic" src="' + Config.httpUrlForGo + 'files/' + fileId + '/thumbnail">';
        }
        return message;
    }
});