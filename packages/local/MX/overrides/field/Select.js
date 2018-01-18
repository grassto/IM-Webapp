/**
 * bug fix：setDisplayField 之后不会更新下拉列表的 itemTpl
 */
Ext.define(null, { // 'MX.override.field.Select'
    override: 'Ext.field.Select',
    requires: [
        'MX.field.Hidden'
    ],

    config: {
        clearable: true,
        nameCtrl: null // 自动创建一个 Name 字段的控件
    },

    updateDisplayField(displayField) {
        this.callParent(arguments);

        if (this.config.itemTpl === false) {
            var itemTpl = `<span class="x-list-label">{${displayField}:htmlEncode}</span>`;
            this.setItemTpl(itemTpl);
            if (this.pickerType == 'floated' && this._picker) {
                this._picker.setItemTpl(itemTpl);
            }
        }
    },

    applyNameCtrl(config) {
        if (config) {
            if (config === true) {
                config = {};
            } else if (Ext.isString(config)) {
                config = {
                    name: config
                };
            }

            return Ext.factory(config, 'MX.field.Hidden', this._nameCtrl);
        }

        return null;
    },

    updateNameCtrl(nameCtrl, oldNameCtrl) {
        const me = this,
            parent = me.getParent();
        if (oldNameCtrl) {
            Ext.destroy(oldNameCtrl);
        }
        if (nameCtrl && parent) {
            parent.add(nameCtrl);
            me.on({
                change(f) {
                    const sel = f.getSelection();
                    if(sel) {
                        nameCtrl.setValue(sel.get(f.getDisplayField()));
                    }
                },
                scope: me
            });
        }
    }
});