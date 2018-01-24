Ext.define('IM.view.chat.ChatView', {
    extend: 'Ext.dataview.DataView',
    xtype: 'chatView',

    requires: [
        'IM.store.ChatView'
    ],

    store: {
        type: 'chatView'
    },

    initialize() {
        const me = this;
        me.callParent(arguments);

        me.on({
            childtap: 'onTapChild',
            scope: me
        });

        // me.addStore();
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
        // '<div class="plain">{sendText} <a class="viewPic"><img class="viewPic" src="{file}"/></a></div>' +
        '<div class="plain">{sendText}' +
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
            var thumbSrc = t.dom.src;
            // 请求原图浏览
            ImgUtil.viewImgs(thumbSrc.substring(0, thumbSrc.indexOf('thumbnail')-1));
            // me.onPreviewAttach(record);
        }
        if(t.hasCls('avatar')) {
            this.showMoreAboutHim();
        }
    },

    // onPreviewAttach(record) {
    //     var thumb = record.data.file.indexOf('thumbnail'),
    //     src = record.data.file.substring(0, thumb-1);
    //     // debugger;
    //     ImgUtil.viewImgs(src);
    // },

    onPreviewAttach(record) {
        var thumb = record.data.sendText,
            img = thumb.replace(/\<img[^\>]*src="([^"]*)"[^\>]*\>/g, '<img src="$1">'),
            html = $(img);
        for (var i = 0; i < html.length; i++) {
            if(html[i].nodeName == 'IMG') {
                
            }
        }
        // ImgUtil.viewImgs(src);
    },

    showMoreAboutHim() {
        alert(432);
    },

    addStore() {
        var store = this.getStore();
    }
});