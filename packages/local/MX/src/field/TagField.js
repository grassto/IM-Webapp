/**
 * TagField
 * For use in ExtJS 6.x Modern
 * @author Brandon Ryall-Ortiz <brandon.ryall@facilitiesexchange.com>, <brandon@guilt.io>
 * Facilities Exchange www.facilitiesexchange.com
 **/
Ext.define('MX.field.TagField', {
	extend: 'Ext.field.Picker',
	xtype: 'mx_tagfield',

	requires: [
		'Ext.picker.Picker'
	],

	isField: true,

	cls: 'tag-field',

	config: {
		store: null,
		displayField: 'text',
		valueField: 'id',
		floatedPicker: {
			xtype: 'boundlist',
			infinite: false,
			// BoundListNavigationModel binds to input field
			// Must only be enabled when list is visible
			navigationModel: {
				disabled: true
			},
			scrollToTopOnRefresh: false,
			loadingHeight: 70,
			maxHeight: 300,
			floated: true,
			axisLock: true,
			hideAnimation: null,
			selectable: 'multi'
		},
		selectOnTab: true
	},

	selected: {},

	listeners: {
		keyup() {
			const me = this,
				v = me.getInputValue();

			if (v.length) {
				this.getStore().filterBy((rec) => {
					return rec.get(me.getDisplayField()).match(new RegExp(me.getInputValue(), 'gi')) !== null;
				});
			} else {
				this.getStore().clearFilter();
			}

			me.expand();
		}
	},

	applyStore: function (store) {
		if (store) {
			store = Ext.data.StoreManager.lookup(store);
		}

		return store;
	},

	updateStore: function (store, oldStore) {
		//var me = this;

		if (oldStore) {
			if (oldStore.getAutoDestroy()) {
				oldStore.destroy();
			}
		}
	},

	onSelect(t, recs) {
		let i = 0;
		const len = recs.length;
		while (i < len) {
			var id = recs[i].get(this.getValueField());
			if (!this.selected.hasOwnProperty(id)) {
				this.selected[id] = recs[i];
				this.addTag(recs[i]);
			}
			i++;
		}
		this.validate();
	},

	onDeselect(t, recs) {
		let i = 0;
		const len = recs.length;
		while (i < len) {
			delete this.selected[recs[i].get(this.getValueField())];
			this.removeTag(recs[i]);
			i++;
		}
		this.validate();
	},

	addTag(tag) {
		const el = document.createElement('span');
		el.id = `${this.id}-tag-${tag.get(this.getValueField())}`;
		el.innerHTML = `${tag.get(this.getDisplayField())} <span class="tagfield-item-close x-fa fa-times-circle" aria-hidden="true">&nbsp;</span>`;
		el.className = 'tagfield-item';

		el.querySelector('span').addEventListener('click', function () {

			this.getPicker().onItemDeselect([tag]);
			this.getPicker().setItemSelection([tag], false);
		}.bind(this));

		this.beforeInputElement.append(el);
	},

	removeTag(tag) {
		const el = this.beforeInputElement.down(`#${this.id}-tag-${tag.get(this.getValueField())}`);
		if (el) {
			el.destroy();
		}
		if (this._picker) {
			this._picker.deselect(tag);
		}

		if (!this.expanded) {
			this.syncLabelPlaceholder(true);
		}
	},

	createFloatedPicker() {
		const me = this;
		const result = Ext.merge({
			ownerCmp: me,
			store: me.getStore(),
			itemTpl: `{${me.getDisplayField()}}`,
			listeners: {
				select: {
					fn: me.onSelect,
					scope: me
				},
				deselect: {
					fn: me.onDeselect,
					scope: me
				}
			}
		}, me.getFloatedPicker());

		return result;
	},

	getValue() {
		var keys = Object.keys(this.selected),
			i = 0,
			len = keys.length,
			values = [];

		while (i < len) {
			values.push(this.selected[keys[i]].get(this.getValueField()));
			i++;
		}

		return values;
	},

	setValue(v) {
		const selection = [];

		if (!(v instanceof Array)) {
			v = [v];
		}

		const len = v.length,
			store = this.getStore();
		let i = 0,
			f;
		while (i < len) {
			f = store.getAt(store.findExact(this.getValueField(), v[i]));
			if (f) {
				selection.push(f);
			}
			i++;
		}

		if (selection.length) {
			this.getPicker().select(selection);
		}

		if (!this.expanded) {
			this.syncLabelPlaceholder(true);
		}
	},

	privates: {
		syncLabelPlaceholder: function (animate) {
			let inside;
			this._animPlaceholderLabel = animate;
			if (this.rendered) {
				if (Object.keys(this.selected).length > 0) {
					inside = false;
				} else {
					inside = !this.hasFocus || this.getDisabled() || this.getReadOnly();
				}
				this.setLabelInPlaceholder(inside);
			}

			this._animPlaceholderLabel = false;
		}
	},

	updateInputValue() {}, // Do nothing!

	isInputField: false,
	isSelectField: true,

	validate(skipLazy) {
		const me = this;
		let empty, errors, field, record, validity, value;

		if (me.isConfiguring && me.validateOnInit === 'none') {
			return true;
		}

		if (!me.getDisabled() || me.getValidateDisabled()) {
			errors = [];

			if (me.isInputField && !me.isSelectField) {
				value = me.getInputValue();
				empty = !value;
				validity = empty && me.inputElement.dom.validity;
				if (validity && validity.badInput) {
					errors.push(me.badFormatMessage);
					empty = false;
				}
			} else {
				value = me.getValue();
				empty = value === '' || value == null || !value.length;
			}

			if (empty && me.getRequired()) {
				errors.push(me.getRequiredMessage());
			} else if (!errors.length) {
				if (!empty) {
					value = me.parseValue(value, errors);
				}
				if (!errors.length) {
					field = me._validationField;
					record = me._validationRecord;

					if (field && record) {
						field.validate(value, null, errors, record);
					}

					if (!empty) {
						me.doValidate(value, errors, skipLazy);
					}
				}
			}
			if (errors.length) {
				me.setError(errors);

				return false;
			}
		}

		me.setError(null);

		return true;
	},

	onPickerShow: function (picker) {
		this.callParent([picker]);
		// Enable the picker's key mappings in this field's KeyMap,
		// unless it's an edge picker that doesn't support keyboard
		if (this.pickerType === 'floated') {
			picker.getNavigationModel().enable();
		}
	},
	onPickerHide: function (picker) {
		var navModel;

		this.callParent([picker]);
		// Set the location to null because there's no onFocusLeave
		// to do this because the picker does not get focused.
		// Disable the picker's key mappings in this field's KeyMap
		if (!picker.destroying && this.pickerType === 'floated') {
			navModel = picker.getNavigationModel();
			//navModel.setLocation(null);
			navModel.disable();
		}
	}
});