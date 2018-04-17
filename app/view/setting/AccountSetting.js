Ext.define('PushIM.Webapp.view.setting.AccountSetting', {
    extend: 'Ext.Container',
    xtype: 'acSetting',

    requires: [
        'Ext.List'
    ],

    cls: 'acSetting',

    items: [{
        xtype: 'titlebar',
        items: [{
            docked: 'top',
            text: '返回',
            align: 'left',
            handler: function (btn) {
                Ext.Viewport.getController().showView('authlogin');
            }
        }, {
            docked: 'top',
            iconCls: 'x-fa fa-plus',
            align: 'right',
            handler: function () {
                Ext.Msg.prompt('输入新地址', '如：http://www.aio7.com/app/', function (ok, value) {
                    if (ok === 'ok') {
                        alert(value);
                    }
                });
            }
        }]
    }, {
        xtype: 'list',
        cls: 'support-select',
        store: {
            fields: ['id', 'name'],
            data: [{
                id: 1,
                name: 'http://imapp.pusherp.com:17002/'
            }, {
                id: 2,
                name: 'https://imapp.pusherp.com/'
            }]
        },
        itemTpl: [
            '<div style="float:left">',
                '<div class="select"></div>',
            '</div>',
            '<div class="Content">{name}</div>'
        ].join('')
    }]
});