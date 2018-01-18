Ext.define('IM.view.IMController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.IM',

    init: function () {
        var me = this;
        me.callParent(arguments);

        // 设置当前用户头像
        var viewmodel = me.getViewModel();
        var avatar = '<a class="avatar link-avatar firstletter " letter="' + AvatarMgr.getFirstLetter(viewmodel.get('ownerName')) + '" style="float:left;' + AvatarMgr.getColorStyle(viewmodel.get('ownerName')) + '" ></a>';
        viewmodel.set('avatar', avatar);

        // 附件插件
        var btnBrowse = me.getView().down('#btnBrowse');
        me.initUploader(btnBrowse);
        var btnFile = me.getView().down('#btnFile');
        me.initUploader(btnFile, true);

        // 搜索框
        var form = me.lookup('searchForm');
        var map = new Ext.util.KeyMap({
            target: form.element,
            key: 13, // or Ext.event.Event.ENTER
            handler() {
                // me.onSearch();
            },
            scope: me
        });

        // 建立连接
        // me.mounted();
    },

    /**
     * websocket接收请求后执行，将数据绑定至页面
     * @param {*} msg 服务器返回的数据
     */
    handleNewPostEvent(msg) {

    },


    mounted() {
        var me = this;
        me.getMe();
        WebSocketHelper.initialize(Config.wsDevUrl);
        WebSocketHelper.setEventCallback((msg) => {
            switch (msg.event) {
                case 'posted':
                    me.handleNewPostEvent(msg);
                    break;
                default:
                    break;
            }
        });
        me.getMembers();
        // me.getPreferences();
    },

    // 获取个人信息
    getMe() {
        var me = this;
        Utils.ajaxByZY('GET', 'users/me', {
            success: function (data) {
                // debugger;
                console.log('个人信息：');
                console.log(data);
                User.crtUser = data;
                var viewmodel = me.getView().getViewModel();
                viewmodel.set('ownerName', data.nickname);
                viewmodel.set('ownerMail', data.email);
            }
        });
    },

    // 获取所有成员
    getMembers() {
        var me = this;
        Utils.ajaxByZY('GET', 'users', {
            success: function (data) {
                console.log('所有人员：');
                console.log(data);
                User.allUsers = data;
                for (let i = 0; i < data.length; i++) {
                    if (data[i].id !== User.ownerID) {
                        // debugger;
                        User.allOthers.push(data[i]);
                    }
                }

                BindHelper.loadOrganization(me.getView());
                // me.getChannels();



                // // 定时获取状态 30s
                // me.getStatus(data);
                // setInterval(() => {
                //     me.getStatus(data);
                // }, 60 * 1000);
            }
        });

    },



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

        if (!me.getView().getEnableUpload()) {
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
        if (me.uploader || !btnBrowse || !me.getView().getEnableUpload()) return;

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
                    // file转base64展示,
                    var reader = new FileReader();
                    reader.readAsDataURL(files[i].getNative());
                    reader.onload = function () {
                        var editor = me.getView().down('#richEditor'),
                            base64 = this.result,
                            img = '<img src="' + base64 + '" style="width:40px;height:40px"/>&#8203';
                        editor.inputElement.dom.focus();
                        document.execCommand('insertHTML', false, img);
                    };
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
    },





    /**
     * 弹出的dialog
     */
    onShowGrpSel() {
        var view = this.getView(),
            grpSel = this.grpSel;

        if (!grpSel) {
            grpSel = Ext.apply({
                ownerCmp: view
            }, view.grpSel);

            this.grpSel = grpSel = Ext.create(grpSel);
        }

        grpSel.show();
    },
    onShowMsgManger() {
        var me = this,
            msgMgr = me.msgMgr;

        if (!msgMgr) {
            msgMgr = Ext.widget('msgManager', {});
            me.msgMgr = msgMgr;
        }
        if (msgMgr.getParent() !== Ext.Viewport) {
            Ext.Viewport.add(msgMgr);
        }

        msgMgr.show();
    },
    onShowFav() {
        var view = this.getView(),
            fav = this.fav;

        if (!fav) {
            fav = Ext.apply({
                ownerCmp: view
            }, view.fav);

            this.fav = fav = Ext.create(fav);
        }

        fav.show();
    },

    destroy: function () {
        Ext.destroy(this.fav);
        Ext.destroy(this.msgMgr);
        Ext.destroy(this.grpSel);
        this.callParent();
    }
});