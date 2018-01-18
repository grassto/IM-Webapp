/**
 * Mixin：使 list 自动高度
 * @author jiangwei
 */
Ext.define('MX.mixin.AutoHeightList', {
    extend: 'Ext.Mixin',

    mixinConfig: {
        id: 'autoheightlist',
        after: {
            updateStore: 'updateStore'
        }
    },

    updateStore(newStore, oldStore) {
        //console.log('AutoHeightList updateStore');
        var me = this,
            eventName = 'ajustHeight',
            listeners = {
                add: eventName,
                remove: eventName,
                update: eventName,
                clear: eventName,
                load: eventName,
                //refresh: eventName,
                scope: me
            };

        if (oldStore && Ext.isObject(oldStore) && !oldStore.destroying && !oldStore.destroye) {
            oldStore.unAfter(listeners);
        }

        if (newStore) {
            newStore.onAfter(listeners);
        }
    },

    ajustHeight() {
        //console.log('AutoHeightList ajustHeight');
        const me = this;

        if (!me.destroying && !me.destroyed) {
            const scrollable = me.getScrollable(),
                scrollEl = scrollable.getScrollElement(),
                height = scrollEl.dom.scrollHeight,
                extraHeight = me.getExtraHeight ? me.getExtraHeight() : 0;

            me.setHeight(height + extraHeight); //me.innerCt.getHeight()
        }
    }
});