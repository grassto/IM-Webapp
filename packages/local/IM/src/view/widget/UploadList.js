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
        ui: 'action'
    }],

    cls: 'attach-dataview',

    items: [{
        xtype: 'dataview',
        itemId: 'attList',
        minHeight: 150,

        listeners: {
            childtap: 'attChildTap'
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
                    // '<a href="javascript:;" target="_blank" class="preview button action has-text x-fa fa-search-plus" style="{[(!Ext.isEmpty(values.ID) && AttachHelper.canPreview(values.FileName)) ? \'\' : \'visibility: hidden\']}">预览</a>',
                    '<a href="javascript:;" class="delete button flat x-fa fa-trash" title="删除"></a>',
                '</div>'
            ].join('')
    }],

    attChildTap(attList, location) {
        const record = location.record;
        if(!record) return;

        const e = location.record,
        t = Ext.fly(e.target);

        if(t.hasCls('delete')) {
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

        for(var i = 0; i < User.files.length; i++) {
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

    onBeforeHide() {
        User.files = [];
    }
});