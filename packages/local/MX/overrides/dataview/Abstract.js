/**
 * bug fix: 点击 带有 listpagging 的 空列表，会报异常
 * https://www.sencha.com/forum/showthread.php?468680-6-5-Modern-Empty-List-with-listpagging-plugin-throws-an-error-when-click-it
 *
 * bug fix: emptyText 导致 listpaging 组件，显示在了 list items 上方
 * https://www.sencha.com/forum/showthread.php?469014-6-5-2-Modern-EmptyTextCmp-causes-listpaging-cmp-positioning-above-list-items&p=1315275#post1315275
 */
Ext.define(null, { //'MX.overrides.dataview.Abstract'
    override: 'Ext.dataview.Abstract',

    onInnerFocusEnter: function (e) {
        var me = this,
            navigationModel = me.getNavigationModel(),
            focusPosition, itemCount;

        if (navigationModel.lastLocation === 'scrollbar') {
            if (e.relatedTarget) {
                e.relatedTarget.focus();
            }
            return;
        }

        if (e.target === me.getFocusEl().dom) {
            focusPosition = me.restoreFocus && navigationModel.getPreviousLocation();
            if (focusPosition) {

                focusPosition = focusPosition.refresh();
            } else if (e.backwards) {
                focusPosition = me.getLastDataItem();
            } else {
                focusPosition = me.getFirstDataItem();
            }

            if (!focusPosition) return; // add this line
        } else {
            focusPosition = e;
        }

        me.toggleChildrenTabbability(false);
        itemCount = me.getFastItems().length;

        if (itemCount) {

            if (focusPosition.isWidget) {
                focusPosition = focusPosition.getFocusEl() || focusPosition.el;
            }

            navigationModel.setLocation(focusPosition, {
                event: e,
                navigate: false
            });
        }

        if (navigationModel.getLocation()) {
            me.el.dom.setAttribute('tabIndex', -1);
        }
    },

    privates: {
        findTailItem(rawElements) {
            var me = this,
                items = rawElements ? me.innerItems : me.items.items,
                at = -1,
                tail = null,
                i, item, scrollDock;
            for (i = 0; i < items.length; i++) { // for (i = items.length; i-- > 0;) {
                item = items[i];
                if (!item.isEmptyText) { // add this line
                    scrollDock = item.scrollDock;
                    if (scrollDock === 'end') {
                        tail = items[at = i];
                    }
                    /*else {
                        break;
                    }*/
                }
            }

            return rawElements ? tail : at;
        }
    }
});