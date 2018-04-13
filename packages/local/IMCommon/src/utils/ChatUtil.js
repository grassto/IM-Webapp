/**
 * 可以把所有的API调用都放到这来，
 * 每个函数都有两个参数，一个是需要传到后台的参数，另一个是成功回调函数
 */
Ext.define('IMCommon.utils.ChatUtil', {
    singleton: true,
    alternateClassName: 'ChatUtil',

    onSend(params, success) {
        Utils.ajaxByZY('post', 'posts', {
            params: params,
            success: success
        });
    }
});