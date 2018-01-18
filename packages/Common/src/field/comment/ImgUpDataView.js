/**
 * 评论添加图片并上传 dataview
 * @author jiangwei
 */
Ext.define('Common.field.comment.ImgUpDataView', {
    extend: 'Ext.dataview.DataView',
    requires: [
        'Common.model.comment.Img'
    ],

    xtype: 'comment_imgupdataview',

    /**
     * @property {Boolean} instantUpload
     * 删除时询问
     */
    askWhenDelete: false,

    inline: true,

    cls: 'img-dataview',

    padding: 5,

    itemTpl: [
        '<div class="img-wrap">',
            //'<img src="{[DocHelper.buildEmbedSrc(values.ThumbID)]}" />',
            '<div class="progress-wrap">',
                '<div class="progressbar"></div>',
                '<div class="progress" style="display:none"></div>',
            '</div>',
        '</div>',
        '<div class="delete-icon x-fa fa-times-circle"></div>'
    ].join(''),

    store: {
        model: 'Common.model.comment.Img'
    },

    initialize() {
        const me = this,
            store = me.getStore();
        me.callParent(arguments);

        me.on({
            childtap: 'onTapChild',
            scope: me
        });

        store.on({
            remove: 'onDVStoreRemove',
            clear: 'onDVStoreClear',
            scope: me
        });
    },

    /**
     * store 移除 record 时，从 uploader 实例中移除 file 对象
     * @param {Ext.data.Store} store
     * @param {Common.model.Attach[]} records
     */
    onDVStoreRemove(store, records) {
        const me = this,
            uploader = me.uploader;
        if (uploader) {
            Ext.each(records, rec => {
                uploader.removeFile(rec.get('FileID'));
            });
        }
    },

    /**
     * store 清空时，清空 uploader 实例中的所有 file 对象
     * @param {Ext.data.Store} store
     */
    onDVStoreClear(store) {
        const me = this,
            uploader = me.uploader;
        if (uploader) {
            uploader.splice();
        }
    },

    onTapChild(me, location) {
        const record = location.record;
        if (!record) return;

        const e = location.event,
            t = Ext.fly(e.target),
            store = me.getStore(),
            uploader = me.uploader;

        if (t.hasCls('delete-icon')) {
            if(me.askWhenDelete) {
                Utils.confirm('确定要删除吗?', () => {
                    me.doDeleteRecord(record);
                });
            }
            else {
                me.doDeleteRecord(record);
            }
        }
    },

    doDeleteRecord(record) {
        const me = this,
            store = me.getStore(),
            uploader = me.uploader;
        if (uploader) {
            const file = uploader.getFile(record.get('FileID'));
            if (file.status == plupload.DONE) {
                me.ajax('ajax/OA.Comment.Data/DeleteEmbedImgs', {
                    data: {
                        P0: [record.get('ID')]
                    },
                    success() {
                        store.remove(record);
                    }
                });
            }
        }
        else {
            store.remove(record);
        }
    },

    /**
     * 初始化上传按钮
     * @param {Ext.Button} btnBrowse
     */
    initUploader(btnBrowse) {
        const me = this;
        if (me.uploader || !btnBrowse) return;

        btnBrowse.on({
            tap: 'onTapBtnBrowse',
            scope: me
        });

        DocHelper.ensurePlUploadlibs(() => {
            me.doInitUploader(btnBrowse);
        });
    },

    doInitUploader(btnBrowse) {
        const me = this;
        var uploader = new plupload.Uploader({
            runtimes: 'html5,html4',
            required_features: 'send_browser_cookies',

            browse_button: btnBrowse.buttonElement.dom, // you can pass in id...
            container: btnBrowse.element.dom, // ... or DOM Element itself

            url: Utils.joinPath(config.httpUrl, 'Doc/plupload/EmImgUp.ashx'),

            chunk_size: '1mb',
            unique_names: true,
            filters: {
                prevent_duplicates: true,
                max_file_size: '4mb',
                mime_types: [DocUtil.imageFilter]
            },

            init: {
                FilesAdded(up, files) {
                    me.onFilesAdded.apply(me, arguments);
                },

                UploadProgress(up, file) {
                    me.onUploadProgress.apply(me, arguments);
                },

                FileUploaded(up, file, result) {
                    me.onFileUploaded.apply(me, arguments);
                },

                UploadComplete(up, files) {
                    me.onUploadComplete.apply(me, arguments);
                },

                Error(up, err) {
                    me.onUploadError.apply(me, arguments);
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
        const me = this,
            store = me.getStore();

        plupload.each(files, function (file) {
            const records = store.add({
                FileID: file.id,
                FileName: file.name,
                Size: file.size
            });
            if (records.length) {
                const record = records[0],
                    img = new moxie.image.Image();
                img.onload = function () {
                    var item = me.getItem(record);
                    if (item) {
                        var dom = Ext.fly(item).down('.img-wrap').dom;
                        this.embed(dom, {
                            width: 100,
                            height: 100,
                            preserveHeaders: false
                        });
                    }
                };
                img.load(file.getSource());
            }

        });
    },

    /**
     * 单个文件上传中
     * @param {plupload.Uploader} uploader
     * @param {plupload.File} file
     */
    onUploadProgress(uploader, file) {
        const me = this,
            store = me.getStore(),
            record = store.getById(file.id),
            item = record && me.getItem(record);
        if (item) {
            const wrap = Ext.fly(item).down('.progress-wrap');
            wrap.down('.progressbar').setWidth(`${file.percent}%`);
            wrap.down('.progress').setHtml(`${file.percent}%`).setStyle('display', null);
        }
    },

    /**
     * 单个文件上传完毕
     * @param {plupload.Uploader} uploader
     * @param {plupload.File} file
     * @param {Object} result
     */
    onFileUploaded(uploader, file, result) {
        console.log('onFileUploaded', result);

        const me = this,
            store = me.getStore(),
            record = store.getById(file.id),
            item = record && me.getItem(record);
        if (item) {
            const wrap = Ext.fly(item).down('.progress-wrap');
            wrap.down('.progressbar').setWidth('100%');
            wrap.down('.progress').setHtml('<div class="result-icon done"></div>').setStyle('display', null);
        }
        const res = result.response;
        if (!Ext.isEmpty(res)) {
            var obj = Ext.decode(res);
            console.log('onFileUploaded', obj);

            if (record && obj.success) {
                record.set(obj.result, {
                    silent: true
                });
            }
        }
    },

    /**
     * 单个文件上传错误
     * @param {plupload.Uploader} uploader
     * @param {plupload.File[]} files
     */
    onUploadError(uploader, err) {
        console.log('onUploadError', arguments);

        const me = this;
        let errMsg,
            dealed = false;
        if (err.file) {
            const me = this,
                res = err.response,
                store = me.getStore(),
                record = store.getById(err.file.id),
                item = record && me.getItem(record);

            let resObj,
                errMsg = '上传失败';
            if (!Ext.isEmpty(res)) {
                resObj = Ext.decode(res);
                if(!resObj.success) {
                    errMsg = resObj.message;
                }
                console.log('onUploadError', resObj);
            }
            if (item) {
                const wrap = Ext.fly(item).down('.progress-wrap');
                wrap.down('.progress').setHtml(`<div class="result-icon failed"></div><div class="text"><span class="ellipsis">${errMsg}</span></div>`).setStyle('display', null);

                dealed = true;
                me.fireEvent('uploaderror', me, err.file, errMsg);
            }
        }

        if(!dealed) {
            errMsg = err.message;
            Utils.alert(`${err.code}: ${errMsg}`);
        }
    },

    /**
     * 全部文件上传完毕(成功或者失败)
     * @param {plupload.Uploader} uploader
     * @param {plupload.File[]} files
     */
    onUploadComplete(uploader, files) {
        console.log('onUploadComplete', arguments);

        this.fireEvent('uploadcomplete', this, files);
    },

    /**
     * 点击添加文件按钮时，如果上传组件还没有初始化好，就提示一下
     * @param {Ext.Button} btn
     */
    onTapBtnBrowse(btn) {
        const me = this;
        if (!window.plupload || !me.uploader) {
            Utils.toastShort(DocHelper.waitUploadInitMsg);

            return;
        }
    },

    /**
     * uploader 实例一定要随本控件一起销毁
     */
    destroy() {
        const me = this;
        me.callParent(arguments);

        if (me.uploader) {
            me.uploader.destroy();
            delete me.uploader;
        }
    },

    /**
     * 开始上传
     */
    startUpload() {
        const me = this,
            uploader = me.uploader;
        if (uploader) {
            uploader.start();
        }
    },

    /**
     * 是否有上传失败的
     * @return {Boolean}
     */
    hasFailed() {
        const me = this,
            uploader = me.uploader;

        let files,
            i,
            status;
        if (uploader && (files = uploader.files)) {
            for (i = 0; i < files.length; i++) {
                status = files[i].status;
                if (status == plupload.FAILED) {
                    return true;
                }
            }
        }

        return false;
    },

    /**
     * 是否全部上传完毕
     * @param {Boolean} strict true: 成功才算完毕 / false: 成功和失败都算完毕
     * @return {Boolean}
     */
    isAllDone(strict) {
        const me = this,
            uploader = me.uploader;

        let files,
            i,
            status;
        if (uploader && (files = uploader.files)) {
            for (i = 0; i < files.length; i++) {
                status = files[i].status;
                if (status == plupload.QUEUED || status == plupload.UPLOADING || (strict && status == plupload.FAILED)) {
                    return false;
                }
            }
        }

        return true;
    },

    /**
     * 获取所有已上传成功的文件
     * @return {Object}
     */
    getAllDoneFilesData() {
        const me = this,
            uploader = me.uploader,
            store = me.getStore(),
            result = {
                Images: [],
                Thumbnails: []
            };

        if (uploader) {
            store.each(rec => {
                var fileId = rec.get('FileID'),
                    file = uploader.getFile(fileId);
                if (file.status == plupload.DONE) {
                    result.Images.push({
                        ID: rec.get('ID'),
                        FileName: rec.get('FileName'),
                        AttType: 'T',
                        FilePath: rec.get('FileName'),
                        Size: rec.get('Size')
                    });
                    result.Thumbnails.push({
                        ID: rec.get('ThumbID'),
                        FileName: rec.get('ThumbName'),
                        AttType: 'T',
                        FilePath: rec.get('ThumbName'),
                        Size: rec.get('ThumbSize')
                    });
                }
            });
        }

        return result;
    }
});