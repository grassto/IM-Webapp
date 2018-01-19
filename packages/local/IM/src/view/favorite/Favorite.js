Ext.define('IM.view.favorite.Favorite', {
    extend: 'Ext.Dialog',
    xtype: 'favorite',

    controller: 'favorite',

    title: '我的收藏',
    closable: true,
    closeAction: 'hide',
    // maximizable: true,

    layout: 'fit',

    height: '70vh',
    width: '70vw',

    

    constructor(config) {
        config = config || {};
        config.items = [{
            layout: 'vbox',
            padding: 20,
            items: [{
                xtype: 'textfield',
                name: 'Subject',
                role: 'filter',
                placeholder: '搜索',
                minHeight: 30,
                triggers: {
                    search: {
                        type: 'search',
                        // handler: 'onSearch'
                    }
                },
                listeners: {
                    // clearicontap: 'onSearch',
                    // action: 'onSearch'
                }
            }, {
                xtype: 'list',
                flex: 1,
                itemTpl: '暂无收藏'
            }]
        }];

        this.callParent([
            config
        ]);
    }
});