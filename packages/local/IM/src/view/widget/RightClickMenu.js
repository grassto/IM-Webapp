Ext.define('IM.view.widget.RightClickMenu', {
    extend: 'Ext.menu.Menu',
    xtype: 'chatView-right-menu',
    
    items: [{
        text: '右击',
        handler: function () {
            alert('右击成功了');
        }
    }, {
        text: '删除',
        handler: function () {
            alert('你点击了删除 ');
        }
    }, {
        text: '属性',
        handler: function () {
            alert('点击了属性项');
        }
    }]
});