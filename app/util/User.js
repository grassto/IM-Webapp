/*
    内存中用户相关信息
*/
Ext.define('PushIM.Webapp.util.User', {
    alternateClassName: 'User',
    singleton: true,

    ownerID: '', // 用户自己的ID

    allUsers: [], // 所有用户
    allStatus: [], // 所有的人员状态
    allOthers: [], // 除去自己外的所有用户
    crtSelUser: {},

    posts: [], // 消息
    crtChannelName: '', // 会话用户名代替频道名称

    crtUser: {}, // 个人信息
    allChannels: [], // 当前用户所在的所有频道

    preferences: [],
    files: [], //所选中的文件或图片id


    crtChannelId: '', // 当前选择的频道ID
    crtSelUserId: '', // 当前选中的对方用户ID
    statusDesc: '', // 选中的人的状态显示

    clear() {
        User.ownerID = '';
        User.allUsers = [];
        User.allStatus = [];
        User.allOthers = [];
        User.posts = [];
        User.crtChannelName = '';
        User.crtUser = {};
        User.allChannels = [];
        User.preferences = [];
        User.files = [];
        User.crtChannelId = '';
        User.crtSelUserId = '';
        User.statusDesc = '';
        User.crtSelUser = {};
    }

});