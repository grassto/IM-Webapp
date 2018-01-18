/**
 * 圆形浮动按钮 继承自Button
 * 仿 Google Material Design
 */
Ext.define('MX.FABButton', {
    extend: 'Ext.Button',
    xtype: 'fabbutton',
    classCls: 'fab-button',

    bottom: 24,
    right: 24,
    width: 52,
    height: 52,

    focusable: false,

    draggable: {
        constrain: {
            element: true
        }
    },

    circularProgressCls: 'circular-progress circular-fabprogress',

    initialize() {
        const me = this;
        me.callParent(arguments);

        me.addCls('not-backable');

        var draggable = me.getDraggable();
        if (draggable) {
            draggable.on({
                dragstart: 'onDragStart',
                scope: me
            });
        }
    },

    onDragStart(draggable, info, e) {
        e.stopPropagation();
    }
});