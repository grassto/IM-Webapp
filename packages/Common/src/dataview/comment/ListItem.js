Ext.define('Common.dataview.comment.ListItem', {
    extend: 'Ext.dataview.SimpleListItem',
    xtype: 'comment_listitem',

    /**
     * 放置评论框的dom选择器
     * @property {String} commentFieldHolder
     */
    commentFieldHolder: null,

    /**
     * 显示/关闭 评论框
     */
    toggleCommentField() {
        const me = this;
        if (me.commentField) {
            me.closeCommentField();
        } else {
            me.openCommentField();
        }
    },

    /**
     * 显示 评论框
     */
    openCommentField() {
        const me = this,
            holder = me.element.down(me.commentFieldHolder);

        if (holder) {
            let field = me.commentField;
            if (!field) {
                me.commentField = field = Ext.create({
                    xtype: 'commentfield',
                    itemId: 'commentField',
                    cancelButton: {
                        handler: 'closeCommentField',
                        scope: me
                    },
                    richTextArea: {
                        placeholder: '写下你的回复'
                    },
                    listeners: {
                        postcmt: 'onPostCmt',
                        cmtposted: 'onCmtPosted',
                        resize: 'ajustHeight',
                        scope: me
                    }
                });
            }

            field.element.appendTo(holder);
            holder.setStyle('display', 'block');

            // 创建"回复 N楼 @XXX"节点
            const node = me.generateReplyToNode(me.getRecord());
            field.getRichTextArea().insertObject(node[0], node[1]);
        }
    },

    /**
     * 关闭 评论框
     */
    closeCommentField() {
        const me = this,
            holder = me.element.down(me.commentFieldHolder);

        if(holder) holder.setStyle('display', null);

        Ext.destroy(me.commentField);
        delete me.commentField;
    },

    /**
     * 生成 回复 N楼 @XXX 的节点
     * @param {Ext.data.Model} record
     */
    generateReplyToNode(record) {
        const userSign = record.get('UserSign'),
            userName = record.get('UserName'),
            lineNum = record.get('LineNum'),
            nodeContent = `<span class="r-at r-atU">回复 <span class="r-reply" to="${lineNum}">${lineNum}楼</span> @${userName}</span>`,
            nodeValue = `ID=${Utils.toHex(userSign)}&Name=${Utils.toHex(userName)}&Type=5500&LineNum=${Utils.toHex(lineNum)}`;

        return [nodeContent, nodeValue];
    },

    /**
     * 点击评论按钮
     * @param {Common.field.Comment} field
     * @param {Object} vals
     */
    onPostCmt(field, vals) {
        const me = this,
            list = me.getParent();
        if (list) {
            const foundReplyTo = vals.mentions.some(x => x.hasOwnProperty('LineNum'));

            if (!foundReplyTo) {
                const node = me.generateReplyToNode(me.getRecord()),
                    dom = Ext.DomHelper.createDom(node[0]);
                dom.setAttribute('data-value', node[1]);

                vals.html = `${dom.outerHTML}&nbsp;${vals.html}`;

                vals.mentions.unshift(node[1]);
            }

            list.fireEvent('postreply', me, field, vals);
        }
    },

    /**
     * 评论提交成功之后
     * @param {Common.field.Comment} field
     * @param {Object} vals
     */
    onCmtPosted(field, vals) {
        this.closeCommentField();
    },

    /**
     * 自适应高度
     */
    ajustHeight() {
        const list = this.getParent();
        if (list && list.ajustHeight) {
            list.ajustHeight();
        }
    },

    doDestroy() {
        const me = this;

        me.closeCommentField(); // 连同 CommentField 一起销毁
        this.callParent();
    }
});