/**
 * @某人 功能的 model
 * @author jiangwei
 */
Ext.define('Common.model.comment.Mention', {
    extend: 'Ext.data.Model',

    fields: [
        'ID',
        'Name',
        'Type',
        {
            name: 'TypeDesc',
            type: 'string',
            convert: function (v, record) {
                switch (record.get('Type')) {
                    case 'R':
                        return '岗位';
                    case 'G':
                        return '用户组';
                    case 'O':
                        return '组织';
                    case 'D':
                        return '部门';
                    default:
                        return '用户';
                }
            }
        }
    ]
});