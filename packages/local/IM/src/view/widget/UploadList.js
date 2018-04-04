Ext.define('IM.widget.UploadList', {
    extend: 'Ext.Dialog',

    requires: [
        'Ext.List',
        'IM.Model.Attach'
    ],


    defaultListenerScope: true,

    layout: 'fit',

    title: '上传文件',
    closable: true,
    closeAction: 'hide',

    buttonAlign: 'center',
    buttons: [{
        text: '发送',
        ui: 'action',
        handler: 'onUploadFile'
    }],

    cls: 'attach-dataview',

    items: [{
        xtype: 'dataview',
        itemId: 'attList',
        minHeight: 150,

        listeners: {
            // childtap: 'attChildTap'
        },

        store: {
            model: 'IM.Model.Attach'
        },
        itemTpl: [
            '<div class="x-layout-box x-align-center">',
            '<div class="icon {[FileUtil.getMIMEIcon(values.Icon)]}" style="margin-right:10px"></div>',
            '<div class="flex10" style="position:relative;width:10rem">',
            '<tpl if="Ext.isEmpty(values.ID)">', // 本地未上传或上传失败的文件
            '<div class="name ellipsis">{FileName}</div>',
            '<tpl else>',
            '<a href="{[AttachHelper.buildDocSrc(values.AttType, values.ID, values.FileName)]}" target="_blank" class="black name ellipsis">{FileName}</a>',
            '</tpl>',
            '</div>',
                '<div style="display:none">',
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
            '</div>',
            '</tpl>',
            '<div class="size" style="width:5rem">{Size:fileSize}</div>',
            // '<a href="javascript:;" target="_blank" class="preview button action has-text x-fa fa-search-plus" style="{[(!Ext.isEmpty(values.ID) && AttachHelper.canPreview(values.FileName)) ? \'\' : \'visibility: hidden\']}">预览</a>',
            // '<a href="javascript:;" class="delete button flat x-fa fa-trash" title="删除"></a>',
            '</div>'
        ].join('')
    }],

    // 不需要
    attChildTap(attList, location) {
        const record = location.record;
        if (!record) return;

        const e = location.event,
            t = Ext.fly(e.target);

        if (t.hasCls('delete')) {
            this.onDeleteAtt(record);
        }
    },
    // 删除附件
    onDeleteAtt(record) {
        this.down('#attList').getStore().remove(record);
    },

    listeners: {
        beforehide: 'onBeforeHide',
        beforeshow: 'onBeforeShow'
    },

    onBeforeShow() {
        const me = this,
            store = me.down('#attList').getStore();

        var records = [];

        for (var i = 0; i < User.files.length; i++) {
            records.push({
                FileID: User.files[i].id,
                FileName: User.files[i].name,
                Size: User.files[i].size,
                Status: 0,
                Icon: FileUtil.getExtension(User.files[i].name)
            });
        }
        store.add(records);
    },

    // 这个在其他地方处理了
    onBeforeHide() {
        this.down('#attList').getStore().removeAll();
    },

    /**
     * 文件上传，显示进度条。入口只有这里
     */
    onUploadFile() {
        const me = this,
            files = User.files;
        me.hide();

        if (files.length > 0) {
            var chatView = Ext.Viewport.lookup('IM').lookup('im-main').down('#chatView'),
            store = chatView.getStore();
            for (var i = 0; i < files.length; i++) {
                // 页面显示上传中
                var record = store.add({
                    msg_type: MsgType.FileMsg,
                    fileID: User.files[i].id,
                    fileName: User.files[i].name,
                    fileSize: User.files[i].size,
                    fileStatus: 1,
                    senderName: ChatHelper.getName(User.ownerID),
                    ROL: 'right',
                    updateTime: new Date()
                });
                ChatHelper.onScroll(chatView);
                SocketEventHelper.isShowTime(store, record);

                // 文件分开上传
                var formData = new FormData();
                formData.append('files', files[i].getNative());
                formData.append('chat_id', User.crtChannelId);
                var ajax = $.ajax({
                    url: Config.httpUrlForGo + 'files',
                    type: 'post',
                    data: formData,
                    contentType: false,
                    processData: false,
                    // async: false,
                    xhrFields: {
                        withCredentials: true
                    },
                    xhr: function () { // 不能加async：false，否则不会走progress这个方法
                        var xhr = $.ajaxSettings.xhr();
                        if (me.onprogress && xhr.upload) {
                            xhr.upload.fileID = User.files[i].id;
                            xhr.upload.addEventListener('progress', me.onprogress, false);
                            return xhr;
                        }
                    },
                    success: function (data) {
                        record[0].set('fileStatus', 2);
                    },
                    failure: function() {
                        record[0].set('fileStatus', 3);
                    }
                });

                record[0].set('ajax', ajax); // 存在record中，方便去终止

            }

        }
    },

    // 上传进度
    onprogress(evt) {
        var loaded = evt.loaded; // 已经上传大小情况
        var tot = evt.total; // 附件总大小
        var per = Math.floor(100 * loaded / tot); // 已经上传的百分比.

        var store = Ext.Viewport.lookup('IM').lookup('im-main').down('#chatView').getStore();
        if(store) {
            var index = store.find('fileID', evt.currentTarget.fileID),
            record = store.getAt(index);
            record.set('fileProgress', per);
        }
    }
});