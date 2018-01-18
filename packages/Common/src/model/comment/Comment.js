/**
 * 评论 Model
 * @author jiangwei
 */
Ext.define('Common.model.comment.Record', {
    extend: 'Ext.data.Model',

    idProperty: 'CmtGuid',
    fields: [
        'CmtGuid',
        'UserSign',
        'UserName',
        'ConHtml',
        {
            name: 'CmtDate',
            type: 'date'
        },
        {
            name: 'LineNum',
            type: 'int'
        }, {
            name: 'LikeCount',
            type: 'int'
        }, {
            name: 'FavCount',
            type: 'int'
        },
        'IsMine',
        'IsLike',
        'IsFav',
        'Images',
        'Thumbnails'
    ]
});