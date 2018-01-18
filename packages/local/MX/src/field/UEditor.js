Ext.define('MX.field.UEditor', {
    extend: 'Ext.field.Text',
    requires: [
        'MX.utils.ResourceMgr'
    ],
    xtype: 'mx_ueditor',

    /*statics: {
        isLoadingLib: false,
        loadLib() {
            // 加载 ueditor js 库
            var path = Ext.getResourcePath('UEditor/', 'shared', 'MX'),
                isDev = Ext.manifest.env == 'development',
                min = isDev ? '' : '.min';
            window.UEDITOR_HOME_URL = path;
            window.NEDITOR_UPLOAD = isDev ? 'http://localhost:8901/AIO5/JS/ueditor/net/controller.ashx' : '../JS/ueditor/net/controller.ashx';
            this.isLoadingLib = true;
            RM.load([
                `${path}neditor.config.js?v=${Ext.manifest.version}`,
                `${path}neditor.all${min}.js?v=${Ext.manifest.version}`
            ], {
                success: () => {
                    this.isLoadingLib = false;
                    var evt = new CustomEvent('ueditorlibsloaded', {
                        detail: null
                    });
                    window.dispatchEvent(evt);
                },
                async: false
            });
        }
    },*/

    cls: 'x-ueditor',

    config: {

        resizable: {
            edges: 'e s' //'e se s'
        },

        ue: {
            lazy: true,
            $value: true
        }
    },

    clearable: false,

    inputType: 'hidden',

    afterRender() {
        const me = this;
        me.callParent(arguments);

        const inputEl = me.inputElement,
            pNode = inputEl.dom.parentNode,
            bundleId = 'ueditorlibsloaded';

        //inputEl.hide();
        pNode.style.setProperty('width', '100%');

        if (!RM.isDefined(bundleId)) {
            const path = Ext.getResourcePath('UEditor/', 'shared', 'MX'),
                isDev = Ext.manifest.env == 'development',
                min = isDev ? '' : '.min',
                ver = Ext.manifest.version;
            window.UEDITOR_HOME_URL = path;
            window.NEDITOR_UPLOAD = isDev ? 'http://localhost:8901/AIO5/JS/ueditor/net/controller.ashx' : '../JS/ueditor/net/controller.ashx';

            const mask = Ext.widget('loadmask', {
                message: '正在加载编辑器',
                renderTo: me.bodyElement
            });

            RM.load([
                `${path}neditor.config.js?v=${ver}`,
                `${path}neditor.all${min}.js?v=${ver}`
            ], bundleId, {
                success() {
                    mask.destroy();
                },
                async: false
            });
        }
        RM.ready(bundleId, {
            success() {
                me.getUe();
            }
        });
    },

    /*onResize() {
        var me = this,
            ue = me.getUe();
        if (ue && me.ueInitialized) {
            //debugger
            var parent = Ext.fly(ue.container.parentNode),
                h = parent.getHeight();

            var height = h - Ext.fly(ue.ui.getDom('toolbarbox')).getHeight() - Ext.fly(ue.ui.getDom('bottombar')).getHeight() - 1;
            if (height > 0) ue.setHeight(height);
        }
    },*/
    applyUe(ue, oldUe) {
        if (ue === true) {
            ue = {};
        }
        if (oldUe) oldUe.destroy();

        var me = this,
            inputEl = me.inputElement,
            pNode = inputEl.dom.parentNode;
        if (!pNode) return null;

        // pNode 必须要有 id，否则 UEditor 无法渲染
        ue = UE.getEditor(Ext.id(pNode, 'ue-wrapper-'), Ext.apply({
            toolbars: [
                [
                    'fontsize',
                    'bold',
                    'italic',
                    'underline',
                    'strikethrough',
                    'forecolor',
                    'insertorderedlist',
                    'insertunorderedlist',
                    'justifyleft',
                    'justifycenter',
                    'justifyright',
                    'simpleupload',
                    'inserttable'
                ]
            ],
            //zIndex: 1000000, //for dialog
            autoFloatEnabled: false, //工具栏浮动
            autoHeightEnabled: false, //随内容自动高度
            autoClearinitialContent: true, //自动隐藏空值文本
            allHtmlEnabled: false,
            autoSyncData: false,
            elementPathEnabled: false, //底部的元素路径

            wordCount: false,
            //readonly: !!(me.getReadOnly() || me.getDisabled()),
            sourceEditor: 'codemirror',
            maximumWords: 100000,
            catchRemoteImageEnable: true,
            disabledTableInTable: false,
            popupZIndex: 1000000 //dialog 本身zIndex比较大，所以要设置这个ueditor的zIndex
        }, ue));

        return ue;
    },
    updateUe(ue) {
        if (ue) {
            var me = this,
                resizable = me.getResizable();

            me.updateReadOnly(!!(me.getReadOnly() || me.getDisabled()));

            ue.addListener('ready', function () {
                me.ueInitialized = true;

                me._updateUEDisabled();

                if (me._value !== undefined) {
                    me.updateValue(me._value);
                }

                //me.onResize();
            });

            //ue.addListener('blur', Ext.bind(me.ueBlur, me));
            ue.addListener('focus', Ext.bind(me.ueFocus, me));

            var fn = Ext.bind(me.ueContentChange, me);
            ue.addListener('catchremotesuccess', fn);
            ue.addListener('catchremoteerror', fn);

            // 清理图片地址的http://origin前缀
            ue.addListener('contentchange', function () {
                Ext.each(ue.document.body.querySelectorAll('img[src^=http]'), function (dom) {
                    var src = dom.getAttribute('src'),
                        _src = dom.getAttribute('_src');
                    if (Ext.String.startsWith(src, location.origin)) {
                        src = src.substr(location.origin.length);
                        dom.setAttribute('src', src);
                    }
                    if (Ext.String.startsWith(_src, location.origin)) {
                        _src = _src.substr(location.origin.length);
                        dom.setAttribute('_src', _src);
                    }
                });
            });
            ue.addListener('contentchange', fn);

            // 设置 resizer handle 的 z-index > ueditor 的 z-index，否则不能拖动
            for (var i in resizable.edgeMap) {
                resizable.edgeMap[i].dom.style.setProperty('z-index', '' + (ue.options.zIndex + 2));
            }
        }
    },
    ueContentChange() {
        var me = this;
        if (me._ue && me._ue.isReady) {
            var oldValue = me._value;
            me._value = me._ue.getContent();
            me.inputElement.value = me._value;

            if (me._value != oldValue) {
                me.fireEvent('change', me, me._value, oldValue);
            }
        }
    },

    onTouchBody(e) {
        var me = this;
        if (!me._ue) return;

        if (!me._ue.container.contains(e.target)) {
            var layer = document.getElementById('edui_fixedlayer');
            if (!layer || !layer.contains(e.target)) {
                me.ueContentChange();
                me.fireEvent('blur', me);

                Ext.get(document.body).un({
                    touchstart: 'onTouchBody',
                    scope: me
                });
            }
        }
    },
    /*ueBlur(){
        var me = this;
        
        me.ueContentChange();
        console.log('ue blur');
        me.fireEvent('blur', me);
    },*/
    ueFocus() {
        Ext.get(document.body).on({
            touchstart: 'onTouchBody',
            scope: this
        });
    },
    updateReadOnly(readOnly) {
        /*if(this._ue && this._ue.isReady) {
            this._ue[readOnly ? 'setDisabled' : 'setEnabled']();
            //Ext.fly(this._ue.ui.getDom('toolbarbox'))[readOnly ? 'hide' : 'show']();
        }*/
        var me = this,
            ue = me._ue;
        if (ue && ue.isReady) {
            me._updateUEDisabled();
        }
    },
    updateDisabled(disabled) {
        var me = this;
        me.callParent(arguments);

        me.updateReadOnly(disabled);
    },
    _updateUEDisabled() {
        var me = this,
            ue = me._ue;

        if (ue && ue.isReady) {
            var disabled = !!(me.getReadOnly() || me.getDisabled());
            //ue[disabled ? 'setDisabled' : 'setEnabled']();

            ue.body.contentEditable = !disabled;
            Ext.fly(ue.ui.getDom('toolbarbox'))[disabled ? 'hide' : 'show']();
        }
    },
    updateValue(v) {
        var me = this;
        me.callParent(arguments);

        if (me._ue && me._ue.isReady) {
            me._ue.setContent(me.prepareHtml(v));

            // bug fix: 有时 setValue 之后，iframe 突然不可见
            // 此处更改 iframe 一个不可见的样式，让 iframe 触发重绘
            var iframe = me._ue.iframe,
                rect = iframe.getBoundingClientRect();
            if (rect.left == 0 && rect.top == 0 && rect.right == 0 && rect.bottom == 0) {
                iframe.style.textShadow = 'rgba(0,0,0,0) 0 0 0';
                iframe.style.textShadow = '';
            }
        }
    },
    prepareHtml(html) { //ueditor中table没有tbody会导致样式错误
        var div = document.createElement('div'),
            v;
        div.innerHTML = html;
        v = div.innerHTML;
        div = null;
        return v;
    },

    hasResizable: true,
    defaultResizerCls: 'Ext.panel.Resizer',
    applyResizable(resizable) {
        if (resizable) {
            if (resizable === true) {
                resizable = {};
            }
            resizable = Ext.create(Ext.apply({
                xclass: this.defaultResizerCls,
                target: this
            }, resizable));

            this.on({
                beforeresizedragstart: 'onResizerDragStart',
                resizedragend: 'onResizerDragEnd',
                resizedragcancel: 'onResizerDragEnd',
                scope: this
            });
        }
        return resizable;
    },
    updateResizable(resizable, oldResizable) {
        if (oldResizable) {
            oldResizable.destroy();
        }
    },
    doDestroy() {
        var me = this;
        me.setResizable(null);
        me.setUe(null);
        Ext.get(document.body).un({
            touchstart: 'onTouchBody',
            scope: me
        });
        me.callParent();
    },

    onResizerDragStart() {
        var me = this,
            ue = me.getUe();
        if (ue) {
            // 覆盖住 ueditor 的 iframe, 否则无法拖动 resizer (往 ueditor 的方向)
            var scalelayer = ue.ui.getDom('scalelayer');
            scalelayer.style.cssText = 'position:absolute;top:0;bottom:0;left:0;right:0;z-index:' + (ue.options.zIndex + 1);
        }
    },
    onResizerDragEnd() {
        var me = this,
            ue = me.getUe();
        if (ue) {
            var scalelayer = ue.ui.getDom('scalelayer');
            scalelayer.style.cssText = '';
        }
    }

});