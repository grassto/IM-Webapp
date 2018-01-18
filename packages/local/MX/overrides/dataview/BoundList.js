/**
 * 默认去除 tools，提升性能
 */
Ext.define(null, { //'MX.override.dataview.BoundList'
    override: 'Ext.dataview.BoundList',

    config: {
        itemConfig: {
            cls: Ext.baseCSSPrefix + 'boundlistitem',
            tools: null
        }
    }
});
