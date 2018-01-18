Ext.define('IM.view.chat.ChatInput', {
    extend: 'Ext.Container',
    xtype: 'chatInput',

    requires: [
        'IM.view.chat.editor.RichEditor'
    ],

    defaultListenerScope: true,

    config: {
        /**
         * @cfg {Boolean/Object} richTextArea
         * 配置评论输入框
         */
        richTextArea: true
    },

    // scrollable: {
    //     y: false
    // },

    layout: {
        type: 'vbox'
    },

    items: [{
        xtype: 'container',
        layout: {
            type: 'hbox',
            align: 'center'
        },
        items: [{
            xtype: 'button',
            ui: 'flat',
            iconCls: 'x-fa fa-smile-o',
            handler: 'showEmjPanel'
        }, {
            xtype: 'button',
            ui: 'flat',
            itemId: 'btnBrowse',
            iconCls: 'x-fa fa-file-image-o',
            preventDefaultAction: false
        }, {
            xtype: 'button',
            ui: 'flat',
            itemId: 'btnFile',
            iconCls: 'x-fa fa-folder',
            preventDefaultAction: false
        }, {
            xtype: 'button',
            ui: 'flat',
            iconCls: 'x-fa fa-check',
            handler: 'onReply'
        }, {
            xtype: 'button',
            ui: 'flat',
            iconCls: 'x-fa fa-cut'
        }, {
            xtype: 'button',
            ui: 'flat',
            iconCls: 'x-fa fa-star-o'
        }, {
            xtype: 'component',
            flex: 1
        }, {
            xtype: 'button',
            text: '消息记录'
        }]
    }, {
        xtype: 'richEditor',
        itemId: 'richEditor',
        flex: 1
    }],

    /**
    * 显示 emoji 面板
    * @param {Ext.Button} btn
    */
    showEmjPanel(btn) {
        let panel = Ext.getCmp('global-emojipanel');
        if (!panel) {
            panel = Ext.widget('emojipanel', {
                id: 'global-emojipanel'
            });
        }
        panel.on({
            ok: 'onChooseEmj',
            hide: 'onHideEmjPanel',
            scope: this
        });

        panel.showBy(btn, 'tl-bl?');
    },

    onChooseEmj(panel, ch) {
        // var index = window.minEmojiIdx(ch);
        // document.execCommand('insertHTML', false, '<span class="em emj' + index + '"></span>');
        this.down('#richEditor').insertObject(`<span class="em emj${window.minEmojiIdx(ch)}"></span>`, ch);
    },
    onHideEmjPanel(panel) {
        panel.un({
            ok: 'onChooseEmj',
            hide: 'onHideEmjPanel',
            scope: this
        });
    },

    /**
     * 回执按钮点击事件,btn.getPressed()判断是否按下
     */
    onReply(btn) {
        btn.toggle(true);
    }
});