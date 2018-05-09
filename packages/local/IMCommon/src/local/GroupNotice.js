/**
 * 发起多人会话的时候，本地组织处xxx邀请xxx加入会话
 */
Ext.define('IMCommon.local.GroupNotice', {
    alternateClassName: 'GroupNotice',
    singleton: true,

    /**
     * 
     * @param {*} creatorID 
     * @param {*} members 
     */
    createNewGrpNotice(creatorID, members) {
        var result = '',
            memNames = '';
        for (var i = 0; i < members.length; i++) {
            if (creatorID != members[i].user_id) {
                if (i == 0) {
                    memNames = members[0].user_name;
                } else {
                    memNames = memNames + '、' + members[i].user_name;
                }
            }
        }
        result = '你邀请' + memNames + '加入了群聊';
        return result;
    }
});