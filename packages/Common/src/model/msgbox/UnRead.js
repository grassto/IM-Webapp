/**
 * 消息箱 未读 @ 的 Model
 * @author jiangwei
 */
Ext.define('Common.model.msgbox.UnRead', {
    extend: 'Common.model.msgbox.Comment',
    idProperty: 'AtGuid',
    fields: [
        'AtGuid',
        {
            name: 'IsRead',
            type: 'string',
            defaultValue: 'N'
        }
    ]
});