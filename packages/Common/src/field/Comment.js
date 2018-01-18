/**
 * 评论框，带有表情、图片和评论发送按钮
 * @author jiangwei
 */
Ext.define('Common.field.Comment', {
    extend: 'Ext.Container',
    requires: [
        'Common.field.comment.RichTextArea',
        'Common.field.comment.ImgUpDataView'
    ],
    uses: [
        'Common.field.comment.EmojiPanel'
    ],
    xtype: 'commentfield',

    defaultListenerScope: true,

    config: {
        /**
         * @cfg {Boolean} readOnly
         * 配置评论输入框 和 评论按钮的 只读/禁用
         */
        readOnly: null,

        /**
         * @cfg {Boolean/String/Object} cancelButton
         * 配置是否显示取消按钮
         */
        cancelButton: null,

        /**
         * @cfg {Boolean/Object} richTextArea
         * 配置评论输入框
         */
        richTextArea: true
    },

    layout: {
        type: 'hbox',
        align: 'center'
    },

    scrollable: {
        y: false
    },

    items: [{
        xtype: 'button',
        ui: 'flat',
        //tooltip: '表情',
        iconCls: 'x-fa fa-smile-o',
        handler: 'showEmjPanel'
    }, {
        xtype: 'button',
        itemId: 'btnBrowse',
        ui: 'flat',
        //tooltip: '图片',
        iconCls: 'i-common-image',
        preventDefaultAction: false
    }, {
        xtype: 'component',
        flex: 1
    }, {
        xtype: 'button',
        itemId: 'btnPost',
        ui: 'action',
        text: '评论',
        handler: 'onTapPostCmt'
    }, {
        xtype: 'comment_imgupdataview',
        itemId: 'imgUpDV',
        margin: '5 0 0',
        docked: 'bottom'
    }],

    applyRichTextArea(config) {
        if (config) {
            if (Ext.isBoolean(config)) {
                config = {};
            }

            Ext.applyIf(config, {
                margin: '5 0',
                docked: 'top'
            });
        }

        return Ext.factory(config, 'Common.field.comment.RichTextArea', this.getRichTextArea());
    },
    updateRichTextArea(ta, oldTa) {
        if(oldTa) {
            oldTa.destroy();
        }
        if(ta) {
            this.insert(0, ta);
        }
    },

    applyCancelButton(config) {
        if (config) {
            if (Ext.isBoolean(config)) {
                config = {};
            }

            if (typeof config == 'string') {
                config = {
                    text: config
                };
            }

            Ext.applyIf(config, {
                ui: 'flat',
                text: '取消'
            });
        }

        return Ext.factory(config, 'Ext.Button', this.getCancelButton());
    },
    updateCancelButton(btn, oldBtn) {
        if(oldBtn) {
            oldBtn.destroy();
        }
        if(btn) {
            this.insertBefore(btn, this.down('#btnPost'));
        }
    },

    updateReadOnly(readOnly) {
        const me = this;

        me.getRichTextArea().setReadOnly(readOnly);
        me.query('button').forEach(x => x.setDisabled(readOnly));
    },

    initialize() {
        const me = this;
        me.callParent(arguments);

        const btnBrowse = me.down('#btnBrowse'),
            imgUpDV = me.down('#imgUpDV');

        imgUpDV.initUploader(btnBrowse);
    },

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

    /**
     * 选择了一个 emoji
     * @param {Common.field.comment.EmojiPanel} panel emoji 面板
     * @param {String} ch emoji 字符
     */
    onChooseEmj(panel, ch) {
        //this.getRichTextArea().insertText(ch);
        this.getRichTextArea().insertObject(`<span class="em emj${window.minEmojiIdx(ch)}"></span>`, ch);
    },

    /**
     * 隐藏 emoji 面板
     * @param {Common.field.comment.EmojiPanel} panel
     */
    onHideEmjPanel(panel) {
        panel.un({
            ok: 'onChooseEmj',
            hide: 'onHideEmjPanel',
            scope: this
        });
    },

    /**
     * 点击 评论 按钮
     * 有图片就先上传图片，然后提交评论
     * 否则直接提交评论
     * @param {Ext.Button} btn
     */
    onTapPostCmt(btn) {
        const me = this,
            dv = me.down('comment_imgupdataview');

        if (dv.isAllDone()) {
            me.doPostCmt();
        } else {
            dv.startUpload();
            me.setReadOnly(true);

            dv.on({
                uploadcomplete: 'doPostCmt',
                scope: me
            });
        }
    },

    /**
     * 直接提交评论
     */
    doPostCmt() {
        const me = this;
        me.setReadOnly(false);

        const dv = me.down('comment_imgupdataview');
        if (dv.hasFailed()) {
            Utils.toastShort('有上传失败的图片, 请处理后再提交');

            return;
        }

        const ta = me.getRichTextArea(),
            html = ta.getSubmitValue(),
            text = Utils.htmlToText(html),
            atts = dv.getAllDoneFilesData();
        if (Ext.isEmpty(text) && atts.Images.length == 0) {
            return;
        }

        const embValues = ta.getEmbeddedValues(),
            mentions = [];

        let mention;
        embValues.forEach(x => {
            mention = Utils.toKey(x);
            if (mention.ID && mention.Name && mention.Type) {
                mentions.push(mention);
            }
        });

        me.fireEvent('postcmt', me, {
            html,
            mentions,
            atts
        });

    },

    /**
     * 清空 评论框内容，包括输入框和图片
     */
    clearValue() {
        const me = this,
            dv = me.down('comment_imgupdataview'),
            ta = me.getRichTextArea();
        ta.clearValue();
        dv.getStore().removeAll();
    }
});