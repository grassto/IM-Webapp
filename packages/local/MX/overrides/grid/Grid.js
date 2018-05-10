/**
 * 易用性全局设置：桌面端可以鼠标选中文字
 */
Ext.define(null, { //'MX.override.grid.Grid'
    override: 'Ext.grid.Grid',

    platformConfig: {
        desktop: {
            userSelectable: 'text' //可以鼠标选择文字
        }
    },
    privates: {
        // 隐藏列头时，把列头透明度设为0
        updateHideHeaders(hideHeaders) {
            const me = this;
            me.callParent(arguments);

            if (me.isRendered) {
                const headerContainer = me.getHeaderContainer();
                headerContainer.el.setStyle({
                    opacity: hideHeaders ? 0 : null
                });
            }
        }
    }
});
