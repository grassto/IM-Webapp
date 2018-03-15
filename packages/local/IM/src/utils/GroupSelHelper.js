Ext.define('IM.utils.GroupSelHelper', {
    alternateClassName: 'GroupSelHelper',
    singleton: true,

    /**
     * 打开选人框之前处理内存数据,有两个入口，
     * +号和图标
     */
    handleChatMem() {
        User.crtChatMembers = [];
        if (User.isPlus) {
            User.crtChatMembers.push(User.ownerID);
        } else {
            var mems = BindHelper.getMemsByChatId(User.crtChannelId);
            for (var i = 0; i < mems.length; i++) {
                User.crtChatMembers.push(mems[i].user_id);
            }
            // Utils.ajaxByZY('get', 'chats/' + User.crtChannelId + '/members', {
            //     async: false,
            //     success: function (data) {
            //         // debugger;
            //         for (var i = 0; i < data.length; i++) {
            //             User.crtChatMembers.push(data[i].user_id);
            //         }
            //     }
            // });
        }
    },

    // setDefaultSel(orgView) {

    //     var grpStore = orgView.getStore(),
    //         index;
    //     for (var i = 0; i < User.crtChatMembers.length; i++) {
    //         debugger;
    //         index = grpStore.find('id', User.crtChatMembers[i]);
    //         if (index > -1) {
    //             grpStore.getAt(index).set('isSel', true);
    //         }
    //     }

    //     orgView.collapseAll();
    // },

    setDefaultSel(grpStore) {

        var record;
        for (var i = 0; i < User.crtChatMembers.length; i++) {
            record = grpStore.getNodeById(User.crtChatMembers[i]);
            if (record) {
                record.set('isSel', true);
            }
        }
    },

    isDefaultSel(data) {
        var id = data.id;
        for (var i = 0; i < User.crtChatMembers.length; i++) {
            if(id == User.crtChatMembers[i]) {
                return true;
            }
        }
        return false;
    }
});