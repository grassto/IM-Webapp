# IM - Read Me

view 文件夹下
    chat 右侧聊天输入框，
         聊天展示区
    favorite 收藏
    groupSel 选择人员发起多人会话
    msgManager 消息管理器
    organization 组织结构树


从details页面转到聊天页的时候，左侧的list的选中并置顶，
使用list的setSelection()来设置选中，
使用store的sort()方法来重新排序。



# 页面缓存数据
所有人员信息：
/***** 个人 ************/
    user_id,
    user_name,
    email,
    sex,
    age,
    phone,
    mobile,
    notes, // 个人说明
    customMark, // 签名
/***** 组织岗位相关 ************/
    def_role_id, // 默认岗位ID
    def_role_name, // 默认岗位名
    org_ids,  // 在哪些组织下

所有组织信息
    org_id,
    org_name,
    parent_id, // 若为空代表根节点
    remarks

所有频道信息,存储频道和频道人员
    chat: {

    },
    members: {

    }

1.用户名密码保存，localStorage，USERID、PASSWORD
2.当前用户ID，User.ownerID
3.当前用户选择的频道ID，User.crtChannelId
4.当前用户选择的频道人员，User.crtChatMembers
    
5.




# 主线
1.登录，api获取相关信息，然后根据相关信息进行数据的绑定：
    1）获取当前用户信息
    2）打开websocket连接
    3）获取所有用户信息
    4）获取组织结构信息
    5）获取所有人员状态信息
    6）获取频道信息

2.组织结构树单击事件,人物详细介绍界面

3.详细界面点击发起聊天与组织结构树双击事件，
发起单人、多人会话（多人肯定新建，单人先查找是否存在，若存在则直接拿来用）
    新建单人、多人会话
    