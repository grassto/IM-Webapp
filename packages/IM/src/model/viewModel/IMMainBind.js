Ext.define('IM.model.viewModel.IMMainBind', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.mainBind',

    data: {
        company: 'PushSoft',
        org: '技术部',
        personNum: '',

        mobile: '13777777777',
        phone: '12345677',
        eMail: '1223@122.com',
        department: 'pushsoft/技术部',
        btnText: '发起聊天',

        ownerName: '张龙',
        ownerMail: 'zhanglong@163.com',
        sendToName: '赵虎',
        avatar: '',
        status: '在线',
        showStatus: 'inline',

        isOrgDetail: true, // 详细界面的展示信息
        orgSelRecord: {},

        isHideBrowseTitle: true // 隐藏浏览器关闭按钮
    },

    formulas: {
        personHtml: function (get) {
            var html = [
                '<div style="font-size: 25px;">',
                    '<div class="sendToName">' + get('sendToName') + '</div>',
                    '<div class="phone">手机：' + get('phone') + '</div>',
                    '<div class="mobile">座机：' + get('mobile') + '</div>',
                    '<div class="eMail">邮箱：' + get('eMail') + '</div>',
                    '<div class="department">部门：' + get('department') + '</div>',
                '</div>'
            ].join('');

            return html;
        },

        orgHtml: function (get) {
            var html = [
                '<div style="text-align:center;">',
                    '<div class="company">' + get('company') + '</div>',
                    '<div class="org">' + get('org') + '</div>',
                    '<div class="personNum">' + get('personNum') + '人</div>',
                '</div>'
            ].join('');

            return html;
        },

        detailHtml: function(get) {
            if(get('isOrgDetail')) {
                return get('orgHtml');
            }
            return get('personHtml');
        }
    }
});