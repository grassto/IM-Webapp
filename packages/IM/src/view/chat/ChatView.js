Ext.define('IM.view.chat.ChatView', {
    extend: 'IMCommon.view.MsgView',
    xtype: 'chatView',

    requires: [
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

    // store: {
    //     type: 'chatView'
    // },

    // 分页信息不能放在view上，应该放在store上
    // hasMore: true, // 分页
    // perPage: 0, // 分页

    // emptyText: '暂无会话',

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
            beforehide: 'on',
            scope: me
        });

        me.element.on({
            // delegate: '.x-dataview-item',
            contextmenu: 'onRightClick',
            scope: me
        });

        // 不能在store中加数据之后进行滚动条滚动（下拉加载数据）
        // me.getStore().on({
        //     add: 'onAddData',
        //     destroyable: true,
        //     scope: me
        // });

        // 添加滚动条事件
        // me.getScrollable().on('scroll', 'onChgScrl', me);

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

    onTapChild(me, location) {
        const record = location.record;
        if (!record) return;

        const e = location.event,
            t = Ext.fly(e.target),
            imgSelector = 'img.viewPic.loaded';

        if (t.is(imgSelector)) {

            var imgs = me.innerElement.dom.querySelectorAll(imgSelector),
                imgsData = [],
                initialIndex = -1;
            imgs.forEach((x, i) => {
                imgsData.push({
                    url: x.src,
                    original: x.getAttribute('data-original')
                });
                if(t.dom === x) {
                    initialIndex = i;
                }
            });
            if(window.cefMain) { // cef
                imgsData = JSON.stringify(imgsData);
                cefMain.viewImages(imgsData, initialIndex);
            }
            else if(Ext.browser.is.Cordova || !Ext.os.is.Desktop) { // 移动端 或者 cordova
                ImgMgr.showViewerOfDom(t.dom);
            }
            else { // web
                ImgUtil.viewImgs(me.innerElement.dom, {
                    initialIndex,
                    filter(image) {
                        return Ext.fly(image).is(imgSelector);
                    }
                });
            }
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
    },

    onChgScrl(scrol, x, y) {
        if(y == 0) { // 需要加载历史记录
            var view = this,
            store = view.getStore();

            // 是否有更多的会话
            if(view.hasMore) {
                view.perPage += 1;

                if(Config.isPC) {
                    // 直接从本地加载数据
                    var start = store.getData().length;
                    var bindLastMsg = function(trans, resultSet) {
                        var rows = resultSet.rows,
                            len = rows.length,
                            datas = [],
                            row = {};

                        if(len < 20) {
                            view.hasMore = false; // 标记没有更多
                        }

                        for (var i = 0; i < len; i++) {
                            row = rows.items(i);
                            switch (row.MsgType) {
                                case MsgType.TextMsg:
                                    datas.push({
                                        msg_id: row.MsgID,
                                        senderName: row.SenderName,
                                        sendText: row.Content,
                                        ROL: row.SenderID == User.ownerID ? 'right' : 'left',
                                        updateTime: new Date(row.CreateAt)
                                    });
                                    break;
                                case MsgType.ImgMsg:
                                    break;
                                case MsgType.FileMsg:
                                    break;
                                default:
                                    break;
                            }
                
                        }
    
                        store.insert(0, datas);
                    };
                    // 分页查出20条数据
                    LocalDataMgr.getHistory(bindLastMsg, start);
                } else { // web
                    // 加载20条记录
                    Utils.ajaxByZY('get', 'chats/' + User.crtChannelId + '/posts?perPage=' + view.perPage, {
                        success: function (data) {
                            if(data.length < 20) {
                                view.hasMore = false;
                            }

                            BindHelper.bindLastMsg(data, store);
                        }
                    });
                }
    
                ChatHelper.onScroll(view);
                ChatHelper.onShowChatTime(store);
            }
        }
    }
});