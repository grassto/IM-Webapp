(function () {
    window.newMessageEvent = {
        time: 0,
        title: document.title,
        timer: null,
        isNotify: true, // 防止多次提醒，会一直闪
        // 显示新消息提示  
        show: function () {
            newMessageEvent.isNotify = false;
            var title = newMessageEvent.title.replace("【　　　】", "").replace("【新消息】", "");
            // 定时器，设置消息切换频率闪烁效果就此产生  
            newMessageEvent.timer = setTimeout(function () {
                newMessageEvent.time++;
                newMessageEvent.show();
                if (newMessageEvent.time % 2 == 0) {
                    document.title = "【新消息】" + title
                }

                else {
                    document.title = "【　　　】" + title
                };
            }, 600);
            return [newMessageEvent.timer, newMessageEvent.title];
        },
        // 取消新消息提示  
        clear: function () {
            newMessageEvent.isNotify = true;
            clearTimeout(newMessageEvent.timer);
            document.title = newMessageEvent.title;
        }
    };
})();