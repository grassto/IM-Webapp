Ext.define('IM.view.chat.editor.RichEditor', {
    extend: 'MX.field.RichTextArea',
    xtype: 'richEditor',
    requires: [
        'IM.model.Mention'
    ],

    placeholder: 'Ctrl+Enter发送',
    clearable: false,
    // minHeight: 80,
    // maxHeight: 300,
    id: 'editor',

    initialize() {
        var me = this;
        me.callParent(arguments);
        me.onclickPic();
    },

    /**
     * 点击选中img
     */
    onclickPic() {
        $(this.inputElement.dom).bind('click', function (e) {
            if (e.target.nodeName == 'IMG') {
                var r = document.createRange();
                r.setStartBefore(e.target);
                r.setEndAfter(e.target);

                var s = window.getSelection();
                s.removeAllRanges();
                s.addRange(r);

                e.preventDefault();
            }
        });
    },

    constructor(config) {
        // debugger;
        var me = this;
        config = config || {};

        var atStore = Ext.getStore('global-mention-store');
        if (!atStore) {
            atStore = Ext.factory({
                storeId: 'global-mention-store',
                model: 'IM.model.Mention'
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

                me._xhr = me.ajax('post', 'ajax/OA.Comment.AtData/GetAtData', {
                    data: {
                        P0: 7,
                        P1: term
                    },
                    success(result) {
                        me._lastTerm = term;

                        response(result);
                    },
                    maskTarget: false
                }, true);

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

    privates: {
        /**
         * 重写黏贴方法
         * @param {*} outEvent 
         */
        handlePaste(outEvent) {
            // debugger;
            var me = this,
                inputMask = me.getInputMask();

            if (!inputMask) {
                var e = outEvent.browserEvent,
                    text = '';
                if (e && e.clipboardData && e.clipboardData.getData) { // Webkit, FF
                    var items = e.clipboardData.items;
                    if (items.length <= 0) {
                        return;
                    }
                    var item = me.getTargetItem(items);

                    if (item.kind == 'string') {
                        if (item.typeEx == 'text/plain') {
                            text = e.clipboardData.getData('text/plain');

                            if (document.queryCommandSupported('insertText')) {
                                document.execCommand('insertText', false, text);
                            } else {
                                document.execCommand('paste', false, text);
                            }
                            me._checkRegexes(outEvent);

                        } else if (item.typeEx == 'text/html') {
                            item.getAsString(function (data) {
                                text = me.htmlToPlain(data);

                                if (document.queryCommandSupported('insertHTML')) {
                                    document.execCommand('insertHTML', false, text);
                                } else {
                                    document.execCommand('paste', false, text);
                                }
                                me._checkRegexes(outEvent);

                                // var imgs = $('img[url]');
                                // for (let i = 0; i < imgs.length; i++) {
                                //     var $img = $(imgs[i]);
                                //     var url = $img.attr('url');
                                //     // 模拟图片上传
                                //     setTimeout(function () {
                                //         $img.attr('src', url);
                                //     }, 2000);
                                // }

                            });
                        } else if (item.typeEx == 'text/rtf') {
                            item.getAsString(function (data) {
                                text = me.rtfhtmlToPlain(data) + '&#8203';
                                // text = me.textToHtml(plainText);
                                if (document.queryCommandSupported('insertHTML')) {
                                    document.execCommand('insertHTML', false, text);
                                } else {
                                    document.execCommand('paste', false, text);
                                }
                                me._checkRegexes(outEvent);
                                // var arr = text.split('\n');
                                // for (let i = 0; i < arr.length; i++) {
                                //     $(me.inputElement.dom).append('<div>' + arr[i] + '</div>');
                                // }
                            });
                        }
                    } else if (item.kind == 'file') {
                        var blob = item.getAsFile();
                        // 图片上传
                        // me.uploadPic(blob);


                        var reader = new FileReader();
                        reader.onload = function (event) {
                            text = '<img src="' + event.target.result + '"/>' + '&#8203'; // 后面加的这个是定位光标的
                            setTimeout(() => {
                                if (document.queryCommandSupported('insertHTML')) {
                                    document.execCommand('insertHTML', false, text);
                                } else {
                                    document.execCommand('paste', false, text);
                                }
                                me._checkRegexes(outEvent);

                                // $(me.inputElement.dom).append(text);
                                // me.focusEnd();
                            });
                        }
                        reader.readAsDataURL(blob);
                    }


                }

                outEvent.preventDefault();
            }

        }
    },

    rtfhtmlToPlain(html) {
        let result = '';
        let startIndex = html.indexOf('<!--StartFragment-->'),
            endIndex = html.lastIndexOf('<!--EndFragment-->');
        html = html.substr(startIndex + 20, endIndex - startIndex - 20);
        html = html.replace(/\n/g, '')
        html = html.replace(/<\/p>/g, '\n')
            .replace(/<\/div>/g, '\n')
            .replace(/<br\/>/g, '\n')
            .replace(/<br>/g, '\n');

        html = html.replace(/<(?!v:imagedata)[^>]*>/g, '')
        // 此处的图片暂不支持
        // html = html.replace(/<v:imagedata[^>]*src="([^"]*)"[^>]*\/>/g, '<img src="$1">')
        html = html.replace(/<v:imagedata[^>]*src="([^"]*)"[^>]*\/>/g, '')
        result = html;
        console.log(result);
        return result;
    },

    htmlToPlain(html) {
        let result = '';
        let startIndex = html.indexOf('<!--StartFragment-->'),
            endIndex = html.lastIndexOf('<!--EndFragment-->');
        html = html.substr(startIndex + 20, endIndex - startIndex - 20);

        html = html.replace(/\n/g, '');
        html = html.replace(/<\/p>/g, '\n')
            .replace(/<\/div>/g, '\n')
            .replace(/<br\/>/g, '\n')
            .replace(/<br>/g, '\n')
        html = html.replace(/<(?!img)[^>]*>/g, '');
        console.log(html);
        // 处理图片
        // result = html.replace(/\<img[^\>]*src="([^"]*)"[^\>]*\>/g, '<img src="resources/images/wait.gif" url="$1">');
        result = html.replace(/\<img[^\>]*src="([^"]*)"[^\>]*\>/g, '<img src="$1">');
        console.log(result);
        return result;
    },

    getTargetItem(items) {
        let result = null;
        let containsRtf = false;
        for (let i = 0; i < items.length; i++) {
            let item = items[i];
            if (item.kind == 'string') {
                if (item.type == 'text/rtf') {
                    // rtf 依然通过html去解析
                    containsRtf = true;
                } else if (item.type == 'text/html') {
                    if (result == null || result.type == 'text/plain') {
                        result = item;
                    }
                } else if (item.type == 'text/plain') {
                    if (result == null) {
                        result = item;
                    }
                }
            } else {
                result = item;
                break;
            }
        }
        if (containsRtf) {
            result.typeEx = 'text/rtf';
        } else {
            result.typeEx = result.type;
        }
        return result;
    },

    /**
     * 上传图片,
     * @param File类型
     */
    uploadPic(file) {
        var formData = new FormData(),
            clientId = new Date().getTime() + '';
        formData.append('files', file);
        formData.append('channel_id', User.crtChannelId);
        formData.append('client_ids', clientId);
        $.ajax({
            url: Config.httpUrl + 'files',
            type: 'post',
            data: formData,
            contentType: false,
            processData: false,
            async: false,
            xhrFields: {
                withCredentials: true
            },
            success: function (data) {
                //
            }
        });
    }
});