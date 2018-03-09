Ext.define('IM.utils.PreferenceHelper', {
    alternateClassName: 'PreferenceHelper',
    singleton: true,

    toTopArray: [],
    toTop: '1',

    setRecentTop(chatId, toTopIndex) {
        var me = this,
            result = false;

        var params = [{
            user_id: User.ownerID,
            category: 'chat_order',
            name: chatId,
            value: toTopIndex + ''
        }];

        // Utils.ajaxByZY('PUT', 'users/' + User.ownerID + '/Preferences', {
        Utils.ajaxByZY('PUT', 'users/me/Preferences', {
            async: false,
            params: JSON.stringify(params),
            success: function (data) {
                if (data.status == 'OK') {
                    if (toTopIndex > 0) {
                        result = true;
                    }
                }
            }
        });
        return result;
    },

    /**
     * PreferenceHelper.toTop + 1
     */
    toTopAddOne() {
        var res;
        res = parseInt(PreferenceHelper.toTop); // 字符串转数字
        res += 1;
        PreferenceHelper.toTop = res + ''; // 数字转字符串
        return res;
    }
});