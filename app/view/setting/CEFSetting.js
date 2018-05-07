Ext.define('PushIM.Webapp.view.setting.CEFSetting', {
    extend: 'Ext.Container',
    xtype: 'CEFSetting',

    requires: [
        'Ext.form.Panel',
        'Ext.field.Radio'
    ],

    layout: {
        type: 'vbox',
        align: 'center',
        pack: 'center'
    },
    cls: 'cefSet',

    items: [{
        xtype: 'component',
        html: '网络设置',
        cls: 'netSetMsg'
    }, {
        xtype: 'formpanel',
        itemId: 'netForm',
        layout: 'hbox',
        items: [{
            xtype: 'radiofield',
            name: 'net',
            value: 'in',
            label: '内网',
            checked: true,
            listeners: {
                check: function(radio, eOpts) {
                    var txf = radio.up('CEFSetting').down('#txSer');
                    txf.setValue(localStorage.getItem('inUrl'));
                    localStorage.setItem('inOrOut', 'in');
                }
            }
        }, {
            xtype: 'radiofield',
            name: 'net',
            value: 'out',
            label: '外网',
            listeners: {
                check: function(radio, eOpts) {
                    var txf = radio.up('CEFSetting').down('#txSer');
                    txf.setValue(localStorage.getItem('outUrl'));
                    localStorage.setItem('inOrOut', 'out');
                }
            }
        }]
    }, {
        xtype: 'textfield',
        itemId: 'txSer',
        label: '服务器',
        listeners: {
            blur: function(txf) {
                var values = txf.up('CEFSetting').down('#netForm').getValues();
                if(values.net == 'in') {
                    localStorage.setItem('inUrl', txf.getValue());
                } else if(values.net == 'out') {
                    localStorage.setItem('outUrl', txf.getValue());
                }
            }
        }
    }, {
        xtype: 'button',
        text: '返回',
        ui: 'action',
        handler: function() {
            Ext.Viewport.getController().showView('authlogin');

            Ext.Viewport.getController().setConfigUrl();
        }
    }],

    initialize() {
        this.down('#txSer').setValue(localStorage.getItem('inUrl')); // 初始化赋值
    }
});