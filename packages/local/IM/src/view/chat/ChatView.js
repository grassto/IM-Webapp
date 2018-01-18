Ext.define('IM.view.chat.ChatView', {
    extend: 'Ext.dataview.DataView',
    xtype: 'chatView',

    requires: [
        'IM.store.ChatView'
    ],

    store: {
        type: 'chatView',
        // model: 'IM.model.Chat'
    },

    initialize() {
        const me = this;
        me.callParent(arguments);

        me.on({
            childtap: 'onTapChild',
            scope: me
        });

        me.addStore();
    },

    itemTpl: '<div style="width:100%;color:#6f6a60;text-align:center;">{updateTime}</div>' +
    '<div class="evAvatar" style="float:{ROL};">' +
        '<a class="avatar link-avatar firstletter " letter="{[AvatarMgr.getFirstLetter(values.senderName)]} " style="float:{ROL};{[AvatarMgr.getColorStyle(values.senderName)]}">' +
        '</a>' +
    '</div>' +
        '<div style="overflow:hidden;text-align:{ROL};min-height:60px;">' +
        '<tpl if="values.ROL==\'right\'">' +
            '<div class="bubble">' +
        '<tpl else>' +
            '<div class="bubble" style="background-color:navajowhite">' +
        '</tpl>' +
                '<div class="plain">{sendText} <a class="viewPic"><img class="viewPic" src="{file}"/></a></div>' +
            '</div>' +
        '</div>' +
        ''
    ,

    onTapChild(me, location) {
        const record = location.record;
        if (!record) return;

        const e = location.event,
            t = Ext.fly(e.target);
        if (t.hasCls('viewPic')) {
            me.onPreviewAttach(record);
        }
    },

    onPreviewAttach(record) {
        var thumb = record.data.file.indexOf('thumbnail'),
        src = record.data.file.substring(0, thumb-1);
        // debugger;
        ImgUtil.viewImgs(src);
    },

    addStore() {
        var store = this.getStore();
    }
});