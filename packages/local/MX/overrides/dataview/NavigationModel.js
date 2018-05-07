/**
 * fix: 点击 list 的 item 的时候，跳来跳去的
 */
Ext.define(null, {
    override: 'Ext.dataview.NavigationModel',

    setLocation (location, options) {
        var me = this,
            view = me.getView(),
            oldLocation = me.location,
            animation = options && options.animation,
            scroller, child, record, itemContainer, childFloatStyle;
        if (location == null) {
            return me.clearLocation();
        }
        if (!location.isDataViewLocation) {
            location = this.createLocation(location);
        }



        if (!location.equals(oldLocation)) {
            record = location.record;
            child = location.child;

            if (record && !child) {

                return view.ensureVisible(record, {
                    animation: animation
                }).then(function () {
                    if (!me.destroyed) {
                        me.setLocation({
                            record: record,
                            column: location.column
                        }, options);
                    }
                });
            }


            if (child && me.floatingItems == null) {
                child = child.isComponent ? child.el : Ext.fly(child);
                itemContainer = child.up();
                childFloatStyle = child.getStyleValue('float');
                me.floatingItems = (view.getInline && view.getInline()) || child.isStyle('display', 'inline-block') || childFloatStyle === 'left' || childFloatStyle === 'right' || (itemContainer.isStyle('display', 'flex') && itemContainer.isStyle('flex-direction', 'row'));
            }


            scroller = view.getScrollable();
            if (scroller) {
                // 加个判断，点击时不跳
                if (!options || !options.event || options.event.type != 'tap' && options.event.type != 'focusenter') {
                    scroller.ensureVisible(location.sourceElement, {
                        animation: options && options.animation
                    });
                }
            }


            me.handleLocationChange(location, options);

            if (!me.destroyed) {
                me.doFocus();
            }
        }
    }
});