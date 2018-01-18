/**
 * 消息箱 评论
 * @author jiangwei
 */
Ext.define('Common.model.msgbox.Comment', {
    extend: 'Ext.data.Model',
    idProperty: 'CmtGuid',
    fields: [
        'CmtGuid',
        {
            name: 'UserSign',
            mapping: 'FromUserSign'
        },
        {
            name: 'UserName',
            mapping: 'FromUserName'
        },
        'ConHtml',
        {
            name: 'ObjType',
            type: 'int'
        },
        {
            name: 'MDK',
            allowNull: true
        },
        'StgGuid',
        'KeyValue',
        {
            name: 'Key1',
            allowNull: true
        },
        {
            name: 'Key2',
            allowNull: true
        },
        {
            name: 'Key3',
            allowNull: true
        },
        {
            name: 'Key4',
            allowNull: true
        },
        'BaseDesc',
        'BaseDesc2',
        {
            name: 'CmtDate',
            type: 'date'
        },
        {
            name: 'LineNum',
            type: 'int'
        },
        {
            name: 'LikeCount',
            type: 'int'
        },
        {
            name: 'FavCount',
            type: 'int'
        },
        'IsFav',
        'IsLike',
        'Images',
        'Thumbnails',
        'DBName'
    ]
});