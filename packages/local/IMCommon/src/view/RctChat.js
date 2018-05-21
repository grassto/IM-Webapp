Ext.define('IMCommon.view.RctChat', {
    extend: 'Ext.List',
    xtype: 'rctChat',
    
    requires: [
        'IMCommon.model.RctChat'
    ],
    
    store: {
        model: 'IMCommon.model.RctChat',

        sorters: [{
            property: 'toTop',
            direction: 'DESC'
        }, { // 按时间降序排序
            property: 'last_post_at',
            direction: 'DESC'
        }]
    },

    cls: 'rctChat',

    initialize() {
        const me = this;
        me.callParent(arguments);

        me.getStore().on({
            add : 'onStoreChg',
            update : 'onStoreChg',
            destroyable: true,
            scope: me
        });
    },

    onStoreChg(store, records, index, eOpts) {
        store.sort();
    },

    itemTpl: [
        '<div class="itemRight">',
            '<div class="wrapAva">',
                '<tpl if="values.type == \'D\'">', // 头像
                    '<a class="avatar link-avatar firstletter " letter="{[AvatarMgr.getFirstLetter(values.name)]} " style="{[AvatarMgr.getColorStyle(values.name)]}"></a>',
                '<tpl else>',
                    '<div class="mergeAvatar" style="float:left;{[AvatarMgr.getColorStyle(values.name)]}">',
                    '{[AvatarMgr.getMergeDiv(values.name)]}',
                    '</div>',
                '</tpl>',
                '<a class="RecentUnRead" unRead="{unReadNum}" style="cursor:default;display:{[values.isUnRead?"block":"none"]}"></a>', // 未读
            '</div>',
            '<div class="evt">',
                '<p>{last_post_at}</p></br>', // 最后发送时间
                '<p style="display:{[values.type=="D"?"block":"none"]};">{status}</p>', // 状态（不需要了吧）
            '</div>',
            '<div class="displayInfo">',
                '<div class="displayName">{name}</div>', // 会话标题
                '<tpl if="values.type == \'D\'">', // 显示会话内容 单人
                    '<tpl if="values.last_msg_type == \'T\'">',
                        '<div>{last_post_msg}</div>', // 文字
                    '<tpl elseif="values.last_msg_type == \'F\'">',
                        '<div>[文件]</div>', // 文件
                    '<tpl elseif="values.last_msg_type == \'I\'">',
                        '<div>[图片]</div>', // 图片
                    '</tpl>',
                '<tpl elseif="values.type == \'G\'">', // 群聊提示信息
                    '<div>{last_post_msg}</div>',
                '<tpl else>', // 多人
                    '<tpl if="values.last_msg_type == \'T\'">',
                        '<div>{last_post_name}：{last_post_msg}</div>', // 文字
                    '<tpl elseif="values.last_msg_type == \'I\'">',
                        '<div>{last_post_name}：[图片]</div>', // 图片
                    '<tpl elseif="values.last_msg_type == \'F\'">',
                        '<div>{last_post_name}：[文件]</div>', // 文件
                    '</tpl>',
                '</tpl>',
            '</div>',
        '</div>'
    ].join(''),
});
