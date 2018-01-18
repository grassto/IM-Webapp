/**
 * 评论单个图片 Model
 * @author jiangwei
 */
Ext.define('Common.model.comment.Img', {
    extend: 'Ext.data.Model',
    idProperty: 'FileID',
    fields: [
        'FileID', // client file id

        'ID', // EmbedID
        'FileName',
        'Size',

        'ThumbID', // EmbedID
        'ThumbName',
        'ThumbSize'
    ]
});