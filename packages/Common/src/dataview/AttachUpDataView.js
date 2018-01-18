/**
 * 单据附件列表控件
 * @author jiangwei
 */
Ext.define('Common.dataview.AttachUpDataView', {
    extend: 'Ext.dataview.DataView',
    requires: [
        'Common.model.Attach'
    ],
    uses: [
        'Ext.SegmentedButton'
    ],
    xtype: 'attachupdataview',

    config: {
        /**
         * @cfg {Boolean} instantUpload
         * 添加文件后即上传
         */
        instantUpload: false,

        /**
         * @cfg {Boolean} enableSaveCabinet
         * 允许转存到个人文件柜, TODO
         */
        enableSaveCabinet: false, // true

        /**
         * @cfg {Boolean} enableInsert
         * 允许插入, 比如附件插入到富文本编辑器内
         */
        enableInsert: false,

        /**
         * @cfg {Boolean} enableDelete
         * 允许删除
         */
        enableDelete: true,

        /**
         * @cfg {Boolean} enableUpload
         * 允许添加并上传文件
         */
        enableUpload: true,

        /**
         * @cfg {Object/Boolean} menu
         * 右键菜单
         * 如果没有getMenu()函数和isMenuOwner属性，右键鼠标抬起之后，弹出的菜单就立即隐藏了
         * 模仿的是 Button 的 {@link Ext.Button#menu menu} 配置项
         */
        menu: {
            lazy: true,
            $value: true
        }
    },

    /**
     * @private
     */
    isMenuOwner: true,

    /**
     * @event insertfromattach
     * 启用插入功能之后触发此事件，
     * @param {Common.dataview.AttachUpDataView} this
     * @param {Common.model.Attach} record
     */

    /**
     * @property {Boolean} askWhenDelete
     * 删除时询问
     */
    askWhenDelete: true,

    cls: 'attach-dataview',

    items: [{
        xtype: 'panelheader',
        reference: 'header',
        docked: 'top',
        ui: 'list',
        title: {
            iconCls: 'x-fa fa-paperclip',
            text: '附件',
            flex: '0 1 auto',
            margin: '0 10 0 0'
        },
        items: [{
            xtype: 'button',
            itemId: 'btnBrowse',
            border: false,
            text: '上传文件',
            iconCls: 'x-fa fa-plus',
            preventDefaultAction: false
        }, {
            xtype: 'component',
            flex: 1
        }, {
            xtype: 'segmentedbutton',
            itemId: 'btnToggleStyle',
            items: [{
                iconCls: 'x-fa fa-list-ul',
                tooltip: '列表',
                value: 'list',
                pressed: true
            }, {
                iconCls: 'x-fa fa-th-large',
                tooltip: '缩略图',
                value: 'thumbnail'
            }]
        }]
    }],

    store: {
        model: 'Common.model.Attach'
    },

    buildTpl() {
        const me = this;
        if (!me.initialized || me.destroying) return;

        const enableSaveCabinet = me.getEnableSaveCabinet(),
            enableInsert = me.getEnableInsert(),
            enableDelete = me.getEnableDelete();

        let tpl;
        if(me.getInline()) {
            tpl = [
                '<div class="icon {[DocUtil.getMIMEIcon(values.Icon)]}">',
                    '<tpl if="values.FileID != values.ID">', // 本地文件
                        '<div class="progress-wrap">',
                            '<div class="progressbar" style="width:{Progress}%"></div>',
                            '<div class="progress">',
                                '<tpl if="values.Status == 0">',
                                    '', // 等待上传
                                '<tpl elseif="values.Status == 1">', // 上传中
                                    '{Progress}%',
                                '<tpl elseif="values.Status == 2">', // 上传成功
                                    '<div class="result-icon done"></div>',
                                '<tpl elseif="values.Status == 3">', // 上传失败
                                    '<div class="result-icon failed"></div><div class="text"><span class="ellipsis">{Error}</span></div>',
                                '</tpl>',
                            '</div>',
                        '</div>',
                    '</tpl>',
                '</div>',
                '<tpl if="Ext.isEmpty(values.ID)">', // 本地未上传或上传失败的文件
                    '<div class="name breakall ellipsis" title="{FileName}">{FileName}</div>',
                '<tpl else>',
                    '<a href="{[DocHelper.buildDocSrc(values.AttType, values.ID, values.FileName)]}" target="_blank" class="black name breakall ellipsis" title="{FileName}">{FileName}</a>',
                '</tpl>',
                '<tpl if="!Ext.isEmpty(values.ID) && DocHelper.canPreview(values.FileName)">',
                    '<a href="javascript:;" target="_blank" class="preview button action has-text x-fa fa-search-plus">预览</a>',
                '</tpl>',
                '<div class="size">{Size:fileSize}</div>',
                '<tpl if="Ext.isEmpty(values.ID)">', // 本地未上传或上传失败的文件
                    '<div class="delete-icon x-fa fa-times-circle"></div>',
                '</tpl>'
            ].join('');
        }
        else {
            tpl = [
                '<div class="x-layout-box x-align-center">',
                    '<div class="icon {[DocUtil.getMIMEIcon(values.Icon)]}" style="margin-right:10px"></div>',
                    '<div class="flex10" style="position:relative;width:10rem">',
                        '<tpl if="Ext.isEmpty(values.ID)">', // 本地未上传或上传失败的文件
                            '<div class="name ellipsis">{FileName}</div>',
                        '<tpl else>',
                            '<a href="{[DocHelper.buildDocSrc(values.AttType, values.ID, values.FileName)]}" target="_blank" class="black name ellipsis">{FileName}</a>',
                        '</tpl>',
                    '</div>',
                    '<tpl if="values.FileID != values.ID">', // 本地文件
                        '<div class="status">',
                            '<tpl if="values.Status == 0">',
                                '<div class="result-icon wait">等待上传</div>',
                            '<tpl elseif="values.Status == 1">', // 上传中
                                '<div class="progress-wrap">',
                                    '<div class="progressbar" style="width:{Progress}%"></div>',
                                '</div>',
                            '<tpl elseif="values.Status == 2">', // 上传成功
                                '<div class="result-icon done">上传成功</div>',
                            '<tpl elseif="values.Status == 3">', // 上传失败
                                '<div class="result-icon failed"><span class="ellipsis">{Error}</span></div>',
                            '</tpl>',
                        '</div>',
                    '</tpl>',
                    '<div class="size" style="width:5rem">{Size:fileSize}</div>',
                    '<a href="javascript:;" target="_blank" class="preview button action has-text x-fa fa-search-plus" style="{[(!Ext.isEmpty(values.ID) && DocHelper.canPreview(values.FileName)) ? \'\' : \'visibility: hidden\']}">预览</a>',
                    '<tpl if="!Ext.isEmpty(values.ID)">',
                        enableInsert ? '<a href="javascript:;" class="insert button flat">插入</a>' : '',
                        enableSaveCabinet ? '<a href="javascript:;" class="save button flat">转存</a>' : '',
                    '</tpl>',
                    enableDelete ? '<a href="javascript:;" class="delete button flat x-fa fa-trash" title="删除"></a>' : '',
                '</div>'
            ].join('');
        }

        me.setItemTpl(tpl);
    },

    updateEnableUpload(enable) {
        const me = this,
            btnBrowse = me.down('#btnBrowse');
        btnBrowse.setHidden(!enable);

        if(enable && !me.uploader) {
            me.initUploader(btnBrowse);
        }
    },

    updateEnableDelete(enable) {
        this.buildTpl();
    },

    updateEnableInsert(enable) {
        this.buildTpl();
    },

    updateEnableSaveCabinet(enable) {
        this.buildTpl();
    },

    updateInline (inline) {
        const me = this;
        me.callParent(arguments);

        me.buildTpl();
    },

    applyMenu(menu) {
        const me = this;
        if(menu == true) {
            menu = {};
        }
        if (menu) {
            Ext.applyIf(menu, {
                ownerCmp: me,
                xtype: 'menu',
                items: [{
                    text: '预览',
                    itemId: 'preview',
                    iconCls: 'x-fa fa-search-plus',
                    handler(item) {
                        me.onPreviewAttach(item.getParent().record);
                    }
                }, {
                    text: '插入',
                    itemId: 'insertFrom',
                    handler(item) {
                        me.onInsertFromAttach(item.getParent().record);
                    }
                }, {
                    text: '转存',
                    itemId: 'saveCabinet',
                    handler(item) {
                        me.onSaveCabinetAttach(item.getParent().record);
                    }
                }, {
                    text: '删除',
                    itemId: 'delete',
                    iconCls: 'x-fa fa-trash',
                    handler(item) {
                        me.onDeleteAttach(item.getParent().record);
                    }
                }]
            });
            menu = Ext.create(menu);
        }

        return menu;
    },

    initialize() {
        const me = this,
            store = me.getStore();
        me.callParent(arguments);

        me.on({
            childtap: 'onTapChild',
            childlongpress: 'onLongPress',
            scope: me
        });
        me.element.on({
            delegate: '.x-dataview-item',
            contextmenu: 'onContextMenu',
            scope: me
        });

        me.element.on({
            tap: 'onElTap',
            taphold: 'onElTapHold',
            scope: me
        });
        store.on({
            remove: 'onDVStoreRemove',
            clear: 'onDVStoreClear',
            scope: me
        });

        const btnToggleStyle = me.down('#btnToggleStyle'),
            style = Utils.getLsItem('AttachUpDataViewStyle') || 'list';
        btnToggleStyle.on({
            change: 'onChangeStyle',
            scope: me
        });
        btnToggleStyle.setValue(style);

        me.initialized = true;

        me.buildTpl();
    },

    onElTap() {
        if(this._menu && !this.lastTapHold) {
            this._menu.hide();
        }
        delete this.lastTapHold;
    },
    onElTapHold() {
        this.lastTapHold = new Date();
    },

    /**
     * 切换控件列表/缩略图样式
     * @param {Ext.SegmentedButton} seg SegmentedButton
     * @param {String} value
     * @param {String} oldValue
     */
    onChangeStyle(seg, value, oldValue) {
        this.setInline(value == 'thumbnail');

        Utils.setLsItem('AttachUpDataViewStyle', value);
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
            let fileId;
            Ext.each(records, rec => {
                fileId = rec.get('FileID');
                if (rec.get('ID') == fileId) { // 说明是远程的文件

                } else { // 本地未上传或者已上传的文件
                    uploader.removeFile(fileId);
                }
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

    /**
     * 长按事件
     * @param {Common.dataview.AttachUpDataView} me
     * @param {Object} location
     */
    onLongPress(me, location) {
        if(!me.getInline()) return;
        const record = location.record;
        if (record) {
            const touch = location.event.touch;
            if(record) me._showCtxMenu(touch.pageX, touch.pageY, record);
        }
    },

    /**
     * 右键菜单事件处理函数
     * @param {Ext.event.Event} e
     * @param {HTMLElement} el
     */
    onContextMenu (e, el) {
        const me = this;
        if(!me.getInline()) return;
        const idx = me.getItemIndex(el);
        if(idx >= 0) {
            const record = me.getStore().getAt(idx);
            if(record) {
                me.select(record, false);
                me._showCtxMenu(e.pageX, e.pageY, record);
                e.preventDefault();
            }
        }
    },

    /**
     * 显示右键/长按菜单
     * @param {Number} x
     * @param {Number} y
     * @param {Common.model.Attach} record
     */
    _showCtxMenu(x, y, record) {
        const me = this,
            menu = me.getMenu();
        menu.record = record;

        const isRemote = !Ext.isEmpty(record.get('ID')),
            canPreview = DocHelper.canPreview(record.get('FileName'));
        menu.down('#preview').setHidden(!isRemote || !canPreview);
        menu.down('#insertFrom').setHidden(!isRemote || !me.getEnableInsert());
        menu.down('#delete').setHidden(!isRemote || !me.getEnableDelete());
        menu.down('#saveCabinet').setHidden(!isRemote || !me.getEnableSaveCabinet());

        const region = new Ext.util.Region(y, x + 1, y + 1, x);
        menu.showBy(region, 'tl-bl?');
    },

    /**
     * 预览附件
     * @param {Common.model.Attach} record
     */
    onPreviewAttach(record) {
        DocHelper.previewDoc(record.get('AttType'), record.get('ID'), record.get('FileName'));
    },

    /**
     * 插入附件到其它地方
     * 触发事件 insertfromattach
     * @param {Common.model.Attach} record
     */
    onInsertFromAttach(record) {
        const me = this;
        me.fireEvent('insertfromattach', me, record); // 插入
    },

    /**
     * 转存附件到个人文件柜
     * @param {Common.model.Attach} record
     */
    onSaveCabinetAttach(record) {
        const me = this;
        // TODO
    },

    /**
     * 删除附件
     * @param {Common.model.Attach} record
     */
    onDeleteAttach(record) {
        const me = this;
        if(me.askWhenDelete) {
            Utils.confirm('确定要删除吗?', () => {
                me.doDeleteRecord(record);
            });
        }
        else {
            me.doDeleteRecord(record);
        }
    },
    doDeleteRecord(record) {
        const me = this,
            store = me.getStore(),
            id = record.get('ID');
        if(!Ext.isEmpty(id)) { // 需要删除远端附件
            const callback = () => {
                store.remove(record);
            };
            if(me.fireEvent('removeremotefile', me, id, callback) !== true) { // dealed
                callback();
            }
        }
        else {
            store.remove(record);
        }
    },

    onTapChild(me, location) {
        const record = location.record;
        if (!record) return;

        const e = location.event,
            t = Ext.fly(e.target);

        if (t.hasCls('delete') || t.hasCls('delete-icon')) {
            me.onDeleteAttach(record);
        }
        else if (t.hasCls('insert')) {
            me.onInsertFromAttach(record);
        }
        else if (t.hasCls('save')) {
            me.onSaveCabinetAttach(record);
        }
        else if (t.hasCls('preview')) {
            me.onPreviewAttach(record);
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

        DocHelper.ensurePlUploadlibs(() => {
            me.doInitUploader(btnBrowse);
        });
    },

    doInitUploader(btnBrowse) {
        const me = this;
        var uploader = new plupload.Uploader({
            required_features: 'send_browser_cookies',

            browse_button: btnBrowse.buttonElement.dom, // you can pass in id...
            container: btnBrowse.element.dom, // ... or DOM Element itself

            url: Utils.joinPath(config.httpUrl, 'Doc/plupload/EmFileUp.ashx'),

            chunk_size: '1mb',
            unique_names: true,
            filters: {
                prevent_duplicates: true,
                max_file_size: '40mb',
                mime_types: [DocUtil.imageFilter, DocUtil.archiveFilter, DocUtil.docFilter, DocUtil.otherFilter]
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
            store.add({
                FileID: file.id,
                FileName: file.name,
                Size: file.size,
                Icon: DocUtil.getExtension(file.name),
                Status: 0 // 未上传
            });
        });
        if(me.getInstantUpload()) {
            uploader.start();
        }
    },

    /**
     * 单个文件上传中
     * @param {plupload.Uploader} uploader
     * @param {plupload.File} file
     */
    onUploadProgress(uploader, file) {
        const me = this,
            store = me.getStore(),
            record = store.getById(file.id);

        if(record) {
            record.set({
                Progress: file.percent,
                Status: 1 // 上传中
            });
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
            res = result.response;

        const data = {
            Progress: 100,
            Status: 2 // 上传成功
        };
        if (!Ext.isEmpty(res)) {
            var obj = Ext.decode(res);
            console.log('onFileUploaded', obj);

            if (obj.success) {
                Ext.apply(data, obj.result);
            }
        }
        if(record) {
            record.set(data);
            me.fireEvent('fileuploaded', me, {
                ID: record.get('ID'),
                FileName: record.get('FileName'),
                Size: record.get('Size')
            });
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
            const res = err.response,
                store = me.getStore(),
                record = store.getById(err.file.id);

            errMsg = '上传失败';
            let resObj;
            if (!Ext.isEmpty(res)) {
                resObj = Ext.decode(res);
                if (!resObj.success) {
                    errMsg = resObj.message;
                }
                console.log('onUploadError', resObj);
            }
            if(record) {
                record.set({
                    Error: errMsg,
                    Status: 3 // 上传出错
                });
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

        if(!me.getEnableUpload()) {
            Utils.toastShort('禁止上传文件');

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
        Ext.destroy(me._menu);
    },

    setAttachment(attachment) {
        const me = this;
        me.clear();
        if(!Ext.isEmpty(attachment)) {
            Ext.each(attachment, attach => {
                if(Ext.isEmpty(attach.FileID)) {
                    attach.FileID = attach.ID;
                }
            });
            me.getStore().setData(attachment);
        }
    },
    clear() {
        const me = this;
        me.getStore().removeAll();
    }

});