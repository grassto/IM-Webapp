/**
 * 去除navigationBar时，fix出现的bug
 */
Ext.define(null, {
    override: 'Ext.NavigationView',

    privates: {
        beforePop(count) {
            var me = this,
                innerItems = me.getInnerItems(),
                last, i, ln, toRemove;

            if (Ext.isString(count) || Ext.isObject(count)) {
                last = innerItems.length - 1;

                for (i = last; i >= 0; i--) {
                    if ((Ext.isString(count) && Ext.ComponentQuery.is(innerItems[i], count)) || (Ext.isObject(count) && count == innerItems[i])) {
                        count = last - i;
                        break;
                    }
                }

                if (!Ext.isNumber(count)) {
                    return false;
                }
            }

            ln = innerItems.length;

            //default to 1 pop
            if (!Ext.isNumber(count) || count < 1) {
                count = 1;
            }

            //check if we are trying to remove more items than we have
            count = Math.min(count, ln - 1);

            if (count) {
                //we need to reset the backButtonStack in the navigation bar
                if (me.getNavigationBar()) {
                    me.getNavigationBar().beforePop(count);
                }

                //get the items we need to remove from the view and remove theme
                toRemove = innerItems.splice(-count, count - 1);
                for (i = 0; i < toRemove.length; i++) {
                    this.remove(toRemove[i]);
                }

                return true;
            }

            return false;
        },
        doResetActiveItem: function (innerIndex) {
            var me = this,
                innerItems = me.getInnerItems(),
                animation = me.getLayout().getAnimation();

            if (innerIndex > 0) {
                if (animation && animation.isAnimation) {
                    animation.setReverse(true);
                }
                me.setActiveItem(innerIndex - 1);
                if(me.getNavigationBar()) {
                    me.getNavigationBar().onViewRemove(me, innerItems[innerIndex], innerIndex);
                }
            }
        }
    }
});