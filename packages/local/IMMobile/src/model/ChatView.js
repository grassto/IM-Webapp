Ext.define('IMMobile.model.ChatView', {
    extend: 'Ext.data.Model',

    fields: [
        'msg_id', // 消息id
        'wrapper_type', // 区分通知和消息
        {
            name: 'create_at',
            type: 'date',
            convert: function (value) {
                return Utils.datetime2Ago(value, true);
            }
        },
        'user_id', // 发送者id
        'msg_type', // 消息类型 T: 文本 I: 图片 F: 文件
        'att_id', // 附件id
        'is_receipt', // 回执
        'message', // 消息内容


        { // 显示时间？
            name: 'showTime',
            type: 'bool',
            defaultValue: true
        }
    ]
});