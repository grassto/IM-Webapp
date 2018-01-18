Ext.define('IM.store.ChatView', {
    extend: 'Ext.data.Store',

    alias: 'store.chatView',
    
    model: 'IM.model.Chat',

    data: [{
        senderName: '张龙',
        sendText: 'hello 赵虎',
        updateTime: new Date(),
        ROL: 'right'
    }, {
        senderName: '赵虎',
        sendText: 'hello 张龙',
        updateTime: new Date()
    }, {
        senderName: '赵虎',
        sendText: 'hello 张龙',
        // updateTime: new Date()
    }, {
        senderName: '赵虎',
        sendText: 'hello 张龙',
        // updateTime: new Date()
    }, {
        senderName: '赵虎',
        sendText: 'hello 张龙',
        // updateTime: new Date()
    }]
});