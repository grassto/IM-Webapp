Ext.define('IM.model.viewModel.ChatViewDetail', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.chatView_detail',

    data: {
        nickName: '不要脸',
        mobile: '13777777777',
        phone: '12345677',
        eMail: '1223@122.com',
        department: 'pushsoft/技术部'
    },

    // formulas会慢一步
    formulas: {
        chatView_detail_html: function (get) {
            var html = [
                '<div style="font-size: 20px;">',
                    '<div class="sendToName">' + get('nickName') + '</div>',
                    '<div class="phone">手机：' + get('phone') + '</div>',
                    '<div class="mobile">座机：' + get('mobile') + '</div>',
                    '<div class="eMail">邮箱：' + get('eMail') + '</div>',
                    '<div class="department">部门：' + get('department') + '</div>',
                '</div>'
            ].join('');

            return html;
        }
    }
});