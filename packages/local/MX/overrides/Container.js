/**
 * 给 container 增加 destroyOnHide
 */
Ext.define(null, {
    override: 'Ext.Container',

    destroyOnHide: false,

    initialize: function () {
        var me = this;
        me.callParent(arguments);

        me.onAfter({
            hide: 'onAfterHide',
            scope: me
        });
    },

    onAfterHide: function () {
        if (this.destroyOnHide) {
            this.destroy();
        }
    }
});