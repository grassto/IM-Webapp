Ext.define('IMCommon.view.RichEditor', {
    extend: 'MX.field.RichTextArea',

    requires: [
        'Ext.drag.Target',
        'IMCommon.model.Mention'
    ],

    xtype: 'imCommonEditor',

    scrollable: {
        y: true
    },
    clearable: false,

    constructor(config) {
        var me = this;
        config = config || {};

        var atStore = Ext.getStore('IM-global-mention-store');
        if (!atStore) {
            atStore = Ext.factory({
                storeId: 'IM-global-mention-store',
                model: 'IMCommon.model.Mention'
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

    initialize() {
        var me = this;
        me.callParent(arguments);
        me.onclickPic();

        if (Config.isPC) {
            me.preventKeydown();
        }

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
            len = files.length,
            type; // 图片格式jpg,jpeg,gif,png,bmp
        for (var i = 0; i < len; i++) {
            type = files[i].type.substr(files[i].type.indexOf('/') + 1);

            if (FileUtil.imageFilter.extensions.indexOf(type) > -1) {// 图片类型，则上传并绑定到editor
                // me.uploadPic(files);
            } else { // 其他类型再处理

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
                } else {
                    if (editor.value) {
                        if (Config.isPhone) {
                            // SendUtil.sendMsg(editor, User.crtChannelId, );
                        } else {
                            var imView = Ext.Viewport.lookup('IM');
                            SendUtil.sendMsg(me, User.crtChannelId, imView.down('#recentChat').getStore(), imView.lookup('im-main').down('#chatView'));
                        }

                    } else {
                        Utils.toastShort('不能发送空白消息');
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

    onPickerHide() {
        var me = this;
        me.callParent(arguments);
        delete me._lastTerm;
    },

    privates: {
        /**
         * 重写黏贴方法
         * @param {Ext.event.Event} outEvent
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
                        if (item.typeEx == 'text/plain') { // 文本
                            text = e.clipboardData.getData('text/plain');

                            if (document.queryCommandSupported('insertText')) {
                                document.execCommand('insertText', false, text);
                            } else {
                                document.execCommand('paste', false, text);
                            }

                        } else if (item.typeEx == 'text/html') {
                            item.getAsString(function (data) {
                                me.htmlToPlain(data).then(text => {
                                    if (document.queryCommandSupported('insertHTML')) {
                                        document.execCommand('insertHTML', false, text);
                                    } else {
                                        document.execCommand('paste', false, text);
                                    }
                                });


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
                        } else if (item.typeEx == 'text/rtf') { // 如word中粘过来的东西
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
                        // var blob = item.getAsFile();
                        // var files = [];
                        // files.push(blob);
                        // // 图片上传,并黏贴到输入框
                        // me.uploadPic(files);
                        var blob = item.getAsFile();
                        // 只能new一个这个FileReader对象
                        if(!User.fileReader) {
                            User.fileReader = new FileReader();
                        }
                        User.fileReader.readAsDataURL(blob);
                        User.fileReader.onloadend = function () {
                            var base64data = User.fileReader.result;
                            if (Config.isPC) {
                                cefMain.saveFile(base64data, function (url) {
                                    var text = '<img src="' + `localfile:///${url}` + '" data-url="' + `file:///${url}` + '">' + '&#8203';
                                    if (document.queryCommandSupported('insertHTML')) {
                                        document.execCommand('insertHTML', false, text);
                                    } else {
                                        document.execCommand('paste', false, text);
                                    }
                                });
                            }
                        };
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

        const startIndex = html.indexOf('<!--StartFragment-->'),
            endIndex = html.lastIndexOf('<!--EndFragment-->');
        html = html.substr(startIndex + 20, endIndex - startIndex - 20);

        html = html.replace(/\n/g, '<br>')
            .replace(/<\/p>/g, '<br>')
            .replace(/<\/div>/g, '<br>')
            .replace(/<(?!(v:imagedata|br))[^>]*>/g, '');
        // 此处的图片暂不支持
        // result = html.replace(/<v:imagedata[^>]*src="([^"]*)"[^>]*\/>/g, '');
        result = html.replace(/<v:imagedata[^>]*src="([^"]*)"[^>]*\/>/g, function () {
            const url = arguments[1]; // file:// 地址
            let localUrl = url;
            if (Utils.isWeb && window.cefMain) { // http 页面 显示不了本地 file:// 图片, cef 加了一个 localfile:// 协议
                localUrl = `local${url}`;
            }

            return `<img class="viewPic" src="${localUrl}" data-url="${url}">`;
        });

        console.log(result);

        return result;
    },

    htmlToPlain(html) {
        let result = '';

        const startIndex = html.indexOf('<!--StartFragment-->'),
            endIndex = html.lastIndexOf('<!--EndFragment-->');
        html = html.substr(startIndex + 20, endIndex - startIndex - 20);

        html = html.replace(/\n/g, '<br>')
            .replace(/<\/p>/g, '<br>')
            .replace(/<\/div>/g, '<br>')
            .replace(/<(?!(img|br))[^>]*>/g, '');
        console.log(html);

        // 处理图片
        // result = html.replace(/\<img[^\>]*src="([^"]*)"[^\>]*\>/g, '<img src="resources/images/wait.gif" url="$1">');
        // result = html.replace(/<img[^>]*src="([^"]*)"[^>]*>/g, '<img src="$1">');

        if (Ext.browser.is.Cordova || window.cefMain) { // 保留图片并下载到本地，忽略其他标签
            const srcArr = []; // 第三方图片原始 src 数组
            result = html.replace(/<img[^>]*src="([^"]*)"[^>]*>/g, function () {
                const src = arguments[1];
                srcArr.push(src);

                return `<img src="${src}">`;
            });

            const promises = [];
            srcArr.forEach(src => {
                if (Utils.isUrl(src)) { // 可下载的地址
                    const tempName = ImgMgr.getRemoteName(src); // 第三方图片存储本地的文件名
                    promises.push(FileMgr.downFileForSrc(src, 1, `cache/${tempName}`));
                }
            });

            const failedImg = Ext.getResourcePath('images/failed.png');

            // 下载所有图片
            return Ext.Promise.all(promises.map(p => p.catch(() => undefined))) // 忽略所有 下载失败 的 promise
                .then(values => {
                    srcArr.forEach((src, i) => {
                        const url = values[i];
                        if (url) { // 下载好的本地地址
                            let localUrl = url;
                            if (Utils.isWeb && window.cefMain) { // http 页面 显示不了本地 file:// 图片, cef 加了一个 localfile:// 协议
                                localUrl = `local${url}`;
                            }
                            result = result.replace(`<img class="viewPic" src="${src}">`, `<img src="${localUrl}" data-url="${url}">`);
                        } else { // 下载失败的
                            result = result.replace(`<img src="${src}">`, `<img src="${failedImg}">`);
                        }
                    });

                    console.log(result);

                    return result;
                });
        }

        // 如果是网页浏览 则过滤掉所有标签
        result = html.replace(/<img[^>]*>/g, '');

        console.log(result);

        return Ext.Promise.resolve(result);
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
    }
});