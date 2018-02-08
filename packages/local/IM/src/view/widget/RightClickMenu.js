Ext.define('IM.view.widget.RightClickMenu', {
    extend: 'Ext.menu.Menu',
    xtype: 'chatView-right-menu',
    items: [{
        text: '复制',
        handler: function () {
            alert('复制成功了');
        }
    }, {
        text: '删除',
        handler: function () {
            alert('你点击了删除 ');
        }
    }, {
        text: '撤销',
        handler: function () {
            alert('点击了撤销');
        }
    }, {
        text: '引用'
    }, {
        text: '评论'
    }]
});