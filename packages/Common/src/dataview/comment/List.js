/**
 * 评论列表
 * @author jiangwei
 */
Ext.define('Common.dataview.comment.List', {
    extend: 'Common.dataview.comment.AbstractList',
    requires: [
        'MX.plugin.ListPagination',
        'Common.model.comment.Record'
    ],
    mixins: [
        'MX.mixin.AutoHeightList'
    ],
    xtype: 'commentlist',

    defaultListenerScope: true, // this 作为事件处理函数的 scope

    config: {
        /**
         * @cfg {Boolean} enableDeleteOther
         * 当前登录用户是否可以删除其他人的评论
         */
        enableDeleteOther: false,

        /**
         * @cfg {Boolean} enableCmt
         * 允许评论和回复
         */
        enableCmt: true,

        /**
         * {
         *     ObjType: 对象号,
         *     MDK: 凭证性质 (选填),
         *     DBName: 集团化 (选填),
         *     StgGuid: 自定义业务编号 (选填),
         *     KeyValue: CompositeKey 序列化得到的 Xml 字符串，可以用 Helper.buildCompositeXML() 生成,
         *     Key1: 主键值1,
         *     Key2: 主键值2 (选填),
         *     Key3: 主键值3 (选填),
         *     Key4: 主键值4 (选填),
         *     BaseDesc: 描述
         * }
         */
        baseDoc: null
    },

    cls: 'comment-list',

    scrollable: false,

    emptyText: '没有评论',

    store: {
        mode: 'Common.model.comment.Record',
        remoteSort: true,
        remoteFilter: true,

        proxy: {
            type: 'ajax',
            api: 'store/OA.Comment.Data/PageQueryComments'
        },

        pageSize: 15
    },

    plugins: {
        listpagination: true
    },

    buildTpl() {
        const me = this;
        if (!me.initialized || me.destroying) return;

        const enableDeleteOther = me.getEnableDeleteOther(),
            enableCmt = me.getEnableCmt();

        const tpl = me.buildCommonTpl(`
<tpl if="values.IsMine == 'Y'">
    <span class="like comment-op-link x-fa fa-thumbs-up">赞({LikeCount})</span>
    <span class="favor comment-op-link x-fa fa-star">收藏({FavCount})</span>
    <a class="del comment-op-link x-fa fa-trash">删除</a>
<tpl else>
    <a class="like comment-op-link x-fa fa-thumbs-up {[values.IsLike == 'Y' ? 'active' : '']}">{[values.IsLike == 'Y' ? '取消赞' : '赞']}({LikeCount})</a>
    <a class="favor comment-op-link x-fa fa-star {[values.IsFav == 'Y' ? 'active' : '']}">{[values.IsFav == 'Y' ? '取消收藏' : '收藏']}({FavCount})</a>
    ${enableCmt ? '<a class="reply comment-op-link x-fa fa-reply">回复</a>' : ''}
    ${enableDeleteOther ? '<a class="del comment-op-link x-fa fa-trash" style="color:red">删除</a>' : ''}
</tpl>`, '<div class="comment-form"></div>');

        me.setItemTpl(tpl);
    },

    updateEnableDeleteOther(enable) {
        this.buildTpl();
    },
    updateEnableCmt(enable) {
        const me = this,
            commentField = me.down('#commentField');
        if(enable) {
            if(!commentField) {
                me.insert(0, {
                    xtype: 'commentfield',
                    itemId: 'commentField',
                    showInEmptyState: x => true, // 即使列表为空的时候也显示
                    scrollDock: 'bottom',
                    listeners: {
                        postcmt: 'onPostCmt',
                        resize: 'ajustHeight',
                        scope: me
                    }
                });
            }
        }
        else {
            if(commentField) {
                commentField.destroy();
            }
        }
        me.buildTpl();
    },

    updateBaseDoc(baseDoc) {
        const me = this,
            store = me.getStore();
        store.getProxy().setExtraParam('data', baseDoc ? Ext.encode({
            P1: baseDoc
        }) : undefined);
        store.removeAll();
    },

    initialize() {
        const me = this;

        /*me.insert(0, {
            xtype: 'commentfield',
            itemId: 'commentField',
            hidden: !me.getEnableCmt(),
            showInEmptyState: x => true, // 即使列表为空的时候也显示
            scrollDock: 'bottom',
            listeners: {
                postcmt: 'onPostCmt',
                resize: 'ajustHeight',
                scope: me
            }
        });*/

        me.callParent(arguments);

        me.initialized = true;

        me.buildTpl();

        me.on({
            cmtposted: 'onCommentPosted',
            scope: me
        });
    },

    /**
     * 用于 MX.mixin.AutoHeightList
     */
    getExtraHeight() {
        return 50;
    },

    /**
     * 回复提交成功后 触发
     * @param {Common.dataview.comment.List} me
     * @param {Object} vals
     */
    onCommentPosted(me, vals) {
        me.insertCmt(vals);
    },

    /**
     * 提交完毕后把评论插入列表，模拟刷新
     * @param {Object} data
     */
    insertCmt(data) {
        if (data) {
            data.ConHtml = window.minEmoji(data.ConHtml);
            this.getStore().insert(0, data);
        }
    }
});