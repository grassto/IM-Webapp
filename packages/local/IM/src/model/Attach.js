Ext.define('IM.Model.Attach', {
    extend: 'Ext.data.Model',
    idProperty: 'FileID',
    fields: [
        'FileID', // 如果是远程附件，则与ID相同；本地待上传或者已上传附件则为client file id

        { name: 'AttType', type: 'string', defaultValue: 'T' },
        'ID', // EmbedID
        'FileName',
        'Size',
        'Icon', // 后缀
        { name: 'Progress', type: 'float', defaultValue: 0 }, // 进度
        'Status', // 0 未上传 1 上传中 2 上传完毕 3 错误中断
        'Error'
    ]
});