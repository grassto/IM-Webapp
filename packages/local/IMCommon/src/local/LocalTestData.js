Ext.define('IMCommon.local.LocalTestData', {
    alternateClassName: 'LocalTestData',
    singleton: true,

    recentChatData: [{
        id: '1',
        name: '一剪梅',
        type: 'D',
        status: 1,
        chat_name: '一剪梅',
        isUnRead: true,
        unReadNum: 3,
        last_post_at: new Date(),
        last_post_msg: '傲立雪中'
    }, {
        id: '2',
        name: '一剪梅2',
        type: 'D',
        status: 0,
        chat_name: '一剪梅2',
        isUnRead: true,
        unReadNum: 3,
        last_post_at: new Date(),
        last_post_msg: '傲立雪中'
    }],


    history: [{
        
    }]
});