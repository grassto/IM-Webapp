Ext.define('IM.model.Chat', {
    extend: 'Ext.data.Model',
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
        'ROL' // right or left
    ]
});