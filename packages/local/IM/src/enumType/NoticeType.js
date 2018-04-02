Ext.define('IM.enumType.NoticeType', {
    singleton: true,
    alternateClassName: 'NoticeType',

    CreateGrp: 'G', // 新建多人会话
    AddMem: 'A', // 多人会话加人
    RemoveMem: 'R', // 多人会话删人
    ChgTitle: 'M', // 修改标题头
    ChgManager: 'C' // 修改群管理员
});