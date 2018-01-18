/**
 * 评论列表
 * @author jiangwei
 */
Ext.define('Common.dataview.comment.AbstractList', {
    extend: 'Ext.List',
    requires: [
        'Common.field.Comment',
        'Common.dataview.comment.ListItem'
    ],

    itemsFocusable: false,

    classCls: 'comment-list',

    hoveredCls: 'hovered', // 去掉鼠标悬浮的背景色样式

    selectable: false,

    itemContentCls: 'fullwidth',
    itemConfig: {
        xtype: 'comment_listitem',
        commentFieldHolder: '.comment-form'
    },

    initialize() {
        const me = this;
        me.callParent(arguments);

        me.on({
            childtap: 'onTapChild',
            postreply: 'onPostReply',
            scope: me
        });
    },

    /**
     * 提交回复
     * @param {Common.dataview.comment.ListItem} listItem
     * @param {Common.field.Comment} field
     * @param {Object} vals
     */
    onPostReply(listItem, field, vals) {
        const me = this,
            record = listItem.getRecord();
        if (record) {
            vals.replyTo = record.get('LineNum');
            me.onPostCmt(field, vals, record);
        }
    },

    /**
     * 提交回复
     * @param {Common.field.Comment} field
     * @param {Object} vals 评论填写的内容，包括html、@人员、图片等
     * @param {Ext.data.Model} record 如果是回复，那么有这个参数
     */
    onPostCmt(field, vals, record) {
        const me = this,
            baseDoc = me.getBaseDoc(record);

        if (!baseDoc) return;

        me.ajax('ajax/OA.Comment.Data/PostCmt', {
            data: {
                P0: baseDoc,
                P1: vals.html,
                P2: vals.mentions,
                P3: vals.atts,
                P4: vals.replyTo || null
            },
            success(result) {
                result.IsMine = 'Y';
                result.IsFav = 'N';
                result.IsLike = 'N';
                result.Images = vals.atts.Images;
                result.Thumbnails = vals.atts.Thumbnails;

                field.clearValue();

                Utils.toastShort('评论成功');

                me.fireEvent('cmtposted', me, result);
                field.fireEvent('cmtposted', field, result);
            },
            maskTarget: me
        });
    },

    onTapChild(me, location) {
        const record = location.record;
        if (!record) return;

        const e = location.event,
            t = Ext.fly(e.target);

        if (t.is('a.del')) {
            Utils.confirm('确定删除这条评论?', function () {
                me.deleteCmt(record);
            });
        } else if (t.is('a.reply')) {
            me.toggleReply(location.item);
        } else if (t.is('a.favor')) {
            me.favorCmt(record, e.target);
        } else if (t.is('a.like')) {
            me.likeCmt(record, e.target);
        } else if (t.is('.r-reply')) {
            me.showByLineNum(record, t.getAttribute('to'));
        } else if (t.is('.author-link')) {
            // TODO: 转到个人中心
        } else if (t.is('.img-wrap>img') || t.is('.img-wrap')) {
            ImgUtil.viewImgs(location.item.element.down('.thumbs'));
        }
    },

    /**
     * 收藏评论
     * @param {Ext.data.Model} record
     */
    favorCmt(record, target) {
        const me = this,
            el = Ext.get(target),
            isFav = record.get('IsFav') == 'Y',
            api = `ajax/OA.Comment.Data/${isFav ? 'UnFavor' : 'Favor'}`;

        me.ajax(api, {
            data: {
                P0: record.get('CmtGuid')
            },
            success(result) {
                if (!isFav && result.IsFav) {
                    el.addCls('anim');
                    el.on({
                        animationend() {
                            this.removeCls('anim');
                        },
                        single: true
                    });
                }
                record.set({
                    IsFav: result.IsFav ? 'Y' : 'N',
                    FavCount: result.FavCount
                }, {
                    silent: true
                });
                if (result.IsFav) {
                    el.addCls('active').setHtml(`取消收藏(${result.FavCount})`);
                } else {
                    el.removeCls('active').setHtml(`收藏(${result.FavCount})`);
                }
            }
        });
    },

    /**
     * 赞评论
     * @param {Ext.data.Model} record
     */
    likeCmt(record, target) {
        const me = this,
            el = Ext.get(target),
            isLike = record.get('IsLike') == 'Y',
            api = `ajax/OA.Comment.Data/${isLike ? 'UnLike' : 'Like'}`;

        me.ajax(api, {
            data: {
                P0: record.get('CmtGuid')
            },
            success(result) {
                if (!isLike && result.IsLike) {
                    el.addCls('anim');
                    el.on({
                        animationend() {
                            this.removeCls('anim');
                        },
                        single: true
                    });
                }
                record.set({
                    IsLike: result.IsLike ? 'Y' : 'N',
                    LikeCount: result.LikeCount
                }, {
                    silent: true
                });
                if (result.IsLike) {
                    el.addCls('active').setHtml(`取消赞(${result.LikeCount})`);
                } else {
                    el.removeCls('active').setHtml(`赞(${result.LikeCount})`);
                }
            }
        });
    },

    /**
     * 删除评论
     * @param {Ext.data.Model} record
     */
    deleteCmt(record) {
        const me = this;
        me.ajax('ajax/OA.Comment.Data/Delete', {
            data: {
                P0: record.get('CmtGuid')
            },
            success(result) {
                if (result) {
                    me.getStore().remove(record);
                }
                me.fireEvent('cmtdeleted', me);
            },
            maskTarget: me
        });
    },

    buildCommonTpl(operations, fieldHolder) {
        const avatarHtml = AvatarMgr.getAvatarHtml();

        return `${avatarHtml}
<div class="comment-content-wrap">
    <div class="comment-hd">
        <a class="author-link {[values.IsMine == 'Y' ? 'mine' : '']}">{UserName}</a>
        <span class="line-num">{LineNum} 楼</span>
    </div>
    <div class="comment-content">
        {[minEmoji(values.ConHtml)]}
    </div>
    <tpl if="values.Thumbnails &amp;&amp; values.Thumbnails.length &gt; 0">
        <ul class="thumbs">
            <tpl for="Thumbnails">
                <li class="item">
                    <div class="img-wrap" data-index="{[xindex - 1]}">
                        <img src="{[DocHelper.buildEmbedSrc(values.ID)]}" data-original="{[DocHelper.buildEmbedSrc(parent.Images[xindex - 1].ID)]}" alt="{[parent.Images[xindex - 1].FileName]}"/>
                    </div>
                </li>
            </tpl>
        </ul>
        <div style="clear:both"></div>
    </tpl>
    <div class="comment-ft">
        <span class="date">{[Utils.dateToStr(values.CmtDate)]}</span>${operations || ''}
    </div>
    ${fieldHolder || ''}
</div>`;
    },

    /**
     * 显示某一楼层的评论内容
     * @param {Number} lineNum 楼层号
     * @param {Ext.data.Model} record
     */
    showByLineNum(record, lineNum) {
        const me = this;
        me.ajax('ajax/OA.Comment.Data/ReadOne', {
            data: {
                P0: me.getBaseDoc(record),
                P1: lineNum
            },
            success(result) {
                if (result && result.length) {
                    const tpl = me.buildCommonTpl(),
                        html = Ext.create('Ext.XTemplate', tpl).apply(result[0]);
                    Ext.Msg.alert(`${lineNum}楼的评论`, `<div class="comment-list">${html}</div>`);
                }
            },
            maskTarget: me
        });
    },

    /**
     * 切换显示/关闭 楼层的回复评论框
     * @param {Common.dataview.comment.ListItem} listItem
     */
    toggleReply(listItem) {
        listItem.toggleCommentField();
    }
});