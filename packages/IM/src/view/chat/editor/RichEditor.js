Ext.define('IM.view.chat.editor.RichEditor', {
    extend: 'MX.field.RichTextArea',
    xtype: 'richEditor',
    requires: [
        'IMCommon.model.Mention',
        'Ext.drag.Target'
    ],

    scrollable: {
        y: true
    },
    placeholder: 'Ctrl+Enter换行',
    clearable: false,
    // minHeight: 80,
    // maxHeight: 300,
    id: 'editor',
    cls: 'IM-richEditor',

    initialize() {
        var me = this;
        me.callParent(arguments);
        me.onclickPic();
        me.preventKeydown();

        me.initDrap();
    },

    /**
     * 允许拖拽文件至输入框
     */
    initDrap() {
        this.target = new Ext.drag.Target({
            element: this.element,
            listeners: {
                scope: this,
                dragenter: this.onDragEnter,
                dragleave: this.onDragLeave,
                drop: this.onDrop
            }
        });
    },
    onDragEnter(a, b, c) { // 可以在此增加样式

    },
    onDragLeave(a, b, c) {

    },
    onDrop(target, info) {
        var me = this,
            files = info.files,
            len = files.length;
        if (len > 0) {
            for (var i = 0; i < len; i++) {
                if (files[i].type == 'image/png') { // 图片类型，则上传并绑定到editor
                    me.uploadPic(files);
                } else { // 其他类型再处理

                }
            }
        }
    },

    /**
     * Enter发送，Ctrl+Enter回车
     */
    preventKeydown() {
        var me = this,
            editor = this.inputElement.dom;
        $(editor).keydown(function (event) {
            if (event.keyCode == 13) {
                if (event.ctrlKey) {
                    editor.value += '<br>' + '&#8203;';
                }
                else {
                    if (editor.value) {
                        me.up('im-main').getController().onSend();
                    }
                    return false;
                }
            }
        });
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
        var me = this;
        config = config || {};

        var atStore = Ext.getStore('IM-global-mention-store');
        if (!atStore) {
            atStore = Ext.factory({
                storeId: 'IM-global-mention-store',
                model: 'IM.model.Mention'
            }, Ext.data.Store);
        }

        /**
         * 配置 @人员、组织等
         */
        config.triggerChars = [{
            trigger: '@',
            minChars: 0,
            store: atStore,
            itemTpl: Ext.create('Ext.XTemplate', [
                // '<span class="at at-U"><span class="at-type">({TypeDesc}) </span>{user_name}</span>'
                '<span class="at at-U">{user_name}</span>'
            ].join('')),
            callback: function (term, response) {
                // debugger;
                var has = PreferenceHelper.isShowAt(User.crtChannelId); // 单人会话不查

                if (has) { // 多人会话
                    console.log(`@ callback with term "${term}"`);

                    if (me._lastTerm == term) return;

                    var mems;

                    if (term == '') { // 只有@的时候，展示所有人
                        mems = PreferenceHelper.getAllAtChatMems(User.crtChannelId);
                    } else {
                        mems = PreferenceHelper.getAtMems(User.crtChannelId, term);
                    }

                    me._lastTerm = term;
                    response(mems);


                    // 终止上一次的查询
                    // if (me._xhr) {
                    //     Ext.Ajax.abort(me._xhr);
                    // }

                    // me._xhr = Utils.ajaxByZY('post', 'users/at', {
                    //     params: JSON.stringify({
                    //         top: '7',
                    //         search: term
                    //     }),
                    //     success(result) {
                    //         // debugger;
                    //         me._lastTerm = term;

                    //         response(result);
                    //     },
                    //     maskTarget: false
                    // });
                }
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
    },

    privates: {
        /**
         * 重写黏贴方法
         * @param {*} outEvent 
         */
        handlePaste(outEvent) {
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

                        } else if (item.typeEx == 'text/html') {
                            item.getAsString(function (data) {
                                text = me.htmlToPlain(data);

                                if (document.queryCommandSupported('insertHTML')) {
                                    document.execCommand('insertHTML', false, text);
                                } else {
                                    document.execCommand('paste', false, text);
                                }

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
                                // var arr = text.split('\n');
                                // for (let i = 0; i < arr.length; i++) {
                                //     $(me.inputElement.dom).append('<div>' + arr[i] + '</div>');
                                // }
                            });
                        }
                    } else if (item.kind == 'file') {
                        var blob = item.getAsFile();
                        var files = [];
                        files.push(blob);
                        // 图片上传,并黏贴到输入框
                        me.uploadPic(files);

                        // me.bindPicToEditor(blob);
                    }

                    me._checkRegexes(outEvent);
                }

                outEvent.preventDefault();
            }

        }
    },

    /**
     * 将图片以img标签base64的方式来展示
     * @param {File} blob 图片
     */
    bindPicToEditor(blob) {
        // 使用base64格式的图片
        var reader = new FileReader();
        reader.onload = function (event) {
            var text = '<img style="width:40px;height:40px;" src="' + event.target.result + '"/>' + '&#8203'; // 后面加的这个是定位光标的
            setTimeout(() => {
                if (document.queryCommandSupported('insertHTML')) {
                    document.execCommand('insertHTML', false, text);
                } else {
                    document.execCommand('paste', false, text);
                }
            });
        };
        reader.readAsDataURL(blob);
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
     * 上传图片,黏贴，拼凑图片img
     * @param File类型
     */
    uploadPic(picInfo) {
        var me = this,
            formData = new FormData();
        for (var i = 0; i < picInfo.length; i++) {
            formData.append('files', picInfo[i]);
        }
        formData.append('chat_id', User.crtChannelId);
        $.ajax({
            url: Config.httpUrlForGo + 'files',
            type: 'post',
            data: formData,
            contentType: false,
            processData: false,
            // async: false,
            xhrFields: {
                withCredentials: true
            },
            success: function (data) {
                // var text, url, id;
                for (var i = 0; i < data.files.length; i++) {
                    User.files.push(data.files[i]);

                    me.bindPicByID(data.files[i].file_id);
                }
            }
        });
    },

    /**
     * 根据id绑定图片至img
     * @param {string} infoID 图片id
     */
    bindPicByID(infoID) {
        var id = infoID,
            text = '<img id="' + id + '" class="viewPic" style="width:40px;height:40px;background:url(/resources/images/loading.gif) no-repeat center center;"/>' + '&#8203',
            // url = Config.httpUrlForGo + 'files/' + id;// + '/thumbnail'; // 暂时使用原图展示

            url = Config.httpUrlForGo + 'files/' + id + '/thumbnail';
        this.inputElement.dom.focus();
        if (document.queryCommandSupported('insertHTML')) {
            document.execCommand('insertHTML', false, text);
        } else {
            document.execCommand('paste', false, text);
        }

        // 图片若未加载完成，则显示loading,加载出现异常，显示默认图片
        window.imagess(url, id);
    },


    uploadFile(fileInfo) {
        User.localFiles = fileInfo; // 通过缓存来存储
        // 显示上传页面
        const me = this;
        if(!me.uploadList) {
            me.uploadList = Ext.create('IM.widget.UploadList', {
                id: 'uploadList'
            });
        }
        me.uploadList.show();
    },


    destory() {
        Ext.destroy(this.uploadList);
        this.callParent();
    },




    bindFile(file) {
        const me = this;
        var html = [
            '<div class="fileMsg">',
                '<div class="fileWrapper">',
                    '<div class="fileIcon"></div>',
                    '<div class="fileName">' + file.file_name + '</div>',
                    '<div>' + me.bytesToSize(file.size) + '</div>',
                '</div>',
            '</div>',
            '&#8203'
        ].join('');


        me.inputElement.dom.focus();
        if (document.queryCommandSupported('insertHTML')) {
            document.execCommand('insertHTML', false, html);
        } else {
            document.execCommand('paste', false, html);
        }
    },

    bytesToSize(bytes) {
        if (bytes === 0) return '0 B';
        var k = 1000, // or 1024
            sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
            i = Math.floor(Math.log(bytes) / Math.log(k));

       return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
    },


});