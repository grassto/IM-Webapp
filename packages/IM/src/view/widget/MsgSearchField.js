/**
 * 消息管理器搜索框，支持点击展开高级选项
 */
Ext.define('IM.view.widget.MsgSearchField', {
    extend: 'Ext.field.Text',
    xtype: 'IM_msgSearch_textfield',

    defaultListenerScope: true,

    ui: 'big',
    placeholder: '搜索',
    triggers: {
        add: {
            cls: '',
            // type: 'search',
            handler: 'onAdvancedSearch'
        }
    },
    errorTip: {
        anchor: true,
        align: 'bl-tl?',
        ui: 'tooltip invalid'
    },

    initialize() {
        const me = this;
        me.callParent(arguments);

        me.on({
            action: 'onSearchOk',
            // focus: 'onAdvancedSearch',
            hide: 'onHide',
            scope: me
        });
    },

    /**
     * 开始搜索
     */
    onSearchOk() {
        alert('开始搜索');
    },



    /**
     * 重新 align 位置
     */
    realignPanel() {
        const me = this,
            p = me.quickAddPanel;
        if (p && !p.getHidden()) {
            p.realign();
        }
    },

    onHide() {
        const me = this,
            p = me.quickAddPanel;
        if (p && !p.getHidden()) {
            p.hide();
        }
    },

    destroy() {
        const me = this;

        // 一定要 destroy，否则内存泄漏
        Ext.destroy(me.quickAddPanel);

        me.callParent();
    }
});