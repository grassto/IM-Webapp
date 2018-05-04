Ext.define('IMMobile.view.group.GroupSelListController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.groupsellistcontroller',

    requires: [
        'IMMobile.view.group.OrgSelMems',
        'IMCommon.utils.ChatUtil'
    ],

    // 跳转到企业通讯录界面
    onShowOrgMems() {
        // const imMobile = Ext.Viewport.lookup('IMMobile').down('#navView');

        // imMobile.push({
        //     xtype: 'IMMobile-orgSelMems',
        //     itemId: 'IMMobile-orgSelMems'
        // });

        Redirect.redirectTo('IMMobile-orgSelMems');
    },

    onCreateChat() {
        const me = this;
        Ext.Msg.confirm('提示', '确定要发起群聊吗？', function (btn) {
            if (btn == 'yes') {
                me.doCreateChat();
            }
        });
    },

    doCreateChat() {
        const me = this,
            view = me.getView(),
            store = view.down('groupedList').getStore(),
            records = store.query('selList', true);

        if (records.length == 1) {
            User.crtChatName = records.items[0].getData().user_name;
            User.chatMemID = records.items[0].getData().user_id;
        } else if (records.length > 1) {
            var memsID = [];
            for (var i = 0; i < records.items.length; i++) {
                memsID.push(records.items[i].getData().user_id);
            }

            ChatUtil.createGrpChat(memsID, me.createChatSuccess);
        }
    },

    // doCreateChat() {
    //     const me = this,
    //         veiw = me.getView(),
    //         store = veiw.down('#grpMems').getStore(),
    //         record = store.getData();



    //     if (record.length == 1) { // 单人会话
    //         User.crtChatName = record.items[0].getData().user_name;
    //         User.chatMemID = record.items[0].getData().user_id; // 放到chatView去处理

    //         // 页面跳转
    //         me.reDirectToChatView();
    //     } else if (record.length > 1) { // 多人会话，直接新建
    //         var memsID = [];
    //         for (var i = 0; i < record.items.length; i++) {
    //             memsID.push(record.items[i].getData().user_id);
    //         }

    //         ChatUtil.createGrpChat(memsID, me.createChatSuccess);
    //     }

    // },

    createChatSuccess(data) {
        User.crtChannelId = data.chat_id;// 用于跳转后打开页面
        User.crtChatName = data.header; // 标题头

        // const me = this; 这儿的作用域有问题了
        // me.addChatToCache(data);

        // 缓存数据添加
        // 返回的结果没有人员信息
        Utils.ajaxByZY('get', 'chats/' + data.chat_id + '/members', {
            // async: false, // 在此不能异步，不然数据不统一
            success: function (result) {
                User.allChannels.push({
                    chat: data,
                    members: result
                });
            }
        });

        // 绑定数据至最近会话列表
        AddDataUtil.bindChatToRecent(data, '', data.header);

        // 页面跳转
        const imMobile = Ext.Viewport.lookup('IMMobile').down('#navView');

        imMobile.pop(); // 先跳出来

        imMobile.push({
            xtype: 'IMMobile-chatView',
            itemId: 'IMMobile-chatView'
        });
    },

    reDirectToChatView() {
        // 页面跳转
        //  const imMobile = Ext.Viewport.lookup('IMMobile').down('#navView');

        //  imMobile.pop(); // 先跳出来

        //  imMobile.push({
        //      xtype: 'IMMobile-chatView',
        //      itemId: 'IMMobile-chatView'
        //  });
        Redirect.redirectTo('IMMobile-chatView');
    },

    // 点解选中的人，取消选中
    onRemoveGrpMem(view, location) {
        var store = view.getStore(),
            record = location.record;
        // list取消选中
        var userID = record.data.user_id,
            listStore = this.getView().down('groupedList').getStore(),
            listRecord = listStore.getById(userID);

        listRecord.set('selList', false);

        // 确定后面的数字减一
        const viewModel = this.getViewModel();
        viewModel.set('personNum', viewModel.get('personNum') - 1);

        // 选中列表移除
        // store.remove(record); // 若在此移除了，则会引发bug，extjs内置的函数bug
        record.set('selList', false);

        // debugger;
        // var items = this.getView().down('groupedList').getItems();
        // for(var i = 0; i < items.length; i++) {
        //     //  字符串                                        数字
        //     if(items.items[i].el.dom.dataset.recordid == listRecord.internalId) {
        //         // 去除class,这样会出错
        //         // items.items[i].el.removeCls('selList');
        //         // items.items[i].el.dom.classList.remove('selList');

        //         // debugger;

        //         // 模拟list的tap操作，调用groupedList的onSelChild方法
        //         // 拼凑参数
        //         // var variable = {};
        //         // variable.event = {};
        //         // variable.event.currentTarget = items.items[i].el.dom;
        //         // view.up('IMMobile-grpSelList').down('groupedList').onSelChild('', variable);
        //         break;
        //     }
        // }

    }
});