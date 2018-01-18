Ext.define(null, { //'MX.override.grid.PagingToolbar'
    override: 'Ext.grid.PagingToolbar',

    config: {
        sliderField: {
            xtype: 'singlesliderfield',
            liveUpdate: false, // 取消 slider field 拖拽时实时更改值
            useTips: true,
            value: 1,
            flex: 1,
            minValue: 1
        }
    }
});
