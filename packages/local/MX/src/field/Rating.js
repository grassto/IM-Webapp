/**
 * 打分 Field 控件
 */
Ext.define('MX.field.Rating', {
    extend: 'Ext.field.Field',
    xtype: 'mx_ratingfield',

    config: {
        readOnly: false
    },

    classCls: `${Ext.baseCSSPrefix}ratingfield`,

    /**
     * @cfg {Object} scope
     * The scope to execute the {@link #renderer} function. Defaults to `this` component.
     */

    initialize() {
        var me = this;
        me.callParent();

        me.inputElement.on({
            touchstart: 'onTouchStart',
            touchmove: 'onTouchMove',
            touchend: 'onTouchEnd',
            scope: me
        });

        me.syncDom();
    },

    /**
     * @private
     */
    getBodyTemplate() {

        return [{
            reference: 'inputElement',
            cls: `${Ext.baseCSSPrefix}input-el x-layout-box`,
            children: [{
                cls: 'rating-star star1 flex1'
            }, {
                cls: 'rating-star star2 flex1'
            }, {
                cls: 'rating-star star3 flex1'
            }, {
                cls: 'rating-star star4 flex1'
            }, {
                cls: 'rating-star star5 flex1'
            }]
        }];
    },

    applyValue(value) {
        if (value < 0) {
            value = 0;
        } else if (value > 5) {
            value = 5;
        }

        return value;
    },

    updateValue(newValue, oldValue) {
        this.callParent([newValue, oldValue]);
        this.syncDom();
    },

    onTouchStart(e) {
        const me = this;
        if (!e.changedTouches || me.getDisabled() || me.getReadOnly()) {
            return false;
        }

        const touch = e.event;
        me.inputElOffsets = me.innerElement.getOffsetsTo(document.body);
        me.startX = touch.pageX;
        me.startY = touch.pageY;
    },
    onTouchMove(e) {
        const me = this;
        if (!e.changedTouches || me.getDisabled() || me.getReadOnly()) {
            return false;
        }

        const touch = e.event,
            x = touch.pageX,
            y = touch.pageY,
            absDeltaX = Math.abs(x - me.startX),
            absDeltaY = Math.abs(y - me.startY);

        if (absDeltaY < absDeltaX) {
            const offsets = me.inputElOffsets;
            if (offsets) {
                me.buildRating(e.pageX - offsets[0]);
            }
        } else {
            me.touchCancel = true;

            return false;
        }
    },
    onTouchEnd(e) {
        const me = this;
        if (!e.changedTouches || me.getDisabled() || me.getReadOnly() || me.touchCancel) {
            delete me.touchCancel;

            return false;
        }
        const offsets = me.inputElOffsets;
        if (offsets) {
            me.buildRating(e.pageX - offsets[0]);
        }
        const value = me.getValue();
        if (me.orignalValue != value) {
            me.orignalValue = value;
            me.fireEvent('change', me, value, me.orignalValue);
        }
        delete me.startX;
        delete me.startY;
        delete me.inputElOffsets;
    },

    privates: {
        syncDom() {
            const me = this;

            if (!me.isConfiguring) {
                const value = me.getValue();

                const el = me.inputElement;
                if (!el.down('.star1')) {
                    return;
                }
                let i;
                for (i = 1; i <= 5; i++) {
                    el.down(`.star${i}`).removeCls('active');
                }
                for (i = 1; i <= value; i++) {
                    el.down(`.star${i}`).addCls('active');
                }
            }
        },

        buildRating(delta) {
            const me = this,
                width = me.inputElement.getWidth();

            if (delta >= width) {
                delta = width;
            } else if (delta <= 0) {
                delta = 0;
            }
            delta = delta / width * 100;
            var onePart = width / 12 / width * 100;
            var rating = 0;
            if (delta >= onePart * 9) {
                rating = 5;
            } else if (delta >= onePart * 7) {
                rating = 4;
            } else if (delta >= onePart * 5) {
                rating = 3;
            } else if (delta >= onePart * 3) {
                rating = 2;
            } else if (delta >= onePart) {
                rating = 1;
            }
            this.setValue(rating);

            return delta;
        }
    }
});