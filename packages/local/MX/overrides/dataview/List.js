/**
 * 易用性全局设置：桌面端可以鼠标选中文字
 */
Ext.define(null, { //'MX.override.dataview.List'
    override: 'Ext.dataview.List',

    platformConfig: {
        desktop: {
            userSelectable: 'text' //可以鼠标选择文字
        }
    }
});
