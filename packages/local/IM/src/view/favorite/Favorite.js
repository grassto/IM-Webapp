Ext.define('IM.view.favorite.Favorite', {
    extend: 'Ext.Dialog',
    xtype: 'favorite',

    controller: 'favorite',

    title: '我的收藏',
    closable: true,
    closeAction: 'hide',
    maximizable: true,
    html: '暂无收藏'
});