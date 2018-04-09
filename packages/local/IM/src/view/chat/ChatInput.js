Ext.define('IM.view.chat.ChatInput', {
    extend: 'Ext.Container',
    xtype: 'chatInput',

    requires: [
        'IM.view.chat.editor.RichEditor'
    ],

    uses: [
        'Common.field.comment.EmojiPanel'
    ],

    initialize() {
        const me = this;

        // 附件插件
        var btnBrowse = me.down('#btnBrowse');
        me.initUploader(btnBrowse);
        var btnFile = me.down('#btnFile');
        me.initFileUploader(btnFile, true);
    },


    defaultListenerScope: true,

    config: {
        /**
         * @cfg {Boolean/Object} richTextArea
         * 配置评论输入框
         */
        richTextArea: true,
        /**
         * @cfg {Boolean} enableUpload
         * 允许添加并上传文件
         */
        enableUpload: true
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
            handler: 'showEmjPanel',
            tooltip: '表情'
        }, {
            xtype: 'button',
            ui: 'flat',
            itemId: 'btnBrowse',
            iconCls: 'x-fa fa-file-image-o',
            preventDefaultAction: false,
            tooltip: '图片'
        }, {
            xtype: 'button',
            ui: 'flat',
            itemId: 'btnFile',
            iconCls: 'x-fa fa-folder',
            preventDefaultAction: false,
            tooltip: '文件'
        }, {
            xtype: 'button',
            ui: 'flat',
            iconCls: 'x-fa fa-check',
            handler: 'onReply',
            tooltip: '回执消息'
        }, {
            xtype: 'button',
            ui: 'flat',
            iconCls: 'x-fa fa-cut',
            tooltip: '剪切'
        }, {
            xtype: 'button',
            ui: 'flat',
            iconCls: 'x-fa fa-star-o',
            handler: 'onShowFav',
            tooltip: '收藏'
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
        flex: 1,
        userCls: 'rich-editor-Ct'
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
    },

    /**
     * 收藏
     */
    onShowFav() {
        var view = this.up('IM'),
            fav = this.fav;

        if (!fav) {
            fav = Ext.apply({
                ownerCmp: view
            }, view.fav);

            this.fav = fav = Ext.create(fav);
        }

        fav.show();
    },


    /* ****************************** 附件相关 ****************************************/
    /**
     * 点击添加文件按钮时，如果上传组件还没有初始化好，就提示一下
     * @param {Ext.Button} btn
     */
    onTapBtnBrowse(btn) {
        const me = this;
        if (!window.plupload || !me.uploader) {
            Utils.toastShort(FileUtil.waitUploadInitMsg);

            return;
        }

        if (!me.getEnableUpload()) {
            Utils.toastShort('禁止上传文件');

            return;
        }
    },
    /**
    * 初始化上传按钮
    * @param {Ext.Button} btnBrowse
    */
    initUploader(btnBrowse) {
        const me = this;
        if (me.uploader || !btnBrowse || !me.getEnableUpload()) return;

        btnBrowse.on({
            tap: 'onTapBtnBrowse',
            scope: me
        });

        FileUtil.ensurePlUploadlibs(() => {
            me.doInitUploader(btnBrowse);
        });
    },

    doInitUploader(btnBrowse) {
        const me = this;
        if (me.uploader) return; // 这儿不怎么友好

        var fileType = [FileUtil.imageFilter];

        var uploader = new plupload.Uploader({
            required_features: 'send_browser_cookies',
            multipart_params: [{ chat_id: User.crtChannelId }],

            browse_button: btnBrowse.buttonElement.dom, // you can pass in id...
            container: btnBrowse.element.dom, // ... or DOM Element itself

            // url: Config.httpUrlForGo + 'files',

            chunk_size: '1mb',
            unique_names: false,
            filters: {
                // prevent_duplicates: true,
                max_file_size: '5mb',
                mime_types: fileType
            },

            init: {
                FilesAdded(up, files) {
                    console.log('选择文件后触发');
                    me.onPicsAdded.apply(me, arguments);
                },

                UploadProgress(up, file) {
                    // me.onUploadProgress.apply(me, arguments);
                },

                FileUploaded(up, file, result) {
                    // me.onFileUploaded.apply(me, arguments);
                },

                UploadComplete(up, files) {
                    // me.onUploadComplete.apply(me, arguments);
                },

                Error(up, err) {
                    me.onPicUploadError.apply(me, arguments);
                    // alert('出错了');
                }
            }
        });

        uploader.init();

        me.uploader = uploader;
        // debugger;
    },

    /**
     * 选择文件后触发
     * @param {plupload.Uploader} uploader
     * @param {plupload.File[]} files
     */
    onPicsAdded(uploader, files) {
        // debugger;
        var me = this;
        if (files.length > 0) {
            var type; // 图片格式jpg,jpeg,gif,png,bmp
            var picInfo = [];
            for (var i = 0; i < files.length; i++) {
                type = files[i].type.substr(files[i].type.indexOf('/') + 1);

                if (FileUtil.imageFilter.extensions.indexOf(type) > -1) {// 是图片，要展示

                    picInfo.push(files[i].getNative());

                    // file转base64展示,
                    // var reader = new FileReader();
                    // reader.readAsDataURL(files[i].getNative());
                    // reader.onload = function () {
                    //     var editor = me.down('#richEditor'),
                    //         base64 = this.result,
                    //         img = '<img src="' + base64 + '" style="width:40px;height:40px"/>&#8203';
                    //     editor.inputElement.dom.focus();
                    //     document.execCommand('insertHTML', false, img);
                    // };
                } /* else {
                    // 不是图片
                    fileInfo.push(files[i]);

                    // var formData = new FormData();
                    // formData.append('files', files[i].getNative());
                    // formData.append('chat_id', User.crtChannelId);
                    // $.ajax({
                    //     url: Config.httpUrlForGo + 'files',
                    //     type: 'post',
                    //     data: formData,
                    //     contentType: false,
                    //     processData: false,
                    //     async: false,
                    //     xhrFields: {
                    //         withCredentials: true
                    //     },
                    //     success: function (data) {
                    //         debugger;

                    //     }
                    // });
                }*/
            }

            if (picInfo.length > 0) {
                // 上传图片，得到返回的预览图展示
                me.down('#richEditor').uploadPic(picInfo);
            }
            // if (fileInfo.length > 0) {
            //     me.down('#richEditor').uploadFile(fileInfo);
            // }
        }

        // uploader.start();
    },

    /**
     * 单个文件上传错误
     * @param {plupload.Uploader} uploader
     * @param {plupload.File[]} files
     */
    onPicUploadError(uploader, err) {
        console.log('onUploadError', arguments);

        Ext.Msg.alert('上传失败', '上传失败');
    },



    /**
     * 点击添加文件按钮时，如果上传组件还没有初始化好，就提示一下
     * @param {Ext.Button} btn
     */
    onTapBtnFile(btn) {
        const me = this;
        if (!window.plupload || !me.fileUploader) {
            Utils.toastShort(FileUtil.waitUploadInitMsg);

            return;
        }

        if (!me.getEnableUpload()) {
            Utils.toastShort('禁止上传文件');

            return;
        }
    },

    initFileUploader(btnBrowse) {
        const me = this;
        if (me.fileUploader || !btnBrowse || !me.getEnableUpload()) return;

        btnBrowse.on({
            tap: 'onTapBtnFile',
            scope: me
        });

        FileUtil.ensurePlUploadlibs(() => {
            me.doInitFileUploader(btnBrowse);
        });
    },

    doInitFileUploader(btnBrowse) {
        const me = this;
        if (me.fileUploader) return; // 这儿不怎么友好

        var fileType = [FileUtil.imageFilter, FileUtil.archiveFilter, FileUtil.docFilter, FileUtil.otherFilter];

        var fileUploader = new plupload.Uploader({
            required_features: 'send_browser_cookies',

            browse_button: btnBrowse.buttonElement.dom, // you can pass in id...
            container: btnBrowse.element.dom, // ... or DOM Element itself

            chunk_size: '1mb',
            unique_names: false,
            filters: {
                // prevent_duplicates: true,
                max_file_size: '5mb',
                mime_types: fileType
            },

            init: {
                FilesAdded(up, files) {
                    // console.log('选择文件后触发');
                    me.onFilesAdded.apply(me, arguments);
                },

                UploadProgress(up, file) {
                    // me.onUploadProgress.apply(me, arguments);
                },

                FileUploaded(up, file, result) {
                    // me.onFileUploaded.apply(me, arguments);
                },

                UploadComplete(up, files) {
                    // me.onUploadComplete.apply(me, arguments);
                },

                Error(up, err) {
                    me.onFilesUploadError.apply(me, arguments);
                    // alert('出错了');
                }
            }
        });

        fileUploader.init();

        me.fileUploader = fileUploader;
    },

    onFilesAdded(fileUploader, files) {
        const me = this;
        if (files.length > 0) {
            // var picInfo = [],
            //     fileInfo = [];
            var fileInfo = [];
            for (var i = 0; i < files.length; i++) {
                // if (files[i].type == 'image/png') {
                //     picInfo.push(files[i].getNative());
                // } else {
                //     fileInfo.push(files[i]);
                // }
                fileInfo.push(files[i]);
            }

            // if (picInfo.length > 0) {
            //     me.down('#richEditor').uploadPic(picInfo);
            // }

            if (fileInfo.length > 0) {
                me.down('#richEditor').uploadFile(fileInfo);
            }
        }
    },
    onFilesUploadError(fileUploader, err) {
        console.log('onUploadError', arguments);

        Ext.Msg.alert('上传失败', err);
    }
});