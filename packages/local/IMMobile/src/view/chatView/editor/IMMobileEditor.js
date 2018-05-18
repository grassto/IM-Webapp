Ext.define('IMMobile.view.chatView.editor.IMMobileEditor', {
    extend: 'Ext.Container',
    xtype: 'IMMobile-Editor',

    requires: [
        'IMCommon.view.RichEditor'
    ],

    uses: [
        'IMMobile.view.chatView.editor.menu.More',
        'IMMobile.view.chatView.editor.emoji.Carousel'
    ],

    defaultListenerScope: true,

    layout: {
        type: 'card'
    },

    cls: 'chat-editor',

    items: [{
        xtype: 'toolbar',
        docked: 'top',
        layout: {
            type: 'hbox',
            align: 'end'
        },
        items: [{
            iconCls: 'x-fa fa-plus',
            handler: 'onTapShowMore'
        }, {
            xtype: 'imCommonEditor',
            itemId: 'MobileEditor',
            errorTarget: null,
            flex: 1
        }, {
            iconCls: 'x-fa fa-smile-o',
            handler: 'onTapShowEmj'
        }, {
            xtype: 'button',
            itemId: 'sendBtn',
            text: '发送',
            ui: 'action',
            listeners: {
                tap: 'onSendMsg'
            }
        }]
    }, {
        xtype: 'editor_more_menu',
        data: [{
            value: 'camera',
            text: '拍照',
            iconCls: 'x-fa fa-camera',
            backColor: '#00AEED'
        }, {
            value: 'images',
            text: '图片',
            iconCls: 'x-fa fa-image',
            backColor: '#F58B41'
        }, {
            value: 'files',
            text: '文件',
            iconCls: 'x-fa fa-file',
            backColor: '#F58B41'
        }],
        listeners: {
            tapmenu: 'onTapMenuItem'
        }
    }, {
        xtype: 'emj_carousel'
    }],

    initialize() {
        const me = this;
        me.callParent(arguments);

        // 监听 点击表情事件
        const emjCarousel = me.down('emj_carousel');
        emjCarousel.element.on({
            delegate: 'td',
            tap: 'onChooseEmj',
            scope: me
        });

        // 监听键盘弹出事件，键盘弹出时，要隐藏 表情面板 和 更多功能 面板
        if (Ext.browser.is.Cordova) {
            var fn = Ext.bind(me.onKeyBoardShow, me),
                eventName = 'keyboardDidShow';

            window.addEventListener(eventName, fn, false);
            me.on({
                destroy() {
                    window.removeEventListener(eventName, fn, false);
                },
                scope: me
            });
        }

        // 表情面板 和 更多功能面板 的高度
        var barBodyH = parseInt(Math.min(window.innerHeight, window.innerWidth) * 9 / 16, 10);
        me.bodyElement.setHeight(barBodyH);
        me.bodyElement.hide();
    },

    /**
     * 隐藏 表情面板 和 更多功能 面板
     * @param {Event} event
     */
    onKeyBoardShow(event) {
        this.bodyElement.hide();
    },

    /**
     * 点击 表情 按钮时，切换显示/隐藏表情面板
     * 显示表情面板时，要隐藏弹出来的键盘
     * @param {Ext.Button} btn
     */
    onTapShowEmj(btn) {
        const me = this;

        if (me.bodyElement.getStyle('display') == 'none' // 如果已经隐藏了，要显示
            ||
            me.innerItems.indexOf(me.getActiveItem()) != 1) { // 如果活动页不是表情面板 而是 更多功能面板，就切换到表情面板
            // 隐藏键盘
            if (window.Keyboard && Keyboard.hide) {
                Keyboard.hide();
            }

            setTimeout(function () {
                me.bodyElement.show();
            }, 30);
            me.setActiveItem(1);
        } else { // 如果原本显示的，要隐藏
            me.bodyElement.hide();
        }
    },
    onChooseEmj(e) {
        var t = Ext.fly(e.target),
            field = this.down('#MobileEditor');
        if (t.hasCls('emj')) {
            var ch = e.target.textContent;
            // field.insertText(ch);
            field.insertObject(`<span class="em emj${window.minEmojiIdx(ch)}"></span>`, ch);
            /* if (Ext.os.is.Android44) {
                field.insertText('\u200B');
            }*/
        } else if (t.hasCls('backspace')) {
            field.simulateBackspace();
        }
        e.stopEvent();
        e.preventDefault();
    },

    onTapShowMore(btn) {
        const me = this;

        if (me.bodyElement.getStyle('display') == 'none' // 如果已经隐藏了，要显示
            ||
            me.innerItems.indexOf(me.getActiveItem()) != 0) { // 如果活动页不是功能面板 而是 更多功能面板，就切换到功能面板
            if (window.Keyboard && Keyboard.hide) {
                Keyboard.hide();
            }

            setTimeout(function () {
                me.bodyElement.show();
            }, 30);
            me.setActiveItem(0);
        } else { // 如果原本显示的，要隐藏
            me.bodyElement.hide();
        }
    },

    onTapMenuItem(menu, action, node) {
        if (Ext.browser.is.Cordova) {
            if (action == 'camera') {
                ImgMgr.takePhoto().then(result => {
                    // TODO 上传图片
                }).catch(err => {
                    Utils.toastShort(err);
                });
            } else if (action == 'images') {
                ImgMgr.chooseImages().then(result => {
                    // TODO 上传图片
                }).catch(err => {
                    Utils.toastShort(err);
                });
            } else if (action == 'files') {
                FileMgr.chooseFiles().then(result => {
                    // TODO 上传文件
                }).catch(err => {
                    Utils.toastShort(err);
                });
            }
        }
    },

    // 表情、文本发送
    onSendMsg() {
        const me = this,
            editor = me.down('#MobileEditor'),
            chatView = me.up('IMMobile-chatView').down('#IMMobileChatView'),
            chatViewStore = chatView.getStore();

        var text = editor.getSubmitValue();
        text = window.minEmoji(text);

        if (text) {
            var message = {
                base_message: {
                    chat_id: User.crtChannelId,
                    message: text
                }
            };

            // 最近会话最后发送时间更新，方便排序
            var recChatStore = Ext.Viewport.lookup('IMMobile').down('#navView').down('IMMobile-Chat').down('#ChatList').getStore();
            recChatStore.getById(User.crtChannelId).set('last_post_at', new Date());

            // 给正在发送的圈圈
            chatViewStore.add({
                senderName: User.crtUser.user_name,
                sendText: text,
                ROL: 'right',
                updateTime: new Date()
            });
            Utils.ajaxByZY('post', 'posts', {
                params: JSON.stringify(message),
                success(data) {
                    console.log('发送成功', data);
                    // 去除圈圈
                },
                failure(data) {
                    // 处理发送失败
                    alert('发送失败');
                }
            });

            editor.clear();
        }
    }
});