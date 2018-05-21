Ext.define('IMCommon.model.Msg', {
    extend: 'Ext.data.Model',
    idProperty: 'msg_id',
    fields: [
        'senderName', 'sendText',
        {
            name: 'updateTime',
            type: 'date',
            convert: function (value) {
                return Utils.datetime2Ago(value, true);
            }
        },
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
        'file_id', // 上传后返回的服务端的id
        'fileID', // 上传前本地的文件id
        'fileName',
        'fileSize',
        'fileIcon',
        {name:'fileProgress', type: 'float', defaultValue: 0},
        'fileStatus' // 0 未上传 1 上传中 2 上传完毕 3 错误中断
    ]
});