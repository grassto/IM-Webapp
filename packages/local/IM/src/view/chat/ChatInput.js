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
        me.initUploader(btnFile, true);
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
    initUploader(btnBrowse, isAllFile) {
        const me = this;
        if (me.uploader || !btnBrowse || !me.getEnableUpload()) return;

        btnBrowse.on({
            tap: 'onTapBtnBrowse',
            scope: me
        });

        FileUtil.ensurePlUploadlibs(() => {
            me.doInitUploader(btnBrowse, isAllFile);
        });
    },

    doInitUploader(btnBrowse, isAllFile) {
        var me = this,
            fileType = [FileUtil.imageFilter];
        if (isAllFile) {
            fileType = [FileUtil.imageFilter, FileUtil.archiveFilter, FileUtil.docFilter, FileUtil.otherFilter];
        }
        var uploader = new plupload.Uploader({
            required_features: 'send_browser_cookies',

            browse_button: btnBrowse.buttonElement.dom, // you can pass in id...
            container: btnBrowse.element.dom, // ... or DOM Element itself

            chunk_size: '1mb',
            unique_names: false,
            filters: {
                // prevent_duplicates: true,
                // max_file_size: '40mb',
                mime_types: fileType
            },

            init: {
                FilesAdded(up, files) {
                    console.log('选择文件后触发');
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
                    // me.onUploadError.apply(me, arguments);
                    alert('出错了');
                }
            }
        });

        uploader.init();

        me.uploader = uploader;
    },

    /**
     * 选择文件后触发
     * @param {plupload.Uploader} uploader
     * @param {plupload.File[]} files
     */
    onFilesAdded(uploader, files) {
        var me = this;
        if (files.length > 0) {
            for (var i = 0; i < files.length; i++) {

                if (files[i].type == 'image/png') {// 是图片，要展示
                    // 上传图片，得到返回的预览图展示
                    me.down('#richEditor').uploadPic(files[i].getNative());

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
                } else {
                    // 不是图片
                }
            }
        }

        // const me = this;
        // if (files.length > 0) {
        //     var formData = new FormData(),
        //         clientId = new Date().getTime() + '';
        //     formData.append('files', files[0].getNative());
        //     formData.append('channel_id', User.crtChannelId);
        //     formData.append('client_ids', clientId);
        //     $.ajax({
        //         url: config.httpUrl + 'files',
        //         type: 'post',
        //         data: formData,
        //         contentType: false,
        //         processData: false,
        //         async: false,
        //         xhrFields: {
        //             withCredentials: true
        //         },
        //         success: function (data) {
        //             var reFiles = data.file_infos;
        //             for (var i = 0; i < reFiles.length; i++) {
        //                 User.files.push(reFiles[i]);
        //             }

        //             var fileListStore = me.getView().down('#fileView').store;
        //             // for (var i = 0; i < reFiles.length; i++) {
        //             //     fileListStore.add({ FileName: reFiles[i].name, Size: reFiles[i].size });
        //             // }
        //             plupload.each(reFiles, function (file) {
        //                 fileListStore.add({
        //                     FileID: file.id,
        //                     FileName: file.name,
        //                     Size: file.size,
        //                     Icon: DocUtil.getExtension(file.name),
        //                     // Status: 0 // 未上传
        //                 });
        //             });
        //         }
        //     });
        // }
    }
});