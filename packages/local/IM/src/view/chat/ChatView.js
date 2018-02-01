Ext.define('IM.view.chat.ChatView', {
    extend: 'Ext.List',
    xtype: 'chatView',

    requires: [
        'IM.store.ChatView',
        'IM.view.widget.RightClickMenu',
        'IM.model.viewModel.ChatViewDetail'
    ],

    viewModel: {
        type: 'chatView_detail'
    },

    store: {
        type: 'chatView'
    },

    itemsFocusable: false,

    classCls: 'chatVeiw-list',

    hoveredCls: 'hovered', // 去掉鼠标悬浮的背景色样式

    selectable: false,

    itemContentCls: 'fullwidth',

    initialize() {
        const me = this;
        me.callParent(arguments);

        me.on({
            childtap: 'onTapChild',
            scope: me
        });

        me.element.on({
            // delegate: '.x-dataview-item',
            contextmenu: 'onRightClick',
            scope: me
        });

    },

    onRightClick(e) {
        var menu = Ext.create('IM.view.widget.RightClickMenu');
        menu.showAt(e.getPoint());
        e.preventDefault();
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
            this.setHisDetails(record);
            this.showMoreAboutHim(location.sourceElement);
        }
    },

    // onPreviewAttach(record) {
    //     var thumb = record.data.file.indexOf('thumbnail'),
    //     src = record.data.file.substring(0, thumb-1);
    //     // debugger;
    //     ImgUtil.viewImgs(src);
    // },

    setHisDetails(record) {
        var viewmodel = this.getViewModel();
        viewmodel.set('nickName', record.data.senderName);
    },

    /**
     * 点击头像展示详细信息
     */
    showMoreAboutHim(field) {
        // debugger;
        const panel = this.getAvatarDetailPanel();
        // if (!panel.isHidden()) {
        //     panel.hide();
        // } else {
            if (panel.getParent() !== Ext.Viewport) {
                Ext.Viewport.add(panel);
            }
            // bug，直接 showBy 有时候不显示，所以加下面2行
            panel._hidden = true;
            panel.setHidden(false);

            panel.showBy(field, 'tl-bl?');
        // }
    },

    getAvatarDetailPanel() {
        const me = this;
        if (!me.detailPanel) {
            me.detailPanel = Ext.widget('avatarDetail', {
                ownerCmp: me,
                listeners: {
                    show(p) {
                        me.setAvaDetail(p);
                    },
                    hide(p) {
                        // p.reset();
                        if (p.getParent() === Ext.Viewport) {
                            Ext.Viewport.remove(p, false);
                        }
                        // me.setRequired(false);
                        // me.blur();
                    },
                    // ok: 'onSearchOk', // 自定义监听函数
                    scope: me
                }
            });
        }

        return me.detailPanel;
    },

    setAvaDetail(p, html) {
        // p.setHtml(this.getViewModel().get('chatView_detail_html'));
        p.setHtml(html);
    },

    destory() {
        Ext.destroy(this.detailPanel);
        this.callParent();
    }
});