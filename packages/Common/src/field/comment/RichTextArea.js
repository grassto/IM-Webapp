/**
 * 评论框，支持 @, url 识别
 * @author jiangwei
 */
Ext.define('Common.field.comment.RichTextArea', {
    extend: 'MX.field.RichTextArea',
    requires: [
        'Common.model.comment.Mention'
    ],
    xtype: 'comment_richtextarea',

    placeholder: '写下你的评论',
    clearable: false,
    minHeight: 55,
    maxHeight: 100,

    constructor(config) {
        var me = this;
        config = config || {};

        var atStore = Ext.getStore('global-mention-store');
        if (!atStore) {
            atStore = Ext.factory({
                storeId: 'global-mention-store',
                model: 'Common.model.comment.Mention'
            }, Ext.data.Store);
        }

        /**
         * 配置 @人员、组织等
         */
        config.triggerChars = [{
            trigger: '@',
            minChars: 1,
            store: atStore,
            itemTpl: Ext.create('Ext.XTemplate', [
                '<span class="at at-U"><span class="at-type">({TypeDesc}) </span>{Name}</span>'
            ].join('')),
            callback: function (term, response) {
                console.log(`@ callback with term "${term}"`);

                if (me._lastTerm == term) return;
                // 终止上一次的查询
                if (me._xhr) {
                    Ext.Ajax.abort(me._xhr);
                }

                me._xhr = me.ajax('ajax/OA.Comment.AtData/GetAtData', {
                    data: {
                        P0: 7,
                        P1: term
                    },
                    success(result) {
                        me._lastTerm = term;

                        response(result);
                    },
                    maskTarget: false
                });

            }
        }];

        /**
         * 配置自动识别 url
         */
        config.regexes = [{
            regex: Utils.regex.url,
            callback: function (field, wordEntry) {
                console.log('regex: got word entry:', wordEntry);

                field.replaceWord(wordEntry, `<a href="${wordEntry.word}">${wordEntry.word}</a>`, wordEntry.word);
            }
        }];

        me.callParent([
            config
        ]);
    },

    onPickerHide() {
        var me = this;
        me.callParent(arguments);
        delete me._lastTerm;
    }
});