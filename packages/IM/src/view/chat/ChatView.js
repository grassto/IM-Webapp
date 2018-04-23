Ext.define('IM.view.chat.ChatView', {
    extend: 'Ext.List',
    xtype: 'chatView',

    requires: [
        'IM.store.ChatView',
        'IM.view.widget.RightClickMenu',
        'IM.model.viewModel.ChatViewDetail'
    ],

    uses: [
        'IM.view.chat.AvatarDetailPanel',
        'MX.util.ImgUtil'
    ],

    viewModel: {
        type: 'chatView_detail'
    },

    store: {
        type: 'chatView'
    },

    // emptyText: '暂无会话',

    itemsFocusable: false,
    selectable: false,

    classCls: 'chatVeiw-list',

    hoveredCls: 'hovered', // 去掉鼠标悬浮的背景色样式

    // items: [{
    //     xtype: 'button',
    //     scrollDock: 'start',
    //     text: 'Load More...'
    // }],

    // itemContentCls: 'fullwidth',

    initialize() {
        const me = this;
        me.callParent(arguments);

        me.on({
            childtap: 'onTapChild',
            // focus : 'onFocus',
            scope: me
        });

        me.element.on({
            // delegate: '.x-dataview-item',
            contextmenu: 'onRightClick',
            scope: me
        });

        me.getStore().on({
            add: 'onAddData',
            destroyable: true,
            scope: me
        });

    },

    // store添加数据后调用，统一的滚动条操作和时间的展示在这儿做
    onAddData() {
        const me = this,
        store = me.getStore();
        ChatHelper.onScroll(me);

        ChatHelper.onShowChatTime(store);
    },

    /**
     * 右击事件
     * @param {Event} e 事件
     */
    onRightClick(e) {
        const t = Ext.fly(e.target);
        if (t.hasCls('plain') || t.hasCls('viewPic')) {
            var menu = Ext.create('IM.view.widget.RightClickMenu');
            menu.showAt(e.getPoint());
        }
        e.preventDefault(); // 取消默认事件
    },

    itemTpl: '<tpl if="values.showTime">' + // 一分钟内时间不重复展示
        '<div style="width:100%;color:#6f6a60;text-align:center;margin-bottom:10px;">{updateTime}</div>' +
        '</tpl>' +
        '<tpl if="values.showGrpChange">' + // 展示多人会话提示信息
            '<div class="grpChangeNote">{GrpChangeMsg}</div>' +
        '<tpl else>' + // 正常的消息
            '<tpl if="values.ROL!==\'right\'">' + // 头像是否展示
                '<div class="evAvatar" style="float:{ROL};">' +
                '<a class="avatar link-avatar firstletter " letter="{[AvatarMgr.getFirstLetter(values.senderName)]} " style="margin:0;float:{ROL};{[AvatarMgr.getColorStyle(values.senderName)]}">' +
                '</a>' +
                '</div>' +
            '</tpl>' +
            '<div style="text-align:{ROL};/*min-height:60px;overflow:hidden;*/">' +
                '<tpl if="values.ROL==\'right\'">' +// 自己的，
                '<div class="bubble">' +
                '<tpl else>' + // 他人的
                '<div class="bubble" style="background-color:navajowhite">' +
                '</tpl>' +
                    '<div class="plain">' +
                    '<tpl if="values.msg_type==\'F\'">' + // file展示
                        '<div class="fileMsg">' +
                            '<div class="fileWrapper">' +
                                '<div class="fileIcon"></div>' +
                                '<div class="fileName">{fileName}</div>' +
                                '<div>{fileSize:fileSize}</div>' +
                            '</div>' +
                            '<div>' + // 分为两块
                                '<tpl if="values.fileStatus == 1">' +
                                    '<div class="fileProgress">' +
                                        '<div style="width:{fileProgress}%;" class="fileLoaded">{fileProgress}%</div>' +
                                    '</div>' +
                                    '<div class="fileClose">取消</div>' +
                                '<tpl elseif="values.fileStatus == 2">' +
                                    // '<p class="fileDone">上传成功</p>' +
                                    // '<a class="fileDone">预览</a>' + // 之后支持
                                    '<a class="fileDone" target="_blank" href="{[ParseHelper.appendFilePrefix(values.file_id)]}">下载</a>' +
                                '<tpl elseif="values.fileStatus == 3">' +
                                    '<div class="fileDone">上传失败</div>' +
                                '</tpl>' +
                            '</div>' +
                        '</div>' +
                    '<tpl else>' + // 文本或图片，直接拼好过来
                        '{sendText}' +
                    '</tpl>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</tpl>'
    ,

    onTapChild(me, location) {
        const record = location.record;
        if (!record) return;

        const e = location.event,
            t = Ext.fly(e.target);
        if (t.hasCls('viewPic')) {
            var thumbSrc = t.dom.src;
            // 请求原图浏览
            ImgUtil.viewImgs(thumbSrc.substring(0, thumbSrc.indexOf('thumbnail') - 1));
        }
        if (t.hasCls('avatar')) {
            this.setHisDetails(record);
            this.showMoreAboutHim(location.sourceElement, record);
            e.stopPropagation(); // 防止事件冒泡，会调用到document的tap事件
        }
        if(t.hasCls('fileClose')) {
            record.get('ajax').abort();
            this.getStore().remove(record);
        }
    },

    setHisDetails(record) {
        var viewmodel = this.getViewModel();
        viewmodel.set('nickName', record.data.senderName);
    },

    /**
     * 点击头像展示详细信息
     */
    showMoreAboutHim(field, record) {
        const panel = this.getAvatarDetailPanel(record);
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

    getAvatarDetailPanel(record) {
        const me = this;
        if (!me.detailPanel) {
            me.detailPanel = Ext.widget('avatarDetail', {
                ownerCmp: me,
                listeners: {
                    show(p) {
                        me.setAvaDetail(p, record);
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

    setAvaDetail(p, record) {
        p.setHtml(this.getDetailHtml(record));
        // p.setHtml(html);
    },


    getDetailHtml(record) {
        // 之后可以直接使用record中的值来赋值
        // viewModel的formulas会慢一步，所以在此自己拼凑
        var viewModel = this.getViewModel();
        var html = [
            '<div style="font-size: 20px;">',
            '<div class="sendToName">' + viewModel.get('nickName') + '</div>',
            // '<div class="phone">座机：' + viewModel.get('phone') + '</div>',
            '<div class="mobile">手机：' + viewModel.get('mobile') + '</div>',
            '<div class="eMail">邮箱：' + viewModel.get('eMail') + '</div>',
            '<div class="department">部门：' + viewModel.get('department') + '</div>',
            '</div>'
        ].join('');
        return html;
    },

    destory() {
        Ext.destroy(this.detailPanel);
        this.callParent(arguments);
    }
});