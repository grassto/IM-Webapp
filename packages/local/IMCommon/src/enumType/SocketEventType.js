Ext.define('IMCommon.enumType.SocketEventType', {
    singleton: true,
    alternateClassName: 'SocketEventType',

    posted: 'posted',
    createGrp: 'group_added',
    memAdd: 'members_added',
    memRemove: 'member_removed',
    chgManager: 'change_manager',
    updateChat: 'chat_updated',
    getFile: 'get_file'
});