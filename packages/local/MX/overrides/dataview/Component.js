/**
 * bug fix: scrolldock bottom 的控件显示顺序和添加进去的顺序不一样
 *
 */
/*Ext.define(null, { //'MX.overrides.dataview.Component'
    override: 'Ext.dataview.Component',

    privates: {
        changeItemIsLast: function (options) {
            if (!options.isLastChanged) {
                return;
            }
            var me = this,
                item = options.item,
                itemClasses = options.itemClasses,
                lastCls = me.lastCls,
                items = me.scrollDockedItems,
                i, len;
            if (!(item.isLast = options.isLast)) {
                delete itemClasses[lastCls];
            } else {
                itemClasses[lastCls] = 1;
                if (items && !me.infinite) {

                    items = items.end.items;
                    len = items.length;
                    for (i = len - 1; i >= 0; i--) { // 原来for (i = 0; i < len; ++i)
                        items[i].renderElement.insertAfter(options.afterEl);
                    }
                }
            }
        }
    }
});*/