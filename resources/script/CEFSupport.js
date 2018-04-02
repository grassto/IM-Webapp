/**
 * 给window注册对象，方便cef进行调用
 */
(function () {
    window.cefOpenChat = function (chatID) {
        if(window.cefMain) {
            ChatHelper.openChat(chatID);
        }
    }
})();