Ext.define('IMMobile.view.widget.Navbar', {
    extend: 'Ext.TitleBar',
    xtype: 'IMMobile-Navbar',
    config: {
        /**
         * 顶栏是否显示"返回"按钮
         */
        backBtn: true
    },

    constructor: function (config) {
        config = config || {};
        if (Ext.isEmpty(config.docked)) {
            config.docked = 'top';
        }

        if (!config.items) {
            config.items = [];
        }
        this.callParent(arguments);
    },
    applyBackBtn: function (config) {
        var me = this;
        if (config === true) {
            config = {};
        }
        if (config) {
            Ext.applyIf(config, {
                itemId: 'back',
                align: 'left',
                ui: 'back',
                text: '返回',
                $initParent: me,
                handler: function (btn) {
                    // navigationview.pop();
                    Ext.Viewport.lookup('IMMobile').pop();
                }
            });
        }
        return Ext.factory(config, Ext.Button, me.getBackBtn());
    },
    updateBackBtn: function (b) {
        var me = this;
        if (b) {
            me.insert(0, b); // 插入到顶栏第一个位置
        }
    }
});