/**
 * emoji 表情弹出 panel
 * @author jiangwei
 */
Ext.define('Common.field.comment.EmojiPanel', {
    extend: 'Ext.Panel',

    xtype: 'emojipanel',

    statics: {
        emojis: ['😄', '😃', '😀', '😊', '☺', '😉', '😍', '😘', '😚', '😗', '😙', '😜', '😝', '😛', '😳', '😁', '😔', '😌', '😒', '😞', '😣', '😢', '😂', '😭', '😪', '😥', '😰', '😅', '😓', '😩', '😫', '😨', '😱', '😠', '😡', '😤', '😖', '😆', '😋', '😷', '😎', '😴', '😵', '😲', '😟', '😦', '😧', '😈', '👿', '😮', '😬', '😐', '😕', '😯', '😶', '😇', '😏', '😑', '👲', '👳', '👮', '👷', '💂', '👶', '👦', '👧', '👨', '👩', '👴', '👵', '👱', '👼', '👸', '😺', '😸', '😻', '😽', '😼', '🙀', '😿', '😹', '😾', '👹', '👺', '🙈', '🙉', '🙊', '💀', '💩', '🔥', '💦', '💧', '💤', '💨', '👂', '👀', '👃', '👅', '👄', '👍', '👎', '👌', '👊', '✊', '✌', '👋', '✋', '👐', '👆', '👇', '👉', '👈', '🙌', '🙏', '☝', '👏', '💪', '🚶', '🏃', '💼', '👜', '👓', '🌂', '💛', '💙', '💜', '💚', '❤', '💔']
    },

    cls: 'emj-panel',

    width: 381,
    maxWidth: '100%',
    height: 300,
    maxHeight: '130px',
    floated: true,
    bodyPadding: 15,
    hidden: true,

    //anchor: true,

    scrollable: false,

    tpl: [
        '<ul class="faces">',
        '<tpl for=".">',
        '<li>',
        '<span data-value="{ch}" class="em emj{idx}"></span>',
        '</li>',
        '</tpl>',
        '</ul>',
        '<div style="clear:both"></div>'
    ].join(''),

    initialize() {
        const me = this,
            data = me.self.emojis.map(x => {
                return {
                    idx: window.minEmojiIdx(x),
                    ch: x
                };
            });
        me.callParent(arguments);

        me.setData(data);

        me.element.on({
            delegate: 'span.em',
            tap: 'onTapEmj',
            scope: me
        });

        me.on({
            show: 'onShowPanel',
            hide: 'onHidePanel',
            scope: me
        });
    },

    onTapEmj(e, el) {
        const ch = el.getAttribute('data-value');
        this.fireEvent('ok', this, ch);
        this.hide();
    },

    onShowPanel(p) {
        const me = this;
        me.touchListeners = Ext.getDoc().on({
            //translate: false,
            touchstart: me.collapseIf,
            scope: me,
            delegated: false,
            destroyable: true
        });
    },
    collapseIf(e) {
        const me = this;

        if (!me.destroyed && !me.owns(e.target)) {
            me.hide();
        }
    },

    onHidePanel(p) {
        Ext.destroy(this.touchListeners);
    },

    doDestroy() {
        Ext.destroy(this.touchListeners);
        this.callParent();
    }
});