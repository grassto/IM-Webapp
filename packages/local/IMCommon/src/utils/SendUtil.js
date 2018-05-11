Ext.define('IMCommon.utils.SendUtil', {
    alternateClassName: 'SendUtil',
    singleton: true,

    /**
     * 拆分消息进行发送并绑定（移动端与PC端的store的field都是一样的）
     * @param {*} msg 消息（含图文混排的）
     * @param {*} chatID 当前会话的ID
     * @param {*} rctStore 需要绑定数据的最近回话列表的store
     * @param {*} Msgstore 需要绑定数据的消息视图的store
     */
    sendMsg(msg, chatID, rctStore, Msgstore) {
        const me = this;

        if(!me.canSend(rctStore)) return;// 是否可以在此会话中发消息

        var msgs = []; // 消息数组
        if(Config.isPC) {
            msgs = this.parsePTMsg(msg);
        }
        

        if(Config.needLocal) {

        }
    },

    /**
     * 发送会话前进行判断，是否可以在该会话中发言
     * User.crtChannelId标志会话
     * @param {*} rctStore 最近会话的store
     */
    canSend(chatID, rctStore) {
        var record = rctStore.getById(chatID);

        if(!record) {
            Utils.toastShort('未能在会话列表中找到该会话');
            return false;
        }

        // 已经被删除的多人回话
        if(record.chat_type == 'R') {
            Utils.toastShort('对不起，您已被移出该会话');
            return false;
        }
        
    },

    /**
     * 拆分图文混排消息
     * @param {string} msg
     */
    parsePTMsg(msg) {
        var reg = /\<img[^\>]*src="([^"]*)"[^\>]*\>/g;
    },

});