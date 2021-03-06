Ext.define('PushIM.Webapp.view.setting.CEFSetting', {
    extend: 'Ext.Container',
    xtype: 'CEFSetting',

    requires: [
        'Ext.form.Panel',
        'Ext.field.Radio'
    ],

    cls: 'CefDrag',

    layout: 'vbox',

    items: [{
        xtype: 'container',
        itemId: 'imiTitle',
        layout: 'hbox',
        cls: 'loginImitateBrowse',
        hidden: true,
        height: 25,
        items: [{
            xtype: 'component',
            flex: 1
        }, {
            xtype: 'button',
            cls: 'CefNoDrag',
            ui: 'cefClose',
            docked: 'right',
            iconCls: 'i-im-close',
            handler: function () {
                if (window.cefMain) {
                    window.cefMain.close();
                }
            }
        }]
    }, {
        flex: 1,

        layout: {
            type: 'vbox',
            align: 'center',
            pack: 'center'
        },

        items: [{
            xtype: 'component',
            html: '网络设置',
            cls: 'netSetMsg'
        }, {
            xtype: 'formpanel',
            itemId: 'netForm',
            layout: 'hbox',
            cls: 'CefNoDrag',
            items: [{
                xtype: 'radiofield',
                name: 'net',
                value: 'in',
                label: '内网',
                checked: true,
                listeners: {
                    check: function (radio, eOpts) {
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
                    check: function (radio, eOpts) {
                        var txf = radio.up('CEFSetting').down('#txSer');
                        txf.setValue(localStorage.getItem('outUrl'));
                        localStorage.setItem('inOrOut', 'out');
                    }
                }
            }]
        }, {
            xtype: 'textfield',
            itemId: 'txSer',
            cls: 'CefNoDrag',
            label: '服务器',
            listeners: {
                blur: function (txf) {
                    var values = txf.up('CEFSetting').down('#netForm').getValues();
                    if (values.net == 'in') {
                        localStorage.setItem('inUrl', txf.getValue());
                    } else if (values.net == 'out') {
                        localStorage.setItem('outUrl', txf.getValue());
                    }
                }
            }
        }, {
            xtype: 'button',
            text: '返回',
            cls: 'CefNoDrag',
            ui: 'action',
            handler: function (txf) {
                var values = txf.up('CEFSetting').down('#netForm').getValues();
                if (values.net == 'in') {
                    localStorage.setItem('inOrOut', 'in');
                } else if (values.net == 'out') {
                    localStorage.setItem('inOrOut', 'out');
                }
                // if (Ext.manifest.env == 'production') {
                //     Ext.getApplication().setConfigUrl();
                // }
                Ext.getApplication().setConfigUrl();
                Ext.Viewport.getController().showView('authlogin');
            }
        }]
    }]

    ,

    initialize() {
        if(Config.isPC) {
            this.down('#imiTitle').setHidden(false);
        }
        
        this.down('#txSer').setValue(localStorage.getItem('inUrl')); // 初始化赋值
    }
});