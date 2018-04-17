Ext.define('IMMobile.view.widget.Navbar', {
    extend: 'Ext.TitleBar',
    xtype: 'IMMobile-Navbar',
    config: {
        /**
         * 顶栏是否显示"返回"按钮
         */
        backBtn: true,
        /**
        * 顶栏是否展示标题头
        */
        // showTitle: false,

        /**
         * 顶栏标题头内容
         */
        titleMsg: ''
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
                    Ext.Viewport.lookup('IMMobile').down('#navView').pop();
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
    },

    applyTitleMsg: function(config) {
        const me = this,
        title = config;

        if (title) {
            config = {};
            Ext.applyIf(config, {
                itemId: 'title',
                html: title,
                cls: 'nav-title',
                $initParent: me
            });
        }
        return Ext.factory(config, Ext.Component, me.getTitleMsg());
    },
    updateTitleMsg(v) {
        var me = this;
        if(v) {
            if(me.getBackBtn()) {
                me.insert(1, v);
            } else {
                me.insert(0, v);
            }
        }
    }
});