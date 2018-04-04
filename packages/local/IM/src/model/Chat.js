Ext.define('IM.model.Chat', {
    extend: 'Ext.data.Model',
    idProperty: 'msg_id',
    fields: [
        'senderName', 'sendText',
        {
            name: 'updateTime',
            type: 'date',
            convert: function (value) {
                return Utils.datetime2Ago(value, true);
                // debugger;
                // if (typeof(value) == 'object') {
                //     var now = new Date(),
                //         nowYear = now.getFullYear(),
                //         nowMonth = now.getMonth() + 1,
                //         nowDate = now.getDate();
                //     if (nowYear == value.getFullYear()) {
                //         if (nowMonth == value.getMonth() + 1) {
                //             if (nowDate == value.getDate()) {
                //                 return Ext.Date.format(value, 'H:i');
                //             }
                //         }
                //     }

                //     var createTime = Ext.Date.format(value, 'Y-m-d H:i');
                //     return createTime;
                // }
                // return value;
            }
        },
        'isMine',
        'file',
        'ROL', // right or left
        { // 显示时间？
            name: 'showTime',
            type: 'bool',
            defaultValue: true
        },
        'msg_id', // 消息id
        { // 多人会话的通知信息是否展示
            name: 'showGrpChange',
            type: 'bool',
            defaultValue: false
        },
        'GrpChangeMsg', // 多人会话消息提示信息

        // 处理文件
        'msg_type',
        'fileName',
        'fileSize',
        'fileIcon',
        {name:'fileProgress', type: 'float', defaultValue: 0},
        'fileStatus' // 0 未上传 1 上传中 2 上传完毕 3 错误中断
    ]
});