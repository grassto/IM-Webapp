/*
    内存中用户相关信息
*/
Ext.define('PushIM.Webapp.util.User', {
    alternateClassName: 'User',
    singleton: true,

    ownerID: '', // 用户自己的ID

    allUsers: [], // 所有用户
    organization: [],
    allStatus: [], // 所有的人员状态
    allOthers: [], // 除去自己外的所有用户

    // 这个可以不要
    posts: [], // 消息

    crtUser: {}, // 个人信息
    allChannels: [], // 当前用户所在的所有频道

    preferences: [],
    files: [], //所选中的文件或图片id


    crtChannelId: '', // 当前选择的频道ID
    crtSelUserId: '', // 当前选中的对方用户ID

    crtChatMembers: [], // 当前频道中的成员，当发起多人会话时使用
    isPlus: true, // 点击的是否为+弹出的发起多人会话的框

    detailByOrg: {}, // 从详细界面跳转到聊天页面所需要的数据

    grpChgInfo: [], // 群聊提示信息
    // {
    //     chatId: xxx,
    //     grpMsg: [{msg:'msg',updateAt:xxx},{msg:'msg',updateAt:xxx}]
    // }

    // {
    //     chatId: xxx,
    //     grpAddMsg: [{msg:'msg',updateAt:xxx},{msg:'msg',updateAt:xxx},...],
    //     memRemoveMsg: [],
    //     memAddMsg: []
    // }
    // grpAddMsg: [],
    // memAddMsg: [],
    // memRemoveMsg: [],

    clear() {
        User.ownerID = '';
        User.allUsers = [];
        User.organization = [];
        User.allStatus = [];
        User.allOthers = [];
        User.posts = [];
        User.crtUser = {};
        User.allChannels = [];
        User.preferences = [];
        User.files = [];
        User.crtChannelId = '';
        User.crtSelUserId = '';
        User.crtChatMembers = [];
        User.isPlus = true;
        User.detailByOrg = {};
        User.grpChgInfo = [];
        // User.grpAddMsg = [];
        // User.memAddMsg = [];
        // User.memRemoveMsg = [];
    }

});