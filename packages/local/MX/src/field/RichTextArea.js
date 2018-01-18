/* global ddt */

/**
 * 富文本框，主要用于评论框，支持 @
 */
// <debug>
(function () {
    var logger;
    if (typeof console === 'undefined') {
        logger = {
            log() {}
        };
    } else {
        logger = console;
    }

    window.ddt = {
        on() {
            ddt._display = true;
        },
        off() {
            ddt._display = false;
        },
        log() {
            if (ddt._display) logger.log.apply(logger, arguments);
        }
    };

    ddt.off(); // 开关
})();
// </debug>

Ext.define('MX.field.RichTextArea', {
    extend: 'Ext.field.Text',
    uses: [
        'Ext.dataview.BoundList'
    ],
    xtype: 'richtextareafield',

    cls: Ext.baseCSSPrefix + 'rich-textarea',

    tag: 'div',

    config: {
        triggerChars: [],
        regexes: [],

        selectOnTab: true, // 用于 BoundListNavigationModel

        picker: {
            lazy: true,
            $value: true
        }
    },

    /**
     * whether or not the autocomplete menu is open
     */
    expanded: false,

    /**
     * the current trigger entry
     *
     * used in the autcomplete select callback to replace the trigger word
     * with the selected value
     */
    currentTrigger: false,

    /**
     * saved copy of current range
     *
     * @see insertObject()
     */
    currentRange: false,

    /**
     * flag used to let onKeyUp know not to process ENTER.
     *
     * @see _insertSelection()
     */
    selectionEntered: false,

    /**
     * flag used to indicate whether or not to do regex replacements
     *
     * there are some chicken and eggs problems with autocomplete and the ENTER key.
     */
    doRegex: true,

    getInputTemplate() {
        const tpl = this.callParent(arguments);

        tpl.contenteditable = true;

        return tpl;
    },

    applyPicker(config, oldList) {
        if (config) {
            if (config === true) {
                config = {};
            }
            Ext.applyIf(config, {
                infinite: false,

                ownerCmp: this,
                ownerField: this, // 用于 Ext.dataview.BoundListNavigationModel

                navigationModel: {
                    disabled: true
                },
                scrollToTopOnRefresh: false,
                loadingHeight: 70,
                maxHeight: 300,
                floated: true,
                axisLock: true,
                hideAnimation: null,
                hidden: true
            });
        }

        return Ext.factory(config, 'Ext.dataview.BoundList', oldList);
    },

    updatePicker(list) {
        if (list) {
            list.on({
                show: 'onPickerShow',
                hide: 'onPickerHide',
                select: 'onPickerSelect',
                scope: this
            });
        }
    },

    updateInputValue(value) {
        var me = this,
            inputElement = me.inputElement.dom;

        if (inputElement.value !== value) {
            inputElement.innerHTML = value;
        }

        me.callParent(arguments);
    },
    updateReadOnly(a) {
        this.callParent(arguments);
        this.updateFieldAttribute('contenteditable', !a ? true : null);
    },
    updateDisabled(a) {
        this.callParent(arguments);
        this.updateFieldAttribute('contenteditable', !a ? true : null);
    },
    updateFieldAttribute(attribute, newValue) {
        var input = this.inputElement;

        if (!Ext.isEmpty(newValue, true)) {
            input.dom.setAttribute(attribute, newValue);
        } else {
            input.dom.removeAttribute(attribute);
        }
    },
    initialize() {
        var me = this;
        me.callParent(arguments);

        //var dom = me.inputElement.dom;
        //dom.addEventListener('mouseup', Ext.bind(me.onMouseUp, me), false);

        //dom.addEventListener('keyup', Ext.bind(me.onKeyUp, me), false);
        //dom.addEventListener('keypress', Ext.bind(me.onKeyPress, me), false);
        //dom.addEventListener('keydown', Ext.bind(me.onKeyDown, me), false);
        //dom.addEventListener('focus', Ext.bind(me.onFocus, me), false);
        //dom.addEventListener('blur', Ext.bind(me.onBlur, me), false);

        me.inputElement.on({
            mouseup: 'onMouseUp',
            scope: me
        });
    },

    destroy() {
        var me = this;
        me.callParent(arguments);

        Ext.destroy(me._picker);
    },

    onPickerShow(ac) {
        const me = this,
            navModel = ac.getNavigationModel();
        me.expanded = true;

        me.touchListeners = Ext.getDoc().on({
            // Do not translate on non-touch platforms.
            // mousedown will blur the field.
            translate: false,
            touchstart: 'collapseIf',
            scope: me,
            delegated: false,
            destroyable: true
        });
        me.hideEventListeners = Ext.on({
            mousedown: 'collapseIf',
            scope: me,
            destroyable: true
        });

        navModel.enable();
        navModel.setLocation(0);
    },
    collapseIf(e) {
        var me = this;

        // If what was mousedowned on is outside of this Field, then collapse.
        if (!me.destroyed && (!e.within(me.bodyElement, false, true) && !me.owns(e.target))) {
            me.collapse();
        }
    },

    onPickerHide(ac) {
        const me = this,
            navModel = ac.getNavigationModel();
        me.expanded = false;
        Ext.destroy(me.hideEventListeners, me.touchListeners);

        navModel.setLocation(null);
        navModel.disable();
    },

    onPickerSelect(list, record) {
        var me = this;

        me._insertSelection(me.currentTrigger, {
            content: `<span class="r-at r-atU">@${record.get('Name')}<span class="r-at-type">(${record.get('TypeDesc')})</span></span>`,
            value: `ID=${Utils.toHex(record.get('ID'))}&Name=${Utils.toHex(record.get('Name'))}&Type=${Utils.toHex(record.get('Type'))}`
        });

        me.collapse();
    },

    /**
     * 用于 Ext.dataview.BoundListNavigationModel
     */
    collapse() {
        this.getPicker().hide();
    },

    /**
     * @private
     */
    maybeCollapse(event) {
        this.collapse();
    },

    onInput(e) {

        var me = this,
            inputEl = me.inputElement,
            value = inputEl.getHtml();

        inputEl.dom.value = value;

        me.callParent(arguments);
    },

    onKeyDown(event) {
        var me = this,
            which = event.which();
        me.callParent(arguments);

        // <debug>
        /* console.log('keydown', event, {
            startOffset: me.currentRange.startOffset,
            startValue: me.currentRange.startContainer.nodeValue,
            endOffset: me.currentRange.endOffset,
            endValue: me.currentRange.endContainer.nodeValue
        }, me.currentRange.startContainer.nodeValue);*/
        // </debug>

        if (which == 0) {
            console.error('onKeyDown(): WEBKIT BUG: Keycode 0 returned. probably delete on Linux keypad but can\'t be sure');

            return;
        }

        // <debug>
        ddt.log(`onKeyDown(): with key "${which}":`, event);
        // </debug>

        var object = null,
            location = null,
            sel = null;

        // if the autocomplete menu is open don't do anything with up and down arrow keys
        if (!me.expanded) {

            // we may have a multiple char selection in which case we want to let the browser handle
            // it. (see onKeyUp)
            sel = document.getSelection();

            if (sel.rangeCount) {

                var range = sel.getRangeAt(0);

                if (range.collapsed == false && which != Ext.event.Event.ENTER) {
                    // <debug>
                    ddt.log('onKeyDown(): multi-char range. skipping onKeyDown processing');
                    // </debug>
                    return;
                }
            }

            var retval,
                caret;

            switch (which) {

                case Ext.event.Event.BACKSPACE:

                    // <debug>
                    ddt.log('onKeyDown(): BACKSPACE pressed');
                    // </debug>

                    retval = false;

                    if ((retval = me._backspaceZeroSpace()) == 'stop') {
                        // <debug>
                        ddt.log('onKeyDown(): BACKSPACE: stop word encountered. stopping');
                        // </debug>
                        return;
                    }

                    // is the previous character an embedded object?
                    // <debug>
                    ddt.log('onKeyDown(): BACKSPACE: checking to see if we are next to an object');
                    // </debug>

                    if (object = me._checkForAdjacentObject('left')) {

                        // <debug>
                        ddt.log('onKeyDown(): backspacing over an object :', object);
                        // </debug>

                        me.deleteObject(object.domNode);

                        // if we deleted any whitespace characters prevent the browser from
                        // deleting whatever the next character is
                        if (object.preventDefault) {
                            event.preventDefault();
                        }

                    }

                    // <debug>
                    ddt.log('onKeyDown(): BACKSPACE: done');
                    // </debug>

                    break;

                case Ext.event.Event.DELETE:

                    // <debug>
                    ddt.log('onKeyDown(): DELETE pressed');
                    // </debug>

                    retval = false;

                    if ((retval = me._deleteZeroSpace()) == 'stop') {
                        // <debug>
                        ddt.log('onKeyDown(): DELETEE: stop word encountered. stopping');
                        // </debug>
                        return;
                    }

                    // is the next character an embedded object?
                    // <debug>
                    ddt.log('onKeyDown(): DELETE: checking to see if we are next to an object');
                    // </debug>

                    if (object = me._checkForAdjacentObject('right')) {

                        // <debug>
                        ddt.log('onKeyDown(): DELETE: deleting an object :', object);
                        // </debug>

                        me.deleteObject(object.domNode);

                        // after the delete we may be edge up against another object.
                        event.preventDefault();

                    }

                    // <debug>
                    ddt.log('onKeyDown(): DELETE done');
                    // </debug>

                    break;

                case Ext.event.Event.LEFT:

                    // <debug>
                    ddt.log('onKeyDown(): LEFT pressed');
                    // </debug>

                    // where is the caret now?
                    caret = me._getCaretPosition();

                    // <debug>
                    ddt.log(`onKeyDown(): _getCaretPosition() returned node "${caret.domNode}" with offset "${caret.offset}"`);
                    // </debug>

                    // are we immediately next to an object? Jump the cursor over it.
                    if (object = me._isEmbeddedObject(caret.domNode)) {

                        // <debug>
                        ddt.log('onKeyDown(): setting caret before object: ', object);
                        // </debug>

                        // me._setCaretPositionRelative( object, 'before' );
                        me._setCaretPositionRelative(object.previousSibling, 'end');

                        // FIXME: prevent the caret from jumping an additional space.
                        //
                        // In WebKit in the left arrow case without preventDefault() the
                        // caret jumps an additional position. HOWEVER, in the right case
                        // with it enabled the caret does not jump over the end of the span
                        // even if I select it.
                        event.preventDefault();

                        break;
                    }

                    // We are not right next to an object but there may be some number of zero width
                    // characters and/or textnodes between the current caret position and the object
                    //
                    // _moveCaret() may move the cursor into another container in which
                    // case we do NOT try to jump over any next object.
                    if (location = me._moveCaret(caret.domNode, caret.offset, 'left')) {

                        // <debug>
                        ddt.log('onKeyDown(): LEFT: _moveCaret returned:', location);
                        // </debug>

                        // unless we've just moved into a container (i.e. new line) , we want to jump over any
                        // embedded objects we've arrived next to.
                        if (location.checkForObjects && (object = me._checkForAdjacentObject('left'))) {

                            // <debug>
                            ddt.log('onKeyDown(): LEFT: jumping over object to the left');
                            // </debug>

                            me._setCaretPositionRelative(object.domNode.previousSibling, 'end');

                            event.preventDefault();

                        }

                        // HACK: special fix for WebKit. When jumping out of containers don't let the
                        // browser do it's thing otherwise it'll jump one too far. Same for Mozilla.
                        if (location.preventDefault) {
                            // <debug>
                            ddt.log('onKeyDown(): Leaving a container, etc. preventing default');
                            // </debug>

                            event.preventDefault();
                        }

                        // If it's a text node we want to let the browser move the cursor for us.
                    }

                    // <debug>
                    ddt.log('onKeyDown(): LEFT done');
                    // </debug>

                    break;

                case Ext.event.Event.RIGHT:

                    // <debug>
                    ddt.log('onKeyDown(): RIGHT pressed');
                    // </debug>

                    // where is the caret now?
                    caret = me._getCaretPosition();

                    // <debug>
                    ddt.log(`onKeyDown(): _getCaretPosition() returned node "${caret.domNode}" with offset "${caret.offset}"`);
                    // </debug>

                    // are we next to an object? Jump the cursor over it.
                    if (object = me._isEmbeddedObject(caret.domNode)) {

                        // <debug>
                        ddt.log('onKeyDown(): isEmbedded true. moving to beginning of nextSibling');
                        // </debug>

                        me._setCaretPositionRelative(object.nextSibling, 'beginning');

                        // FIXME: prevent the caret from jumping an additional space.
                        // This does not make sense to me. In the LEFT arrow case without the preventDefault
                        // the cursor jumps an additional space in WebKit. However, in the RIGHT arrow case
                        // if I preventDefault, the caret cannot be moved outside of the span when jumping over
                        // an object. Clearly there is something I do not understand.
                        // event.preventDefault();
                        break;

                    }

                    // _moveCaret() may move the cursor into another container in which
                    // case we do NOT try to jump over any next object.
                    if (location = me._moveCaret(caret.domNode, caret.offset, 'right')) {

                        // <debug>
                        ddt.log('onKeyDown(): RIGHT: after skipping over zero space. checking for adjacent objects :', location);
                        // </debug>

                        // if we are right next to an object we want to jump the
                        // cursor over it but ONLY if we are not moving onto a new line (i.e. moving into
                        // a child container)
                        if (location.checkForObjects && (object = me._checkForAdjacentObject('right'))) {

                            // <debug>
                            ddt.log('onKeyDown(): RIGHT: right arrowing over an object');
                            // </debug>

                            me._setCaretPositionRelative(object.domNode.nextSibling, 'beginning');

                            // FIXME: see above. preventingDefault() here breaks jumping across objects.
                            // event.preventDefault();
                        }

                        // HACK: special fix for WebKit. When jumping into or out of containers don't let the
                        // browser do it's thing otherwise it'll jump one too far. Same for Mozilla and a BR.
                        if (location.preventDefault) {
                            // <debug>
                            ddt.log('onKeyDown(): entering or leaving a container. preventing default');
                            // </debug>

                            event.preventDefault();
                        }

                    }

                    // <debug>
                    ddt.log('onKeyDown(): RIGHT done.');
                    // </debug>

                    break;

                case Ext.event.Event.ENTER:

                    // the trick that took so long to figure out is that we can actually prevent the default
                    // behavior of the browser by preventing the default behavior in the onKeyDown event.
                    //
                    // Without this, each major browser puts different markup in the div.
                    //
                    // @see _handleEnter()
                    me._handleEnter(event);

                    // prevent default behavior
                    return false;

                default:
                    // keypress is triggered before the input value is changed
                    clearTimeout(me.searching);
                    me.searching = setTimeout(function () {
                        var triggerEntry = me._checkForTrigger();
                        me.execTrigger();
                    }, 200);
                    break;

            } // end of switch
        } else {
            if (which == Ext.event.Event.UP || which == Ext.event.Event.DOWN || which == Ext.event.Event.ENTER) {
                event.preventDefault();

                return true;
            }
        }

        if (which == Ext.event.Event.TAB) {
            event.preventDefault();

            return true;
        }
    },
    onKeyPress(event) {
        // <debug>
        // console.log('keypress', event);
        // </debug>

        var me = this,
            which = event.which();
        me.callParent(arguments);

        // <debug>
        ddt.log(`onKeyPress(): with key "${which}" event: `, event);
        // </debug>

        // if the autocomplete menu is open don't do anything with up and down arrow keys
        if (!this.expanded) {

            switch (which) {

                case Ext.event.Event.SPACE:

                    // on pressing SPACE check to see if we match any regexes.
                    // <debug>
                    ddt.log('onKeyPress(): SPACE pressed. Checking regexes');
                    // </debug>

                    this._checkRegexes(event);

                    break;

                case Ext.event.Event.ENTER:

                    // we have to be careful not to let regexes conflict with the autocomplete
                    // dropdown. The dropdown catches the keypress event for ENTER but does not, for
                    // whatever reason, stop propagation so we get that keypress here.
                    // <debug>
                    ddt.log('onKeyPress(): ENTER pressed. Checking regexes');
                    // </debug>

                    this._checkRegexes(event);

                    break;

                default:
                    break;
            }
        } else {
            if (which == Ext.event.Event.UP || which == Ext.event.Event.DOWN || which == Ext.event.Event.ENTER) {
                event.preventDefault();

                return true;
            }
        }
    },
    execTrigger() {
        var me = this,
            triggerEntry = me.currentTrigger;

        if (triggerEntry == false || triggerEntry == null) {

            // <debug>
            ddt.log('execTrigger(): no trigger');
            // </debug>

            return;
        }

        // <debug>
        ddt.log('execTrigger(): got source event with trigger ', triggerEntry);
        // </debug>

        // we're passing in the trigger term outside the normal autocomplete
        // path, so the minLength option in autocomplete doesn't work. We'll set it
        // as 2 here for now.
        if (triggerEntry.word.length >= triggerEntry.minChars) {

            // <debug>
            ddt.log('execTrigger(): invoking response');
            // </debug>

            var response = function (data) {
                var ac = me.getPicker();
                if (data.length > 0) {

                    triggerEntry.store = Ext.StoreMgr.lookup(triggerEntry.store);
                    ac.setStore(triggerEntry.store);
                    ac.setItemTpl(triggerEntry.itemTpl);
                    ac.getStore().setData(data);

                    var caretPosition = me._getCaretPosition();
                    if (caretPosition) {
                        var region = me.getTextNodeRegion(caretPosition.domNode);
                        if (region) {
                            ac.showBy(region, 'tl-bl?');
                        }
                    }
                } else {
                    if (ac.getStore()) {
                        ac.getStore().clearData();
                    }
                    ac.hide();
                }
            };
            // this causes the autocomplete menu to be populated
            triggerEntry.callback(triggerEntry.word, response);

        }
    },
    onKeyUp(event) {
        // <debug>
        /* console.log('keyup', event, {
            startOffset: this.currentRange.startOffset,
            startValue: this.currentRange.startContainer.nodeValue,
            endOffset: this.currentRange.endOffset,
            endValue: this.currentRange.endContainer.nodeValue
        }, this.currentRange.startContainer.nodeValue);*/
        // </debug>

        var me = this,
            which = event.which();
        me.callParent(arguments);

        if (which == 0) return;

        // <debug>
        ddt.log(`onKeyUp(): with key "${which}" event: `, event);
        // </debug>

        // if the autocomplete menu is open don't do anything with up and down arrow keys
        if (!this.expanded) {

            // save the range in case we click out of the div and then want to insert
            // something.
            this._saveRange();

            // we may have a multiple char selection
            if (this._handleRangeSelection()) {
                // let the user do with the range whatever they want. The browser will
                // take care of it.
                return;

            }
            // if we are at the end of an object, highlight it to indicate
            // that it'll get deleted on backspace.
            this._highlightObject();

            var caret,
                objectNode;
            // we may arrive here because of arrow key and other events.
            switch (which) {

                case Ext.event.Event.ENTER:

                    // <debug>
                    ddt.log('onKeyUp(): ENTER: pressed. Closing autocomplete menu.');
                    // </debug>

                    // we close the autocomplete menu on any of these keys.
                    // this.element.autocompletehtml('close');
                    this.collapse();
                    this.currentTrigger = false;

                    // FIXME: see  _insertSelection(). jQuery (or maybe my) bug where this
                    // callback is still getting invoked even when enter is pressed in the autocomplete
                    // dropdown.
                    if (this.selectionEntered) {
                        this.selectionEntered = false;
                        break;
                    }

                    this._onEnterFixUp(event);

                    // <debug>
                    ddt.log('onKeyUp(): ENTER. done.');
                    // </debug>

                    break;

                case Ext.event.Event.SPACE: // 1
                case Ext.event.Event.TAB:
                case Ext.event.Event.HOME:
                case Ext.event.Event.END:

                    // we close the autocomplete menu on any of these keys.
                    // this.element.autocompletehtml('close');
                    this.collapse();
                    this.currentTrigger = false;

                    // <debug>
                    ddt.log('onKeyUp(): closed autocomplete menu');
                    // </debug>

                    break;

                case Ext.event.Event.LEFT:
                case Ext.event.Event.RIGHT:
                case Ext.event.Event.BACKSPACE:

                    // <debug>
                    ddt.log('onKeyUp(): arrow/backspace pressed');
                    // </debug>

                    // using CNTRL-LEFT AND RIGHT it's possible to get inside an object.
                    caret = this._getCaretPosition();
                    objectNode = this._clickedOnObject(caret.domNode);

                    if (objectNode != false) {

                        // <debug>
                        ddt.log('onKeyUp(): currently in an object. moving caret before object');
                        // </debug>

                        this._setCaretPositionRelative(objectNode, 'before');

                        return;
                    }

                    // have we moved beyond the limit of a trigger character?
                    if (!this._checkForTrigger()) {

                        // <debug>
                        ddt.log('onKeyUp(): outside of trigger');
                        // </debug>

                        // this.element.autocompletehtml('close');
                        this.collapse();
                        this.currentTrigger = false;

                    } else {

                        // <debug>
                        ddt.log('onKeyUp(): in trigger');
                        // </debug>

                        // autocomplete BUG? If we do not pass a value for the second argument here
                        // search is not invoked.
                        //
                        // We call this here to force the autocomplete menu open if we move the cursor
                        // over a trigger word. autocomplete does not do that automatically.
                        // this.element.autocompletehtml('search', 'test');
                        this.execTrigger();
                    }

                    break;

                case Ext.event.Event.UP:
                case Ext.event.Event.DOWN:

                    // it's always something. WebKit, if you delete the newline at the beginning
                    // of the line (wrapping div) will delete any embedded contenteditable=false spans
                    // when joining the lines. Ugh.
                    //
                    // So this means everything needs to be contenteditable so we need to enforce NOT
                    // moving into the middle of an embedded object ourselves.
                    //
                    // So if the user moves up or down into an object move the cursor to the beginning of
                    // the object.
                    caret = this._getCaretPosition();
                    objectNode = this._clickedOnObject(caret.domNode);

                    if (objectNode != false) {
                        this._setCaretPositionRelative(objectNode, 'before');
                    }

                    break;

                default:
                    break;

            } // end of switch over keys.
        } else {
            if (which == Ext.event.Event.UP || which == Ext.event.Event.DOWN || which == Ext.event.Event.ENTER) {
                event.preventDefault();

                return true;
            }
        }
    },
    onMouseUp(event) {
        // <debug>
        ddt.log('onMouseUp');
        // </debug>

        var triggerEntry;

        // make sure the autocomplete menu is closed.
        // this.element.autocompletehtml('close');
        this.collapse();

        // scrollbar causes this event to fire so we need to guard against the fact
        // the editable div may not have focus.
        if (this.inputElement.dom !== document.activeElement) { // is(':focus')
            // <debug>
            ddt.log('onMouseUp(): the div does not have focus');
            // </debug>
            return true;
        }

        // save the range in case we click out of the div and then want to insert
        // something.
        this._saveRange();

        if (this._handleRangeSelection()) {
            // let the user do with the range whatever they want. The browser will
            // take care of it.
            return;
        }

        // <debug>
        ddt.log('onMouseUp(): did we click on an object?:', event.target);
        // </debug>

        var objectNode = this._clickedOnObject(event.target);

        if (objectNode != false) {

            // <debug>
            ddt.log('onMouseUp(): preventing default action');
            // </debug>

            this._setCaretPositionRelative(objectNode, 'before');

            event.preventDefault();
        }

        // if we are at the end of an object, highlight it to indicate
        // that it'll get deleted on backspace.
        this._highlightObject();

        if (triggerEntry = this._checkForTrigger()) {

            // <debug>
            ddt.log(`onMouseUp(): calling autocomplete from onMouseUp handler with term "${triggerEntry.word}"`);
            // </debug>

            // FIXME: for some reason when _checkForTrigger() is called from the autocomplete source callback
            // the selection is lost. So _checkForTrigger() sets a class level copy which source checks. Ugly.
            // this.element.autocompletehtml('search', 'test');
            this.execTrigger();
        }
    },

    privates: {
        handlePaste(event) {
            var me = this,
                inputMask = me.getInputMask();

            if (!inputMask) {
                var e = event.browserEvent,
                    text = '';
                if (e && e.clipboardData && e.clipboardData.getData) { // Webkit, FF
                    text = e.clipboardData.getData('text/plain');

                    if (document.queryCommandSupported('insertText')) {
                        document.execCommand('insertText', false, text);
                    } else {
                        document.execCommand('paste', false, text);
                    }
                    //this.insertText(text);
                    this._checkRegexes(event);
                }

                event.preventDefault();
            }

            me.callParent(arguments);
        }
    },
    onFocus(event) {
        this.callParent(arguments);
        // <debug>
        ddt.log('onFocus(): top');
        // </debug>

        if (this.expanded) {

            // <debug>
            ddt.log('onFocus(): autocomplete menu is open');
            // </debug>
            event.preventDefault();

            return false;
        }
    },
    onBlur(event) {
        this.callParent(arguments);
        // <debug>
        ddt.log('onBlur(): top');
        // </debug>

        var nodes = this.inputElement.dom.childNodes;
        if (nodes.length == 1 && nodes[0].nodeType == 3 && escape(nodes[0].nodeValue) == '%u200B') {
            this.clear();
        }
    },


    _onEnterFixUp(event) {

        var caret = this._getCaretPosition();

        // <debug>
        ddt.log('_onEnterFixUp(): current DOM Node is:', caret.domNode);
        // </debug>

        // ---------------------------------------
        // Fixup any previous sibling or container
        // ---------------------------------------
        // in WebKit the previousSibling should always be null since we should be at the beginning
        // of a DIV containing the new line. For this case, we examine the previous sibling of
        // our containing DIV. Chrome is fond of inserting empty <DIV><BR></DIV>'s.
        //
        // FireFox/Mozilla on the other hand inserts <BR _moz_dirty=""> which means there should always
        // be a previousSibling.
        if (caret.domNode.previousSibling == null) {

            // <debug>
            ddt.log('_onEnterFixUp(): previous sibling is NULL. Likely a WebKit browser.');
            // </debug>

            this._checkSibling(caret.domNode.parentNode, 'prev');

            // is our parents previousSibling a container?
        } else if (caret.domNode.previousSibling.nodeType != 3) {

            // <debug>
            ddt.log('_onEnterFixUp(): Previous sibling is NOT a text node');
            // </debug>

            // not matter what it is, make sure it's wrapped in empty text nodes.
            this._insertEmptyNode(caret.domNode.previousSibling, 'before');
            this._insertEmptyNode(caret.domNode.previousSibling, 'after');

        }

        // ---------------------------------------
        // Fixup nodes moved to the new line
        // ---------------------------------------
        // if we are Mozilla, instead of a <DIV> it adds <BR _moz_dirty="">
        // WebKit is known for adding <DIV><BR></DIV> for a new line.
        //
        // in either case, we'll make sure there are empty text nodes around it for good measure.
        // if ($(caret.domNode).filter('[_moz_dirty]').length != 0) {
        if (caret.domNode.nodeType != 3 && caret.domNode.getAttribute('_moz_dirty') !== null) {

            // <debug>
            ddt.log('_onEnterFixUp(): mozilla BR. wrapping in textnodes');
            // </debug>

            this._insertEmptyNode(caret.domNode, 'before');
            this._insertEmptyNode(caret.domNode, 'after');

        } else if (caret.domNode.nodeName == 'BR') {

            // this is likely webKit. We'll attempt to replace the BR with a space.
            // <debug>
            ddt.log('_onEnterFixUp(): webkit BR.');
            // </debug>

            // this seems to muck up webkit. ENTER keys starts inserting nested DIVs. Not
            // sure why.
            // this._insertEmptyNode( caret.domNode, 'before' );
            // $( caret.domNode ).remove();
        } else if (this._isEmbeddedObject(caret.domNode)) {

            // if we are an object, make sure there's a node in front of us and select it so the cursor
            // doesn't try to get in the span of the object.
            var textnode = this._insertEmptyNode(caret.domNode, 'before');
            this._selectTextNode(textnode, 0);

        } else if (caret.domNode.nodeName == 'DIV' || caret.domNode.nodeName == 'SPAN' || caret.domNode.nodeName == 'P') {

            // This branch is not likely to happen as most container should have textnodes
            // in front of them, but just in case is this a container? (could maybe be an embedded
            // object that we have just pressed ENTER immediately before.)
            //
            // else we are webkit or MSIE. webkit adds a DIV, MSIE a P.
            // make sure the first child is a text node.
            if (caret.domNode.childNodes.length == 0) {

                // empty container.
                // <debug>
                ddt.log('_onEnterFixUp(): adding zero width space to empty container (div/p)');
                // </debug>

                this._insertEmptyNode(caret.domNode, 'child');

            } else if (caret.domNode.childNodes[0].nodeType != 3) {

                // first node of the container is NOT a textnode.
                // <debug>
                ddt.log(`_onEnterFixUp(): first child of container is a "${caret.domNode.childNodes[0].nodeName}"`);
                // </debug>

                // make sure it's wrapped in textnodes
                this._insertEmptyNode(caret.domNode.childNodes[0], 'before');
                this._insertEmptyNode(caret.domNode.childNodes[0], 'after');

            }

        }
    },
    // end of _onEnterFixUp()
    /**
     * a simpler approach to handling newlines.
     *
     * Instead of attempting to work around all the various contenteditable browser quirks
     * we can force all browsers to use the same markup by preventing default behavior from
     * onKeyDown.
     *
     * By hooking the onKeyDown event and preventing the default action we can manually insert
     * the break and adjust the cursor positon. This greatly simplifies traversing of the
     * content area on delete, backspace, enter and arrow keys.
     *
     * NOTE: on the subject of scrolling we are using the jQuery scrollTo plugin. It does not
     * work with a <BR> so instead we add a temporary <span> which we use as an anchor for
     * scrolling. This anchor is deleted in _onEnterFixUp().
     *
     * @param {Object} event event object
     *
     * @return {Boolean} false on error
     *
     * @see _onEnterFixUp()
     *
     * @todo figure out why sometimes _onEnterFixUp() is not correctly deleting the temporary span.
     */

    _handleEnter(event) {
        // <debug>
        ddt.log('top of handleEnter()');
        // </debug>

        event.preventDefault();

        // we insert a <BR> where the cursor currently is. It may, however, be inside a text node
        // which means the text node needs to be split.
        var sel = document.getSelection(),
            range = this.currentRange;

        // <debug>
        ddt.log('got range and selection', range);
        // </debug>

        var domNode = document.createElement('br');

        range.deleteContents();
        range.insertNode(domNode);
        range.setStartAfter(domNode);
        range.setEndAfter(domNode);
        range.collapse(false);

        sel.removeAllRanges();
        sel.addRange(range);

        // <debug>
        ddt.log('handleEnter(): previousSibling is : ', domNode.previousSibling);
        // </debug>

        // check siblings before and after us, if any.
        //
        // And, in Chome and possibly other browsers, if this is the first element there is,
        // an entirely empty text node is insert at the first position.
        // <debug>
        ddt.log('handleEnter(): inserting zero width node before selection');
        // </debug>

        // FIXME: Not sure why, but if I don't force the inclusion of empty nodes even if
        // the object is surrounded by text nodes selections break. wtf? (i.e. without this
        // inserting object into the middle of text lines fails in Webkit)
        var textnode = this._insertEmptyNode(domNode, 'before', true);

        // if there is no sibling after us or if it's not a text node, add a zero width space.
        // <debug>
        ddt.log('handleEnter(): inserting zero width node after selection');
        // </debug>

        var textnode2 = this._insertEmptyNode(domNode, 'after', true);

        // FIXME: if this is 0, in Chrome it selects a point in the span.
        this._selectTextNode(textnode2, 1);

        return false;

    },
    // end of _handleEnter()
    /**
     * handle a range selection
     *
     * Handles case where use has selected potentially multiple nodes. The start and ends of the range
     * are checked and adjusted if they happen to fall within object boundaries.
     *
     * @return {Boolean} true if it's a multi-char range, false otherwise.
     */

    _handleRangeSelection() {

        var sel = document.getSelection(),
            range;

        // if there's no selection, which can happen if we are scrolling, this will throw
        // an exception
        if (sel.rangeCount) {
            range = sel.getRangeAt(0);
        } else {
            // <debug>
            ddt.log('getRangeAt() failed - no range?');
            // </debug>

            // no selected range.
            return false;
        }

        var startNode = null,
            endNode = null;

        // <debug>
        ddt.log('_handleRangeSelection(): checking range for mult-char selection: ', range);
        // </debug>

        // did the user click and drag a selection. We /should/ get the final selection
        // here unlike the case with the keyboard lagging.
        if (range.collapsed == false) {

            // <debug>
            ddt.log('_handleRangeSelection(): we have a multi-character selection');
            // </debug>

            if ((startNode = this._clickedOnObject(range.startContainer)) != false) {

                // <debug>
                ddt.log('_handleRangeSelection(): range starts in an object.');
                // </debug>

                range.setStartBefore(startNode);

            }

            if ((endNode = this._clickedOnObject(range.endContainer)) != false) {

                // <debug>
                ddt.log('_handleRangeSelection(): range ends in an object.');
                // </debug>

                range.setEndAfter(endNode);

            }

            if (startNode != false || endNode != false) {

                // <debug>
                ddt.log('_handleRangeSelection(): modifying range :', range);
                // </debug>

                sel.removeAllRanges();
                sel.addRange(range);
            }

            return true;

        } // end of if the user selected a multi-char range.

        return false;

    },
    // end of _handleRangeSelection()
    /**
     * saves the current range
     *
     * A problem arises when we want to call insertObject when the content editable div
     * does not have focus. The current range selection gets screwed up and we end up
     * inserting content in the page where-ever the user had clicked last, or not at all. Not
     * good.
     *
     * So the idea is to keep track of the current range whenever the user does anything in
     * the div. The range is then restored when insertObject is called.
     *
     * @param {Object} range - optional range to set.
     * @see insertObject()
     */

    _saveRange(range) {
        // <debug>
        ddt.log('_saveRange(): before save currentRange: ', this.currentRange);
        // </debug>

        // we may have been invoked because of a scrollbar move.
        if (!range) {

            var sel = document.getSelection();

            // <debug>
            ddt.log('_saveRange(): current selection is', sel);
            // </debug>

            if (sel.rangeCount) {
                range = sel.getRangeAt(0);
            } else {

                // <debug>
                ddt.log('_saveRange(): no range?');
                // </debug>
                return false;
            }

        }

        this.currentRange = range.cloneRange();

        // <debug>
        ddt.log('_saveRange(): saving currentRange: ', this.currentRange);
        // </debug>
    },

    /**
     * determines if we are in a trigger word
     *
     * checks the current, unreliable, cursor position to see if it is within the boundaries
     * of a trigger word.
     *
     * The term found is set in the class member 'currentTrigger' which communicates back not only
     * the term but also the start and end offsets of the trigger word along with the data source
     * callback to use to get the autocomplete list.
     *
     * TECH NOTES:
     *
     * One might be tempted to just use a selection range to determine the current
     * cursor position in order to test for the presence of a trigger character
     * (e.g. '@', '#', etc) in the onKeyUp handler as it's being typed. Unfortunately,
     * as fate would have it, when used in a keyup event handler, the range code seems
     * unable to keep up with an even modest typist causing the incorrect character position
     * to be returned in the range. (e.g. you type 'this' quickly and the range in the keyup
     * callback returns four instances of the position of the 's'.)
     *
     * After much research combined with trial and error, it turns out that the selection
     * range is accurate in the KEYDOWN event handler. Go figure.
     *
     * Unfortunately, the keydown handler returns the position of the cursor BEFORE the key
     * is applied. This makes things difficult when you consider handling up arrows and down
     * arrows. (textbox of arbitrary size and newlines. You're on line 4 and press up arrow twice.
     * What character offset in the box are you?)
     *
     * Most open source code I've seen inadvertently works around this issue in ways that don't
     * work accurately. More times than not once can confuse most triggered entry (@mention)
     * solutions. Facebook, on the other hand, does do it correctly.
     *
     * So, when searching for whether or not we have encountered a trigger character and should
     * be in autocomplete mode, we have to take the current character position we've received,
     * which is either the position of the character just entered or some number of characters
     * after it, and search backwards to see if it's the start of a trigger. It should be noted
     * that we may receive multiple keyup events for the same caret position.
     *
     * So, in summary:
     *
     *   1. get the carent position in the callback, noting that it may or may not represent
     *       a keypress several characters later.
     *
     *   2. save the position.
     *
     *   3. determine whether or not we are in autocomplete mode by looping backwards from the character
     *       position searching for an autocomplete trigger.
     *
     * @return {Boolean|Object} false if no term found otherwise the triggerEntry.
     */

    _checkForTrigger() {

        var caret = null,
            triggerEntry = null;

        caret = this._getCaretPosition();

        if (!caret || caret.offset == -1) {

            // <debug>
            ddt.log('_checkForTrigger(): we are not inside a text node. No trigger');
            // </debug>

            return false;
        }

        // <debug>
        ddt.log(`_checkForTrigger(): current caret position is ${caret.offset}`);
        // </debug>

        // are we inside the bounds of a trigger word that may be interspersed zero width space
        // character and may span multiple text nodes? (thanks WebKit)
        //
        // -1 because the caret position is to the right of the last character entered.
        triggerEntry = this._isTrigger(caret.domNode, caret.offset - 1);

        this.currentTrigger = triggerEntry;

        return triggerEntry;

    },
    // end of _checkForTrigger()
    /**
     * check for regex match
     *
     * An array of regex's may be defined that will invoke a callback if a matching pattern is
     * entered by the user. For example, ;) might invoke a callback to insert a smiley icon.
     *
     * Callback functions are provided an object identifying the range and word matched that
     * invoked the callback.
     *
     * It is possible to combine trigger character callback and regexes on the same pattern. For
     * instance, consider #tags. On the one hand, once the user types #ta for instnace you want to
     * display the dropdown but also if the user cancels out you may want to do something with the
     * new tag present in the text such as format it as a tag.
     *
     * Trigger definitions have precedence over regexs. For example we may define
     * a trigger on #tags but also define a regex on #[a-zA-Z0-9]+. If the user does not
     * select an item from the dropdown, the regex callback will be run.
     *
     * @param {Event} event
     *
     * @see regexes
     */

    _checkRegexes(event) {

        var caret = null,
            wordEntry = null;

        // <debug>
        ddt.log('_checkRegexes(): with event: ', event);
        // </debug>

        caret = this._getCaretPosition();

        // 添加!caret ||
        if (!caret || caret.offset == -1) {

            // <debug>
            ddt.log('_checkRegexes(): we are not inside a text node. No word');
            // </debug>

            return false;
        }

        // <debug>
        ddt.log(`_checkRegexes(): current caret position is ${caret.offset} value is "${caret.domNode.nodeValue.charAt(caret.offset - 1)}"`);
        // </debug>

        if (event.type == 'keyup') {

            // if the user pressed a space, then we need to start looking two characters back.
            if (caret.offset < 3) {
                return;
            }

            // we're in keyup so the cursor has moved past the space
            caret.offset--;

        }

        // are we inside the bounds of a word that may be interspersed zero width space
        // character and may span multiple text nodes? (thanks WebKit)
        //
        // -1 because the caret position is to the right of the last character entered.
        if (wordEntry = this._getWord(caret.domNode, caret.offset - 1)) {

            // <debug>
            ddt.log(`_checkRegexes(): found word "${wordEntry.word}"`);
            // </debug>

            // loop through the regex definitions checking each regular expression. If
            // we find a match, run the callback. We only run one match, the first match having
            // precedence.
            var regs = this.getRegexes();
            for (var i = 0; i < regs.length; i++) {

                // <debug>
                ddt.log(`_checkRegexes(): checking against "${regs[i].regex}`);
                // </debug>

                if (wordEntry.word.match(regs[i].regex)) {

                    // <debug>
                    ddt.log(`_checkRegexes(): found match at offset "${i}"`);
                    // </debug>

                    regs[i].callback(this, wordEntry);

                }

            }

        } // end of if we got a word.
    },
    // end of _checkRegexes()
    /**
     * search backwards for start of trigger word.
     *
     * Are we in a trigger word?
     *
     * WebKit browsers do not merge text nodes. As a result any text operations have to be done
     * taking the possibility of multiple text nodes into account. There's probably an easier way
     * such as just merging text nodes but I fear it's too easy to get out of whack.
     *
     * Searches backwards over any empty space characters and/or nodes looking for a trigger characters.
     * Once found, checks to see that before it it either finds a space character
     * or the beginning of a container. False otherwise.
     *
     * It should also be noted that WebKit likes to insert empty text nodes as well.
     *
     * @param {Node} domNode textnode to start searching in.
     * @param {Integer} caretPosition position to start search.
     *
     * @return {object|Boolean} triggerEntry or false if not a trigger word boundary
     *
     * @see http://api.jquery.com/text/
     */

    _isTrigger(domNode, caretPosition) {

        // modes are 'looking_for_trigger' and 'looking_for_space'
        var mode = 'looking_for_trigger',
            triggerEntry = null,
            loopBrake = 200,

            // used to remember where the trigger start character is.
            triggerStart = {};

        // remember that we can inconveniently have zerospace characters anywhere after
        // inserts of lines and objects and subsequent deletes.
        //
        // search backwards for a trigger character.
        while (true) {

            loopBrake--;

            if (loopBrake <= 0) {

                console.error('_isTrigger(): runaway loop. braking');

                return false;
            }

            if (caretPosition == -1) {

                // <debug>
                ddt.log(`_isTrigger(): top of loop, caretPosition is "${caretPosition}" previousSibling is:`, domNode.previousSibling);
                // </debug>

                if (domNode.previousSibling == null) {

                    // <debug>
                    ddt.log('_isTrigger(): beginning of container found.');
                    // </debug>

                    if (mode == 'looking_for_trigger') {

                        // <debug>
                        ddt.log('_isTrigger(): not a trigger');
                        // </debug>

                        return false;
                    }

                    break; // out of while loop
                }

                if (domNode.previousSibling.nodeType != 3) {

                    // <debug>
                    ddt.log('_isTrigger(): previousSibling is NOT a text node.');
                    // </debug>

                    if (mode == 'looking_for_trigger') {

                        // <debug>
                        ddt.log('_isTrigger(): not a trigger');
                        // </debug>

                        return false;
                    }

                    break; // out of while loop
                }

                domNode = domNode.previousSibling;

                caretPosition = domNode.nodeValue.length - 1;

                // <debug>
                ddt.log(`_isTrigger(): moving to previousSibling length "${caretPosition}"`);
                // </debug>

                if (caretPosition == -1) {

                    // empty text nodes seem to be inserted by WebKit randomly.
                    // <debug>
                    ddt.log('_isTrigger(): zero length textnode encountered');
                    // </debug>

                    continue;

                }

            } // end of if we are at the beginning of a textnode.
            // do we have a zero width space character?
            if (domNode.nodeValue.charAt(caretPosition) == '\u200B') {

                // <debug>
                ddt.log('_isTrigger(): skipping zero width space character');
                // </debug>

                caretPosition--;

                continue;

            }

            // <debug>
            ddt.log('_isTrigger(): Not a zero width space. Is it a space character?');
            // </debug>

            if (!domNode.nodeValue.charAt(caretPosition).match(/\s+/)) {

                // it's not a space. If we are still looking for a trigger character check
                // to see if it is one.
                if (mode == 'looking_for_trigger') {

                    // <debug>
                    ddt.log(`_isTrigger(): checking "${domNode.nodeValue.charAt(caretPosition)}" for trigger char`);
                    // </debug>

                    if (triggerEntry = this._isTriggerChar(domNode.nodeValue.charAt(caretPosition))) {

                        // <debug>
                        ddt.log(`_isTrigger(): found trigger char "${domNode.nodeValue.charAt(caretPosition)}" at caretPosition "${caretPosition}"`);
                        // </debug>

                        mode = 'looking_for_space';

                        // make life easy, remember where the trigger start character is.
                        // (It might be a number of zerowidth character before we find a space character or
                        // beginning of the container)
                        triggerStart.domNode = domNode;
                        triggerStart.offset = caretPosition;

                        caretPosition--;

                        continue;

                    }

                    // <debug>
                    ddt.log(`_isTrigger(): "${domNode.nodeValue.charAt(caretPosition)}" not a trigger char.`);
                    // </debug>

                    caretPosition--;

                } else {

                    // 添加chinese char
                    if (domNode.nodeValue.charAt(caretPosition).match(/[\u4E00-\u9FA5]|[\uFE30-\uFFA0]|。/)) {
                        // <debug>
                        ddt.log('_isTrigger(): found a chinese char. This is the start of a trigger');
                        // </debug>
                        break;
                    }

                    // we are looking for a space and it's not a zero width character or a space. Thus
                    // the trigger character has something else in front of it. Not a trigger boundary.
                    // <debug>
                    ddt.log('_isTrigger(): character before trigger is not a space');
                    // </debug>

                    triggerEntry = null;

                    return false;

                }

            } // end of if we found a non-space character.
            else {

                // we found a space. IF we were looking for a trigger then we end.
                if (mode == 'looking_for_trigger') {

                    // <debug>
                    ddt.log('_isTrigger(): found a space instead of a trigger char');
                    // </debug>

                    return false;
                }

                // <debug>
                ddt.log('_isTrigger(): found a space. This is the start of a trigger');
                // </debug>

                break; // out of while loop
            }

        } // end of while loop.
        // --------------------------------
        // Arrive here when we've found the beginning of a trigger word taking multiple text nodes
        // and zero width space characters into account.
        // <debug>
        ddt.log('_isTriggerStart(): found a trigger.');
        // </debug>

        triggerEntry.startOffset = triggerStart.offset + 1;
        triggerEntry.startNode = triggerStart.domNode;

        // _getWordEnd() expects the node and offset pointing at the trigger character.
        triggerEntry = this._getWordEnd(triggerEntry);

        // need to include the trigger character as well.
        triggerEntry.startOffset = triggerStart.offset;

        this.currentTrigger = triggerEntry;

        return triggerEntry;

    },
    // end  of _isTrigger()
    /**
     * find the end boundary of a word taking multiple text nodes into account.
     *
     * searches from a given character offset forward to returns the string representing the word.
     * Takes multiple nodes and interspersed zero width characters into account.
     *
     * @param {Object} wordEntry object containing startNode and startOffset of start of range to search.
     *
     * @return {Object|Boolean} with keys startNode, startOffset, endNode, endOffset, word or false if not a trigger word boundary
     */

    _getWordEnd(wordEntry) {

        var loopBrake = 200,
            word = '';

        // <debug>
        ddt.log('_getWordEnd(): top with wordEntry :', wordEntry);
        // </debug>

        var domNode = wordEntry.startNode,
            caretPosition = wordEntry.startOffset;

        wordEntry.word = '';

        // <debug>
        ddt.log(`_getWordEnd(): at start of trigger word with caretPosition "${caretPosition}" and char "${domNode.nodeValue.charAt(caretPosition)}" length "${domNode.nodeValue.length}"`);
        // </debug>

        while (true) {

            // for when I make mistakes. avoids locking up the browser.
            if (loopBrake-- <= 0) {
                console.error('_getWordEnd(): runaway loop');

                return false;
            }

            // <debug>
            ddt.log(`_getWordEnd(): Top of loop "${caretPosition}"`);
            // </debug>

            // can be 0 if we get a 0 length node
            if (caretPosition >= domNode.nodeValue.length) {

                if (domNode.nextSibling == null) {

                    // <debug>
                    ddt.log(`_getWordEnd(): returning "${word}"`);
                    // </debug>

                    wordEntry.endNode = domNode;
                    wordEntry.endOffset = caretPosition - 1;
                    wordEntry.word = word;

                    return wordEntry;

                }

                if (domNode.nextSibling.nodeType != 3) {

                    // <debug>
                    ddt.log(`_getWordEnd(): nextSibling is NOT a text node. Returning "${word}"`);
                    // </debug>

                    wordEntry.endNode = domNode;
                    wordEntry.endOffset = caretPosition - 1;
                    wordEntry.word = word;

                    return wordEntry;
                }

                // <debug>
                ddt.log(`_getWordEnd(): moving to next sibling of type "${domNode.nextSibling.nodeType}" with length "${domNode.nextSibling.nodeValue.length}" and value "${domNode.nextSibling.nodeValue}"`);
                // </debug>

                domNode = domNode.nextSibling;
                caretPosition = 0;

                // occasionally at the end of a line, zero width text nodes show up in WebKit which are
                // apparently not selectable.
                //
                // FIXME: do these always show up at the end of a line?
                if (domNode.nodeValue.length == 0) {

                    // <debug>
                    ddt.log('_getWordEnd(): empty text node found.');
                    // </debug>

                    continue;

                }

            } // end of if we were at the end of a text node.
            // do we have a zero width space character?
            if (domNode.nodeValue.charAt(caretPosition) == '\u200B') {

                // <debug>
                ddt.log('_getWordEnd(): skipping zero width space character');
                // </debug>

                caretPosition++;

                continue;

            }

            if (!domNode.nodeValue.charAt(caretPosition).match(/\s+/)) {

                // it's not a zero width character or a space. add it to the trigger string.
                // <debug>
                ddt.log(`_getWordEnd(): non-space, adding to string position "${caretPosition}" char "${domNode.nodeValue.charAt(caretPosition)}" node of length "${domNode.nodeValue.length}":`, domNode);
                // </debug>

                word += domNode.nodeValue.charAt(caretPosition);

                caretPosition++;

            } else {

                // <debug>
                ddt.log(`_getWordEnd(): found a space. Returning "${word}"`);
                // </debug>

                wordEntry.endNode = domNode;

                // current position is a space.
                wordEntry.endOffset = caretPosition - 1;
                wordEntry.word = word;

                return wordEntry;

            }

        } // end of while loop.
    },
    // end of _getWordEnd()
    /**
     * is the given character a trigger character?
     *
     * @return object trigger definition.
     */

    _isTriggerChar(ch) {

        var ts = this.getTriggerChars();
        for (var i in ts) {

            if (ch == ts[i].trigger) {

                // ddt.log( "_isTriggerChar(): found trigger char " + char );
                return ts[i];
            }

        }

        return false;

    },
    // end of _isTriggerChar()
    /**
     * search for the boundaries of a word.
     *
     * given a domNode and an offset searches backwards then forwards for the boundary of a
     * word.
     *
     * Once found, returns the word in addition to the range.
     *
     * @param {Node} domNode textnode to start searching in.
     * @param {Integer} caretPosition position to start search.
     *
     * @return {object|Boolean} with keys word, startNode, startOffset, endNode, endOffset or false if not a word
     */

    _getWord(domNode, caretPosition) {

        var loopBrake = 200,

            // used to return the word, and range.
            word = {},

            // used to track if we found non-whitespace
            foundCharFlag = false;

        // remember that we can inconveniently have zerospace characters anywhere after
        // inserts of lines and objects and subsequent deletes.
        //
        // search backwards for a space.
        while (true) {

            loopBrake--;

            if (loopBrake <= 0) {

                console.error('_getWord(): runaway loop. braking');

                return false;
            }

            if (caretPosition == -1) {

                // <debug>
                ddt.log(`_getWord(): top of loop, caretPosition is "${caretPosition}" previousSibling is:`, domNode.previousSibling);
                // </debug>

                if (domNode.previousSibling == null) {

                    // beginning of container means we've found a word boundary.
                    // <debug>
                    ddt.log('_getWord(): beginning of container found.');
                    // </debug>

                    break; // out of while loop
                }

                if (domNode.previousSibling.nodeType != 3) {

                    // running into a different element also means a word boundary (likely a BR)
                    // <debug>
                    ddt.log('_getWord(): previousSibling is NOT a text node.');
                    // </debug>

                    break; // out of while loop
                }

                domNode = domNode.previousSibling;

                caretPosition = domNode.nodeValue.length - 1;

                // <debug>
                ddt.log(`_getWord(): moving to previousSibling length "${caretPosition}"`);
                // </debug>

                if (caretPosition == -1) {

                    // empty text nodes seem to be inserted by WebKit randomly.
                    // <debug>
                    ddt.log('_getWord(): zero length textnode encountered');
                    // </debug>

                    continue;

                }

            } // end of if we are at the beginning of a textnode.
            // do we have a zero width space character?
            if (domNode.nodeValue.charAt(caretPosition) == '\u200B') {

                // <debug>
                ddt.log('_getWord(): skipping zero width space character');
                // </debug>

                caretPosition--;

                continue;

            }

            // <debug>
            ddt.log('_getWord(): Not a zero width space. Is it a space character?');
            // </debug>

            if (domNode.nodeValue.charAt(caretPosition).match(/\s+|[\u4E00-\u9FA5]|[\uFE30-\uFFA0]|。/)) {

                // we've found a space character and thus the beginning of a word.
                // <debug>
                ddt.log('_getWord(): found a space. This is the start of a word');
                // </debug>

                break;

            } else {
                // found a normal character
                foundCharFlag = true;
            }

            // <debug>
            ddt.log(`_getWord(): "${domNode.nodeValue.charAt(caretPosition)}" not a space.`);
            // </debug>

            caretPosition--;

        } // end of while loop.
        // --------------------------------
        // Arrive here when we've found the beginning of a word taking multiple text nodes
        // and zero width space characters into account.
        word.startNode = domNode;

        // current char is a space. move past it.
        word.startOffset = caretPosition + 1;

        // if we only matched whitespace, abort.
        if (!foundCharFlag) {

            // <debug>
            ddt.log('_getWord(): only found whitespace');
            // </debug>

            return false;
        }

        // <debug>
        ddt.log('_getWord(): found a the beginning of a word, now searching for the end.');
        // </debug>

        // _getWordEnd() expects the node and offset pointing at the beginning of the word.
        word = this._getWordEnd(word);

        return word;

    },
    // end  of _getWord()
    /**
     * check for the presence of an object
     *
     * Checks forward or backwards to see if we are next to an embedded object.
     * If so, returns the node.
     *
     * NOTE that zero width space characters are present as a work around for the case
     * where two embedded objects are right next to one another. This allows us to form
     * a textnode selection of that space in WebKit browsers. For purposes of this method,
     * the cursor is right next to an object even if it separated by any number of zerowidth
     * space characters which may be present in any number of textnodes.
     *
     * As a separate case, webkit browsers seems to randomly add <BR> elements before or after
     * embedded objects (i.e. <SPAN>'s) which mucks up the works.
     *
     * This is complicated by the fact that browsers will insert various elements into contenteditable
     * divs at their own discretion, notably <BR>'s, <P>'s and <DIV>'s when the users enters a new line.
     *
     * @param {String} direction 'left' or 'right'
     *
     * @return {Object} with keys domNode and container_spanned
     */

    _checkForAdjacentObject(direction) {

        var location = {},
            domNode = null,
            object = null;

        // when the editable div is first loaded and we have not yet
        // clicked in the window, we may not have a current caret position.
        if (!(location = this._getCaretPosition())) {
            return false;
        }

        domNode = location.domNode;

        // <debug>
        ddt.log(`_checkForAdjacentObject(): looking in direction "${direction}" current node is :`, domNode);
        // </debug>

        // SPECIAL CASE: if the node is clicked on by the mouse, we will, in FireFox, get the embedded object node.
        if (this._isEmbeddedObject(domNode)) {
            // <debug>
            ddt.log('_checkForAdjacentObject(): current node is an object. returning');
            // </debug>

            return {
                domNode: domNode,
                container_spanned: false,
                preventDefault: true
            };
        }

        if ((location = this._treeWalker(location.domNode, location.offset, direction)) == false) {
            // <debug>
            ddt.log('_checkForAdjacentObject(): none found');
            // </debug>
            return false;
        }

        // <debug>
        ddt.log('_checkForAdjacentObject(): _treeWalker returned: ', location);
        // </debug>

        // SPECIAL HANDLING for Mozilla. If we get a _moz_dirty BR we consider ourselves NOT next to
        // an object if we are looking to the right. (<BR> is essentially a stop character.)
        //
        // But we should look to the left.
        // if ($(domNode).filter('[_moz_dirty]').length != 0) {
        if (domNode.nodeType != 3 && domNode.getAttribute('_moz_dirty') !== null) {

            if (direction == 'left') {

                // look left for an object.
                if ((location = this._treeWalker(location.domNode.previousSibling, location.offset, direction)) == false) {
                    // <debug>
                    ddt.log('_checkForAdjacentObject(): none found');
                    // </debug>
                    return false;
                }

            } else {
                // <debug>
                ddt.log('_checkForAdjacentObject(): current node is a moz_dirty filthy BR. don\'t look right.');
                // </debug>

                return false;
            }
        }

        // if we are pointing at the beginning or end of a text node, we might be right beside
        // an embedded object. check the previous/next node
        if (location.domNode.nodeType == 3) {

            // <debug>
            ddt.log(`_checkForAdjacentObject(): _treeWalker returned a text node with offset "${location.offset}"`);
            // </debug>

            if (direction == 'left' && location.offset == 0) {

                if (this._isEmbeddedObject(location.domNode.previousSibling)) {
                    return {
                        domNode: location.domNode.previousSibling,
                        container_spanned: !location.checkForObjects,
                        preventDefault: location.preventDefault
                    };
                }

            } else if (direction == 'right' && location.offset == location.domNode.nodeValue.length) {

                if (this._isEmbeddedObject(location.domNode.nextSibling)) {
                    return {
                        domNode: location.domNode.nextSibling,
                        container_spanned: !location.checkForObjects,
                        preventDefault: location.preventDefault
                    };
                }

            }

        }

        if (!this._isEmbeddedObject(location.domNode)) {
            return false;
        }

        return {
            domNode: location.domNode,
            container_spanned: !location.checkForObjects,
            preventDefault: location.preventDefault
        };

    },
    // end of _checkForAdjacentObject()
    /**
     * have we selected an object with the mouse?
     *
     * If the given node is an object or is inside an object, returns the object. False otherwise.
     *
     * @param {Node} domNode node that was clicked on, maybe a child node of an embedded object.
     *
     * @return {Node|Boolean} domNode of object or false if not an object.
     */

    _clickedOnObject(domNode) {

        // <debug>
        ddt.log('_clickedOnObject(): got current node : ', domNode);
        // </debug>

        // it's an object if it or some ancestor in the editable div has
        // a data-value.
        while (domNode && domNode !== this.inputElement.dom) {

            if (this._isEmbeddedObject(domNode)) {

                // <debug>
                ddt.log(`_clickedOnObject(): found object node "${domNode}"`);
                // </debug>

                return domNode;
            }

            domNode = domNode.parentNode;

            // <debug>
            ddt.log('_clickedOnObject(): checking parent node : ', domNode);
            // </debug>

        }

        // <debug>
        ddt.log('_clickedOnObject(): user did not click on an object');
        // </debug>

        return false;

    },
    // end of clickedOnObject()
    /**
     * delete an inserted object
     *
     * Called when an object is "backspaced" over or deleted with the DEL key, removes the object
     * and when needed, any wrapping zero width whitespace so that no freestanding zero width spaces
     * are left.
     *
     * @param {Node} domNode the DOM node representing the embedded object to delete.
     */

    deleteObject(domNode) {

        // <debug>
        ddt.log('deleteObject(): top with node: ', domNode);
        // </debug>

        var sel = document.getSelection(),

            parent = domNode.parentNode,

            // originally the range included any surrounding zero width characters but no longer.
            // It's better to have too many than not enough.
            range = this._getObjectRange(domNode);

        // <debug>
        ddt.log('deleteObject(): range to delete is : ', range);
        // </debug>

        range.deleteContents();
        range.collapse(true);

        sel.removeAllRanges();
        sel.addRange(range);

        // was this object the only remaining object in our parent?
        if (parent !== this.inputElement.dom && parent.childNodes.length == 0) {

            // <debug>
            ddt.log('deleteObject(): last element of container deleted. Deleting container.');
            // </debug>

            range.setStartBefore(parent);
            range.setEndAfter(parent);
            range.deleteContents();
            range.collapse(true);

            sel.removeAllRanges();
            sel.addRange(range);

        }

        this._saveRange();

        this._value = this.inputElement.dom.value = this.inputElement.getHtml();

        return;

    },
    // end of deleteObject()
    /**
     * skip over zero width space characters in a textnode.
     *
     * zero width space characters are used in the emptiness between divs so that
     * they can be selectable using a range. (especially for webkit browsers)
     *
     * Unfortunately, if you use the arrow keys over these zero width spaces, they
     * consume a keystroke causing the cursor not to move.
     *
     * This method jumps the cursor over any number of zero width space characters, possibly
     * spanning multiple text nodes and adjacent containers. It updates the selection accordingly.
     *
     * @param {Node} domNode domNode where to start skipping.
     * @param {Integer} caretPosition if domNode is a text node, offset where to start looking.
     * @param {String} direction may be 'left' or 'right'.
     *
     * @return {Object|Boolean} domNode, offset, type, checkForObjects, preventDefault or false on error.
     *
     * @see insertEditableSelection()
     * @see onMouseUp()
     */

    _moveCaret(domNode, caretPosition, direction) {

        var loopCount = 0,
            location = {};

        // <debug>
        ddt.log(`_moveCaret(): top with direction "${direction}" with node: `, domNode);
        // </debug>

        if ((location = this._treeWalker(domNode, caretPosition, direction)) == false) {
            // <debug>
            ddt.log('_moveCaret(): _treeWalker returned false');
            // </debug>

            return false;
        }

        // <debug>
        ddt.log('_moveCaret(): _treeWalker() returned location: ', location);
        // </debug>

        // do we have an object?
        if (location.type == 'object') {

            // position the caret before or behind the object.
            //
            // NOTE: in this scenario we've just moved the caret towards the object,
            // so we want to stop at the object and not jump over it.
            if (direction == 'left') {
                this._setCaretPositionRelative(location.domNode, 'after');
            } else {
                this._setCaretPositionRelative(location.domNode, 'before');
            }

            return location;

        }

        // special handling if we were in a container and just stepped out.
        if (location.type == 'container') {

            // <debug>
            ddt.log(`_moveCaret(): we were in a container and have stepped out. Selecting "${direction}" side`);
            // </debug>

            if (direction == 'left') {

                // we may have a text node, a container, or some other element as our previousSibling.
                // If it's a container, we want to select the last child in it.
                if (location.domNode.previousSibling.nodeName == 'DIV' || location.domNode.previousSibling.nodeName == 'P') {

                    // guard against an empty container
                    if (location.domNode.previousSibling.childNodes.length == 0) {
                        console.error('_moveCaret(): empty container previousSibling');

                        return false;
                    }

                    // <debug>
                    ddt.log(`_moveCaret(): moving into container: "${location.domNode.previousSibling}" from "${location.domNode}"`);
                    // </debug>

                    this._setCaretPositionRelative(location.domNode.previousSibling, 'end');

                    location.domNode = location.domNode.previousSibling.childNodes[location.domNode.previousSibling.childNodes.length - 1];

                    return location;

                } // end of if we had a container.
                // if it's a textnode, to work around issues in FireFox, we want to select the end
                // of the textnode.
                if (location.domNode.previousSibling.nodeType == 3) {

                    // <debug>
                    ddt.log('_moveCaret(): previousSibling is a textnode');
                    // </debug>

                    location.domNode = location.domNode.previousSibling;

                    // Chrome may cause us grief with a 0 width text node here.
                    if (location.domNode.nodeValue.length == 0) {

                        // FIXME: not sure what to do in this case, if it ever occurs.
                        console.error('_moveCaret(): previousSibling is a zero length textnode.');

                        return false;
                    }

                    this._setCaretPositionRelative(location.domNode, 'end');

                    return location;

                } // end of if we had a text node.
                location.domNode = location.domNode.previousSibling;

                // some other element.
                // <debug>
                ddt.log(`_moveCaret(): moving before element "${location.domNode}"`);
                // </debug>

                this._setCaretPositionRelative(location.domNode, 'before');

                return location;

            }
            // FIXME: Moving to the right seems less problematic across the board.
            // to avoid errors when we right arrowing at end the of the editable div.
            if (location.domNode.nextSibling == null) {

                // <debug>
                ddt.log('_moveCaret(): nextSibling is null in container. setting position "after" with node:', location.domNode);
                // </debug>

                this._setCaretPositionRelative(location.domNode, 'after');

                return location;
            }

            // we may have some normal node like a text node or we may have a container
            // as our nextSibling. We can't select the container, we want to select the
            // end of it.
            if (location.domNode.nextSibling.nodeName == 'DIV' || location.domNode.nextSibling.nodeName == 'P') {

                // guard against an empty container
                if (location.domNode.nextSibling.childNodes.length == 0) {
                    console.error('_moveCaret(): empty container nextSibling');

                    return false;
                }

                location.domNode = location.domNode.nextSibling.childNodes[0];

            }

            this._setCaretPositionRelative(location.domNode, 'after');

            return location;

        } // end of if we came out of a container.
        // special handling if we just stepped into a container. WebKit is fond of adding zero
        // width text nodes at the ends of containers.
        if (location.type == 'child') {

            // <debug>
            ddt.log('_moveCaret(): handling special stepping into child case');
            // </debug>

            // If we're moving into a text node at the beginning of a container
            if (location.domNode.nodeType == 3) {

                // FIXME: kept here for posterity as a reminder that we can get 0 length nodes
                // here.
                if (location.domNode.nodeValue.length == 0) {
                    // <debug>
                    ddt.log('_moveCaret(): zero width text node. selecting it.');
                    // </debug>

                    this._selectTextNode(location.domNode, 0);

                    return location;
                }

                // <debug>
                ddt.log('_moveCaret(): text node child with some content. selecting it');
                // </debug>

                this._selectTextNode(location.domNode, 0);

                // since this is a text node we want to prevent the default action from happening
                // otherwise we move one character too far to the right. see onKeyDown(). Since
                // we are a location type of 'child' onKeyDown will not jump over any adjacent objects.
                return location;
            }

            // since we just jumped into a container presumably, we don't want to
            // jump over any objects we happen to be next to.
            return location;

        } // end of if we moved into a child container.
        // text node.
        if (location.domNode.nodeType == 3) {

            // <debug>
            ddt.log(`_moveCaret(): selecting text node for direction "${direction}" :`, location);
            // </debug>

            this._selectTextNode(location.domNode, location.offset);

            return location;
        }

        // For mozilla, move the cursor to the far side of a <BR _moz_dirty=""> tag.
        if (location.domNode.nodeName == 'BR') {

            // <debug>
            ddt.log('_moveCaret(): we have a BR');
            // </debug>

            // is this a mozilla _moz_dirty BR?
            // if ($(location.domNode).filter('[_moz_dirty]').length != 0) {
            if (location.domNode.getAttribute('_moz_dirty') !== null) {

                // we've come up on a BR in mozilla, which is used to mark the end
                // of lines.
                if (direction == 'left') {

                    // <debug>
                    ddt.log('_moveCaret(): moving to left side of _moz_dirty BR starting with location:', location);
                    // </debug>

                    // location = this._moveCaret( location.domNode.previousSibling, -1, 'left' );
                    location.type = '_moz_dirty';
                    location.preventDefault = true;

                    // <debug>
                    ddt.log('_moveCaret(): location returned after BR is: ', location);
                    // </debug>

                    this._setCaretPositionRelative(location.domNode, 'before');

                    return location;

                }
                // <debug>
                ddt.log('_moveCaret(): moving to right side of _moz_dirty BR');
                // </debug>

                // just move to the right of the BR which represents moving down to the
                // new line. Any additional zero space characters will be consumed the next
                // time the user presses arrow keys
                this._setCaretPositionRelative(location.domNode, 'after');

                return location;



            } // end of if we had a _moz_dirty BR.
            // some other normal BR.
            // <debug>
            ddt.log('_moveCaret(): normal BR');
            // </debug>

            if (direction == 'left') {
                this._setCaretPositionRelative(location.domNode, 'before');
            } else {
                this._setCaretPositionRelative(location.domNode, 'after');
            }

        }

        return location;

    },
    // end of _moveCaret()
    /**
     * backspace over zero width space character
     *
     * After editing the content of the div, the situation can arise where
     * zero width spaces are interspersed in the content. Sometimes we want to delete
     * these spaces, such as if they occur between text nodes, or as the final child
     * of a container div, but in other circumstances, such as if it's at the end of
     * a container div or right next to some embedded objects we want to leave it intact.
     *
     * @return {String|Boolean} true if characters were removed, false if nothing changed, 'stop' if we encountered a stop word
     */

    _backspaceZeroSpace(backspace) {

        var domNode = null,
            deleteFlag = false,
            runawayBrake = 0,
            caretPosition = null,
            location,
            startLocation,
            endLocation,
            sel = null,
            range = null;

        location = this._getCaretPosition();

        domNode = location.domNode;

        // <debug>
        ddt.log('_backspaceZeroSpace(): current dom node is :', domNode);
        // </debug>

        if (domNode.nodeType != 3 && domNode.nodeName != 'BR') {

            // <debug>
            ddt.log(`_backspaceZeroSpace(): backspacing over a NON-BR "${domNode.nodeName}" node`);
            // </debug>

            return false;
        }

        // BR's have to be handled specially.
        if (domNode.nodeName == 'BR') {

            // <debug>
            ddt.log('_backspaceZeroSpace(): backspacing over BR');
            // </debug>

            // Lines are separated by BR's in Mozilla with the moz_dirty attribute. If we encounter
            // one we consider it a stop word. DO NOT delete any objects in front of it.
            //
            // see onKeyDown BACKSPACE
            // if ($(domNode).filter('[_moz_dirty]').length != 0) {
            if (domNode.getAttribute('_moz_dirty') !== null) {
                // <debug>
                ddt.log('_backspaceZeroSpace(): moz_dirty filthy BR encountered. Stop word');
                // </debug>

                return 'stop';
            }

            // depends on what we find in front of the BR. Could be a textnode, could be some
            // other element or might be the beginning of a container.
            if (domNode.previousSibling == null) {

                // <debug>
                ddt.log('_backspaceZeroSpace(): beginning of container');
                // </debug>

                this._setCaretPositionRelative(domNode, 'before');

                domNode.parentNode.removeChild(domNode);

                // tell the caller we moved the cursor.
                return true;
            }

            if (domNode.previousSibling.nodeType != 3) {

                // <debug>
                ddt.log('_backspaceZeroSpace(): previous element is NOT a textnode :', domNode.previousSibling);
                // </debug>

                // 添加
                if (domNode.previousSibling.nodeName == 'BR') {
                    var preNode = domNode.previousSibling;
                    preNode.parentNode.removeChild(preNode);
                }

                this._setCaretPositionRelative(domNode, 'before');
                domNode.parentNode.removeChild(domNode);

                // tell the caller we moved the cursor.
                return true;

            }

            // arrive here if we have a text node. move the cursor to the end of the text node.
            this._setCaretPositionRelative(domNode.previousSibling, 'end');
            domNode.parentNode.removeChild(domNode);

        }

        // arrive here if we have a text node for an end point.
        endLocation = this._getCaretPosition();

        if ((startLocation = this._walkTextNode(endLocation.domNode, endLocation.offset, 'left', backspace)) == false) {
            console.error('_backspaceZeroSpace(): walkTextNode return false');

            return false;
        }

        // <debug>
        ddt.log('_backspaceZeroSpace(): got startLocation: ', startLocation);
        // </debug>

        sel = document.getSelection();
        range = document.createRange();

        var startNode = startLocation.domNode;

        // the startLocation may be an element (object) which we do not want to delete here.
        // this method should just delete the zerospace chars.
        if (startNode.nodeType != 3) {
            range.setStartAfter(startNode);
        } else {
            range.setStart(startNode, startLocation.offset);
        }

        if (backspace) {
            if (startNode.nodeName == 'BR') {
                range.setStartBefore(startNode);
            } else if (startNode.nodeType == 3) {
                if (startNode === endLocation.domNode && startLocation.offset > 0 ||
                    endLocation.offset == 0 && startLocation.offset == startNode.nodeValue.length && startLocation.offset > 0) {
                    var s = startLocation.offset - 1;
                    if (s > 0 && startNode.nodeValue.charCodeAt(s - 1) == '55357') { // 两个字符组成的emoji
                        s--;
                    }
                    range.setStart(startNode, s);
                }

            }
        }

        range.setEnd(endLocation.domNode, endLocation.offset);
        range.deleteContents();

        sel.removeAllRanges();
        sel.addRange(range);

        this._saveRange();

        return true;

    },
    // end of _backspaceZeroSpace()
    /**
     * delete over zero width space character
     *
     * This is the analog to _backspaceZeroSpace for the delete button case.
     * When delete is pressed, we may have any number of non printing whitespace
     * characters between us and the next visible item.
     *
     * @return {String|Boolean} true if characters were removed, false if nothing changed, 'stop' if we encountered a stop word
     */

    _deleteZeroSpace() {

        var domNode = null,
            deleteFlag = false,
            runawayBrake = 0,
            caretPosition = null,
            location,
            startLocation,
            endLocation,
            sel = null,
            range = null;

        startLocation = this._getCaretPosition();

        // <debug>
        ddt.log('_deleteZeroSpace(): current dom node is :', startLocation.domNode);
        // </debug>

        // Unlike backspace, all we care about are non-printing text nodes.
        if (startLocation.domNode.nodeType != 3) {

            // <debug>
            ddt.log(`_deleteZeroSpace(): deleting NON-TEXT "${startLocation.domNode.nodeName}" node`);
            // </debug>

            return false;
        }

        // we have a text node.
        if ((endLocation = this._walkTextNode(startLocation.domNode, startLocation.offset, 'right')) == false) {
            console.error('_deleteZeroSpace(): walkTextNode return false');

            return false;
        }

        // <debug>
        ddt.log('_deleteZeroSpace(): got start and endLocation: ', startLocation, endLocation);
        // </debug>

        // if we did not skip over any non-printing characters, do nothing.
        // NOTE: === comparison here checks to see if the two nodes are the same node, not just the same type.
        if (startLocation.domNode === endLocation.domNode && startLocation.offset == endLocation.offset) {

            // <debug>
            ddt.log('_deleteZeroSpace(): _walkTextNode() did not move cursor');
            // </debug>

            return false;
        }

        sel = document.getSelection();
        range = document.createRange();

        range.setStart(startLocation.domNode, startLocation.offset);

        // the endLocation may be an element (object) which we do not want to delete here.
        // this method should just delete the zerospace chars.
        if (endLocation.domNode.nodeType != 3) {
            // <debug>
            ddt.log('_deleteZeroSpace(): setting end of range before domNode');
            // </debug>
            range.setEndBefore(endLocation.domNode);
        } else {
            // <debug>
            ddt.log(`_deleteZeroSpace(): setting end of range at offset "${endLocation.offset}"`);
            // </debug>
            range.setEnd(endLocation.domNode, endLocation.offset);
        }

        range.deleteContents();

        sel.removeAllRanges();
        sel.addRange(range);

        this._saveRange();

        return true;

    },
    // end of _deleteZeroSpace()

    /**
     * walk through document nodes forwards or backwards searching for text/object boundaries
     *
     * This method walks through DOM nodes in forward or backward directional order searching
     * for:
     *
     *   an embedded object
     *   a non zero width text node character
     *  a container element
     *   the beginning or end end of a parent container.
     *   a moz_dirty BR
     *
     * During the process of editing the contents of the contenteditable node, browsers can insert
     * a number of different elements in various circumstances. For the purposes of emulating a
     * textarea, some elements, such as a BR in a <DIV>, are treated as zero width characters.
     *
     * It should also be noted that Chrome especially is fond of deeply nesting DIVs when
     * breaking an rejoining lines.
     *
     * @param {Node} domNode domNode to start searching from
     * @param {Integer} caretPosition offset if domNode is a textNode. -1 otherwise.
     * @param {String} direction direction to search 'left' or 'right'
     *
     * @return {Object|Boolean} with keys domNode, offset, type, preventDefault, checkForObjects
     *
     * @todo need to handle multiple BRs
     * @todo only P and DIVs are used as containers in Chrome/MSIE. Need to generalize support for other containers such as bold, lists, etc.
     */

    _treeWalker(domNode, caretPosition, direction) {

        var location = {
            type: ''
        };
        var loopBrake = 100;

        // used to note if we jumped a container at any point and thereby have to prevent the default
        // action on any event callback.
        var preventDefaultFlag = false;

        // keeps track of whether or not we've spanned a container.
        var containerSpannedFlag = false;

        // <debug>
        ddt.log(`_treeWalker(): top searching "${direction}" caretPosition "${caretPosition}" current node: `, domNode);
        // </debug>

        while (domNode != null) {

            // to avoid those times I make a mistake and lock the browser.
            if (loopBrake-- <= 0) {
                console.error('_treeWalker(): runaway loop');

                return false;
            }

            // if we have a text node that contains anything other than zero width space characters we
            // return it.
            if (domNode.nodeType == 3) {

                // <debug>
                ddt.log(`_treeWalker(): we have a text node with contents "${domNode.nodeValue}" and caretPosition "${caretPosition}"`);
                // </debug>

                if ((location = this._walkTextNode(domNode, caretPosition, direction)) == false) {
                    console.error('_treeWalker(): walkTextNode returned false');

                    return false;
                }

                // <debug>
                ddt.log('_treeWalker(): walkTextNode() returned: ', location);
                // </debug>

                // there are several cases:
                //
                //  .   either end of the editable div
                //  .   either end of a container
                //  .   adjacent to an object
                //  .   in a text node with non-zero-width space character.
                switch (location.type) {

                    case 'text':

                        // <debug>
                        ddt.log('_treeWalker(): _walkTextNode() returned a textnode');
                        // </debug>

                        // if we end up with a zero width textnode, loop around and do it again.
                        if (location.domNode.nodeValue.length > 0) {
                            // <debug>
                            ddt.log('_treeWalker(): _walkTextNode() returned a normal text node');
                            // </debug>

                            location.preventDefault = preventDefaultFlag;

                            return location;
                        }

                        // <debug>
                        ddt.log('_treeWalker(): _walkTextNode() returned a 0 width text node');
                        // </debug>

                        if (direction == 'left') {
                            domNode = location.domNode.previousSibling;
                        } else {
                            domNode = location.domNode.nextSibling;
                        }

                        caretPosition = -1;

                        continue;

                    case 'element':
                    case 'object':

                        // likely a BR or DIV.
                        // <debug>
                        ddt.log('_treeWalker(): _walkTextNode() returned an element or object');
                        // </debug>

                        domNode = location.domNode;
                        caretPosition = -1;

                        break;

                        // FIXME: should be named 'container_end' or similar.
                    case 'container':

                        // we walked to the end of a text node and encountered a container.
                        // We need to move to the previous or next sibling of the container.
                        // <debug>
                        ddt.log('_treeWalker() _walkTextNode() encountered the end of a container. need to step out.');
                        // </debug>

                        preventDefaultFlag = true;
                        containerSpannedFlag = true;

                        caretPosition = -1;

                        domNode = location.domNode;

                        break;

                    case 'end':

                        // end of the editable div reached.
                        // <debug>
                        ddt.log('_treeWalker(): at end of editable div');
                        // </debug>

                        return false;

                    default:
                        break;

                } // end of switching over _walkTextNode() reponses
            } // end of we were dealing with a text node.
            if (this._isEmbeddedObject(domNode)) {

                // we have an embedded object.
                // <debug>
                ddt.log('_treeWalker(): we have found an object node: ', domNode);
                // </debug>

                // IMPORTANT: in Webkit if we disable the default behavior on moving right, it won't jump
                // over the object correctly.
                //
                // if we have spanned containers we do not want to highlight the object (i.e. we can be
                // called from highlightObject() 'left' or 'right', and only want to highlight the objects
                // if we have not spanned a container.)
                var checkForObjects = true;

                if (containerSpannedFlag) {
                    checkForObjects = false;
                }

                return {
                    domNode: domNode,
                    offset: -1,
                    type: 'object',
                    preventDefault: preventDefaultFlag,
                    checkForObjects: checkForObjects
                };

            }

            if (domNode.nodeName == 'BR') {

                // we have a BR. skip over it unless it's a moz_dirty which indicates a
                // stopping point.
                // <debug>
                ddt.log('_treeWalker(): we have a BR');
                // </debug>

                // if ($(domNode).filter('[_moz_dirty]').length != 0) {
                if (domNode.getAttribute('_moz_dirty') !== null) {

                    // <debug>
                    ddt.log('_treeWalker(): we have a _moz_dirty BR. stopping');
                    // </debug>

                    return {
                        domNode: domNode,
                        offset: -1,
                        type: 'element',
                        preventDefault: preventDefaultFlag,
                        checkForObjects: false
                    };

                }

                // FIXME: Need to check this in all places where we can get BR's. If we have
                // a few BR's in a row the user may press keys multiple times to get over them.
                return {
                    domNode: domNode,
                    offset: -1,
                    type: 'element',
                    preventDefault: preventDefaultFlag,
                    checkForObjects: false
                };

            }

            // special handling for a container we encounter. We dive into the container and start
            // from the end based on direction, but only if we haven't just stepped out of the same
            // container as a result of _walkTextNode(). See above. Ugly, I know.
            if (location.type != 'container' && (domNode.nodeName == 'DIV' || domNode.nodeName == 'SPAN' || domNode.nodeName == 'P')) {

                // <debug>
                ddt.log(`_treeWalker(): we have found a container of type "${domNode.nodeName}" :`, domNode);
                // </debug>

                preventDefaultFlag = true;
                containerSpannedFlag = true;

                // we have encountered a container at one end or the other.
                //
                // e.g. something like <div>text<div><span>object</span></div>
                //
                // or <div>text</div><div>text</div>
                //
                // or <div><div><div>test</div></div></div>
                //
                // in the last case we want to jump into the div's to the end of 'test'
                // regardless of the level of nesting. Chrome, when editing and merging/splitting
                // lines seems to like nesting div's. I haven't had much luck reliably modifying
                // the markup (seems to confuse Chrome), so I'm just treating multiply nested
                // div's as a single newline. (which is who it's actually rendered in the
                // contenteditable div anyway).
                //
                // However, the container boundary is a stop IF the last/first child node
                // is itself NOT a container (i.e. stop on objects, text but not
                // nested divs or p's)
                //
                // So, if there is some node we can step into at the end of the container
                // we return the container and let our caller step into it. Otherwise we loop
                //
                // does our container have children?
                if (domNode.childNodes.length == 0) {
                    // <debug>
                    ddt.log('_treeWalker(): container with 0 children. adding text node and returning.');
                    // </debug>

                    var textnode = this._insertEmptyNode(domNode, 'child');

                    return {
                        domNode: textnode,
                        offset: 0,
                        type: 'child',
                        preventDefault: preventDefaultFlag,
                        checkForObjects: false
                    };
                }

                // inspect the child node at the end.
                var childNode = null;

                if (direction == 'left') {

                    // <debug>
                    ddt.log(`_treeWalker(): LEFT: getting child of container at position "${domNode.childNodes.length - 1}"`);
                    // </debug>

                    childNode = domNode.childNodes[domNode.childNodes.length - 1];
                } else {
                    childNode = domNode.childNodes[0];
                }

                // guard against the possibility of some other unexpected markup making it
                // into the DIV.
                //
                // FIXME: in the future we'll probably want to support all kinds of markup to make
                // the editable area more expressive.
                if (childNode.nodeType != 3 && !this._isEmbeddedObject(childNode) && childNode.nodeName != 'DIV' && childNode.nodeName != 'P' && childNode.nodeName != 'BR') {
                    // <debug>
                    ddt.log(`_treeWalker(): returning a container that has an element child node "${childNode.nodeName}"`);
                    // </debug>

                    return {
                        domNode: domNode,
                        offset: -1,
                        type: 'child',
                        preventDefault: preventDefaultFlag,
                        checkForObjects: false
                    };
                }

                // HACK: special check for Chrome. Make sure to stop if we enter into a DIV containing
                // just a zero width space character. Otherwise after the user presses enter a bunch of times
                // we may end up skipping lines on moving LEFT or RIGHT.
                if (childNode.nodeType == 3 && childNode.nodeValue.match(/^[\u200B]+$/) != null) {
                    // <debug>
                    ddt.log('_treeWalker(): webKit hack. empty DIV with zero width space. Stopping');
                    // </debug>

                    return {
                        domNode: childNode,
                        offset: 0,
                        type: 'child',
                        preventDefault: preventDefaultFlag,
                        checkForObjects: false
                    };

                }

                // <debug>
                ddt.log(`_treeWalker(): bottom of loop, container with "${domNode.childNodes.length}" children, child at end of container is:`, childNode);
                // </debug>

                domNode = childNode;

                continue;

            } // end of if we found a container
            // this is not the node you are looking for, move along.
            //
            // Check the previous or next node. If we are at the end of the current
            // container and our parent is not the editable node. move up a level.
            if (direction == 'left' && domNode.previousSibling == null || direction == 'right' && domNode.nextSibling == null) {

                // <debug>
                ddt.log('_treeWalker(): we have come to an end of a container.');
                // </debug>

                // if our parent is the contenteditable div, then we have come to the end and have not
                // found what we were looking for.
                if (domNode.parentNode === this.inputElement.dom) {

                    // <debug>
                    ddt.log('_treeWalker(): we have come to the beginning or end of the editable div and not found a stopping point');
                    // </debug>

                    return false;

                }

                // otherwise move up a level and continue walking.
                domNode = domNode.parentNode;

                // <debug>
                ddt.log('_treeWalker(): moving up to parent level: ', domNode);
                // </debug>

            } // end of if we are at the beginning or end of a container
            if (direction == 'left') {
                domNode = domNode.previousSibling;
            } else {
                domNode = domNode.nextSibling;
            }

            // we use location.type as an ugly flag;
            location.type = '';

        } // end of while loop
        console.error('_treeWalker(): outside of while.');

        return false;

    },
    //  end of _treeWalker()
    /**
     * skips zero width space characters
     *
     * WebKit browsers do not seem to merge textnodes together when lines are merged or
     * sections of a line are deleted. This method skips any number of adjacent zero width
     * spaces in any number of adjacent text nodes.
     *
     * May return types:
     *
     *       a text node and offset -    type == 'text'
     *       an embedded object -        type == 'object'
     *       an element (usually br) -   type == 'element'
     *       a parent container          type == 'container'
     *       beginning/end of the div -  type == 'end'
     *
     * @param {Node} domNode textNode to start search
     * @param {Integer} caretPosition offset in node to start search. -1 for beginning or end.
     * @param {String} direction direction to search 'left' or 'right'
     *
     * @return {Object|Boolean} with keys domNode, offset and type. false on error.
     */

    _walkTextNode(domNode, caretPosition, direction, allowZeroSpace) {

        var loopBrake = 200;

        // guard against getting some other node.
        if (domNode.nodeType != 3) {
            console.error(`_walkTextNode(): called with a "${domNode.nodeName}" node`);

            return false;
        }

        // -1 is a hack to indicate starting from one end or the other depending on direction.
        if (caretPosition == -1) {
            if (direction == 'left') {
                caretPosition = domNode.nodeValue.length;
            } else {
                caretPosition = 0;
            }
        }

        // <debug>
        ddt.log(`_walkTextNode(): direction "${direction}" starting with char is "${domNode.nodeValue.charAt(caretPosition)}" at position "${caretPosition}" length "${domNode.nodeValue.length}" parent is :`, domNode.parentNode);
        // </debug>

        // remember that we can inconveniently have zerospace characters anywhere after
        // inserts of lines and objects and subsequent deletes.
        switch (direction) {

            case 'left':

                var checkSiblings = false;

                if (caretPosition == 0) {
                    checkSiblings = true;
                }

                while (true) {

                    // <debug>
                    ddt.log(`_walkTextNode(): top of left loop, char is "${domNode.nodeValue.charAt(caretPosition)}" at position "${caretPosition}" length "${domNode.nodeValue.length}"`);
                    // </debug>

                    // for when I make a mistake and loop endlessly.
                    if (loopBrake-- <= 0) {
                        console.error('_walkTextNode(): runaway loop. braking');

                        return false;
                    }

                    // if the caret is pointing at the first character of the string
                    // i.e. offset 0, check the previous node.
                    if (checkSiblings) {

                        checkSiblings = false;

                        // <debug>
                        ddt.log('_walkTextNode(): checking previousSibling');
                        // </debug>

                        // are we at the beginning of a container?
                        if (domNode.previousSibling == null) {
                            // <debug>
                            ddt.log('_walkTextNode(): beginning of container found.');
                            // </debug>

                            // we might be at the beginning of the editable div.
                            if (domNode.parentNode === this.inputElement.dom) {
                                // <debug>
                                ddt.log('_walkTextNode(): end of editable div');
                                // </debug>

                                return {
                                    domNode: domNode,
                                    offset: 0,
                                    type: 'end',
                                    preventDefault: false,
                                    checkForObjects: true
                                };
                            }

                            // we are at the beginning of a container.
                            // The caller will check the container's previousSibling.
                            // <debug>
                            ddt.log('_walkTextNode(): stepping out of a container to parent:', domNode.parentNode);
                            // </debug>

                            return {
                                domNode: domNode.parentNode,
                                offset: -1,
                                type: 'container',
                                preventDefault: false,
                                checkForObjects: true
                            };

                        } // end of if we reached the beginning of a container.
                        // is the sibling not a text node?
                        if (domNode.previousSibling.nodeType != 3) {

                            // <debug>
                            ddt.log('_walkTextNode(): previousSibling is NOT a text node:', domNode.previousSibling);
                            // </debug>

                            domNode = domNode.previousSibling;

                            return {
                                domNode: domNode,
                                offset: -1,
                                type: 'element',
                                preventDefault: false,
                                checkForObjects: true
                            };

                        }

                        domNode = domNode.previousSibling;

                        // we always look to the left of the caret. Start past the end of the string.
                        if ((caretPosition = domNode.nodeValue.length) == 0) {

                            // should not happen, no?
                            // <debug>
                            ddt.log('_walkTextNode(): zero length textnode encountered');
                            // </debug>

                            caretPosition = 0;

                            checkSiblings = true;

                            continue;

                        }

                    } // end of if we were at the beginning of a text node.
                    // the range startOffset returns the offset of the character to the
                    // the right of the caret. So, when searching left, we need to examine
                    // the previous character. Hence the -1 here.
                    if (domNode.nodeValue.charAt(caretPosition - 1) != '\u200B') {

                        // <debug>
                        ddt.log(`_walkTextNode(): Not a zero width space at position "${caretPosition}" is a "${domNode.nodeValue.charCodeAt(caretPosition - 1)}"`);
                        // </debug>

                        return {
                            domNode: domNode,
                            offset: caretPosition,
                            type: 'text',
                            preventDefault: false,
                            checkForObjects: false
                        };

                    } else if (allowZeroSpace) {
                        // <debug>
                        ddt.log(`_walkTextNode(): A zero width space at position "${caretPosition}" is a "${domNode.nodeValue.charCodeAt(caretPosition - 1)}"`);
                        // </debug>

                        return {
                            domNode: domNode,
                            offset: caretPosition,
                            type: 'text',
                            preventDefault: false,
                            checkForObjects: false
                        };
                    }

                    // <debug>
                    ddt.log(`_walkTextNode(): found a zero width space char at offset "${caretPosition - 1}"`);
                    // </debug>

                    caretPosition--;

                    if (caretPosition == 0) {
                        checkSiblings = true;
                    }

                } // end of while loop.

                // ----------------------------------------------------------
            case 'right':

                while (true) {

                    // for when I make a mistake.
                    if (loopBrake-- <= 0) {

                        console.error('_walkTextNode(): runaway loop. braking');

                        return false;
                    }

                    // we search to the end of the string.
                    if (caretPosition == domNode.nodeValue.length) {

                        // <debug>
                        ddt.log('_walkTextNode(): we are at the end of the string.');
                        // </debug>

                        if (domNode.nextSibling == null) {

                            // <debug>
                            ddt.log('_walkTextNode(): end of container found :', domNode);
                            // </debug>

                            // we might be at the end of the editable div.
                            if (domNode.parentNode === this.inputElement.dom) {
                                // <debug>
                                ddt.log('_walkTextNode(): end of editable div');
                                // </debug>

                                return {
                                    domNode: domNode,
                                    offset: caretPosition,
                                    type: 'end',
                                    preventDefault: false,
                                    checkForObjects: false
                                };
                            }

                            // we are at the end of a container. The call will check the
                            // container's nextSibling.
                            // <debug>
                            ddt.log('_walkTextNode(): stepping out of a container');
                            // </debug>

                            // There is an edge case which is namely we do not want to step out of
                            // the contenteditable div.
                            if (domNode.parentNode === this.inputElement.dom) {

                                // <debug>
                                ddt.log('_walkTextNode(): attempted to step out of editable div.');
                                // </debug>

                                // we'll insert a textnode in this case and return that.
                                var textnode = this._insertEmptyNode(domNode, 'after');

                                return {
                                    domNode: textnode,
                                    offset: 0,
                                    type: 'end',
                                    preventDefault: false,
                                    checkForObjects: true
                                };

                            }

                            return {
                                domNode: domNode.parentNode,
                                offset: -1,
                                type: 'container',
                                preventDefault: false,
                                checkForObjects: true
                            };

                        }

                        // we may encounter an element, likely a BR.
                        if (domNode.nextSibling.nodeType != 3) {

                            // <debug>
                            ddt.log('_walkTextNode(): nextSibling is NOT a text node:', domNode.nextSibling);
                            // </debug>

                            domNode = domNode.nextSibling;

                            return {
                                domNode: domNode,
                                offset: -1,
                                type: 'element',
                                preventDefault: false,
                                checkForObjects: true
                            };

                        }

                        // <debug>
                        ddt.log('_walkTextNode(): moving to nextSibling');
                        // </debug>

                        domNode = domNode.nextSibling;

                        caretPosition = 0;

                        // this should not happen, no?
                        if (domNode.nodeValue.length == 0) {

                            // should not happen, no?
                            // <debug>
                            ddt.log('_walkTextNode(): zero length textnode encountered');
                            // </debug>

                            continue;

                        }

                    }

                    if (domNode.nodeValue.charAt(caretPosition) != '\u200B') {

                        // <debug>
                        ddt.log(`_walkTextNode(): Not a zero width space at position "${caretPosition}". Found "${domNode.nodeValue.charCodeAt(caretPosition)}"`);
                        // </debug>

                        return {
                            domNode: domNode,
                            offset: caretPosition,
                            type: 'text',
                            preventDefault: false,
                            checkForObjects: true
                        };

                    }

                    caretPosition++;

                } // end of while loop.

            default:
                break;

        } // end of switch
    },
    // end of _walkTextNode()
    /**
     * highlights objects
     *
     * Checks to see if the cursor is near an object and sets the highlight class on it. Removes it
     * from all other objects. This is useful to let the user know that they'll delete the
     * object on a backspace.
     */

    _highlightObject() {

        var object = false;

        // <debug>
        ddt.log('_highlightObject(): top with this', this);
        // </debug>

        this._unHighlightObjects(this.inputElement);

        // if we have moved next to an embedded object, such that another
        // backspace will delete the object (in onKeyDown()), highlight the
        // object. (or if we're in front of it and a delete will delete it.)
        // <debug>
        ddt.log('_highlightObject(): checking for prev object');
        // </debug>

        if (object = this._checkForAdjacentObject('left')) {

            // <debug>
            ddt.log('_highlightObject(): check for object to left returned:', object);
            // </debug>

            if (!object.container_spanned) {
                Ext.fly(object.domNode).addCls('highlight');
            }

        }

        // <debug>
        ddt.log('_highlightObject(): checking for next object');
        // </debug>

        if (object = this._checkForAdjacentObject('right')) {

            // <debug>
            ddt.log('_highlightObject(): check for object to right returned:', object);
            // </debug>

            if (!object.container_spanned) {
                Ext.fly(object.domNode).addCls('highlight');
            }

        }

    },
    // end of _highlightObject()
    /**
     * clears highlighting
     *
     * recurses through the contenteditable div and un-highlights all objects.
     *
     * It should be noted that the browser can add a bunch of different element types
     * as the user enters content. This varies by browser.
     *
     * @param {jQuery} jQuery object representing the contenteditable div.
     */

    _unHighlightObjects(el) {

        el.select('[data-value].highlight').removeCls('highlight');

    },
    // end of _unHighlightObjects()
    /**
     * sets the caret to a position in a textnode
     *
     * @param {Object} textNode textnode being selected
     * @param {Integer} offset offset in textnode to set caret to
     */

    _selectTextNode(textNode, offset) {

        // if we do not receive a textnode it's an error
        if (textNode.nodeType != 3) {

            console.error(`_selectTextNode(): ERROR - node of type "${textNode.nodeName}" received.`);

            return false;

        }

        // <debug>
        ddt.log(`_selectTextNode(): setting offset "${offset}" in text node of length "${textNode.nodeValue.length}"`);
        // </debug>

        var selection = document.getSelection(),
            range = document.createRange();

        range.setStart(textNode, offset);
        range.setEnd(textNode, offset);
        range.collapse(true);

        selection.removeAllRanges();
        selection.addRange(range);

        this._saveRange(range);

    },

    /**
     * sets the caret position relative to a domNode.
     *
     * sets a caret position relative to a domNode.
     *
     * If the domNode points to an embedded object, (i.e. an element with a data-value) zero width space
     * characters are taken into account, and potentially inserted.
     *
     * There are a number of issues using the range.setStartBefore() method. It never seems to select
     * exactly what I want. To work around this, zero width space characters are used to enable
     * explicitly selecting before or after a given node.
     *
     * @param {Node} domNode domNode to use as a reference point for the caret position.
     * @param {String} position may be 'before', 'after', 'end','beginning'
     *
     * @see http://a-software-guy.com/2013/01/problems-with-range-setstartbefore/
     */

    _setCaretPositionRelative(domNode, position) {
        var sel = document.getSelection(),
            range = null;

        // <debug>
        ddt.log(`_setCaretPositionRelative(): moving "${position}" relative to :`, domNode);
        // </debug>

        if (domNode.previousSibling != null) {
            // <debug>
            ddt.log('_setCaretPositionRelative(): with previousSibling: ', domNode.previousSibling);
            // </debug>
        }

        if (this._isEmbeddedObject(domNode)) {

            // <debug>
            ddt.log(`_setCaretPositionRelative(): setting caret position "${position}" relative to an embedded object. getting object range.`);
            // </debug>

            // it's an object so get the range with potentially wrapping
            // zero width space text nodes around it.
            range = this._getObjectRange(domNode);

            // <debug>
            ddt.log('_setCaretPositionRelative(): got object range: ', range);
            // </debug>

            switch (position) {

                case 'before':
                case 'beginning':

                    // <debug>
                    ddt.log('_setCaretPositionRelative(): collapsing to start of range around object');
                    // </debug>

                    range.collapse(true);

                    break;

                case 'after':
                case 'end':

                    // <debug>
                    ddt.log('_setCaretPositionRelative(): collapsing to end of range around object');
                    // </debug>

                    range.collapse(false);

                    break;

                default:
                    break;

            }

            sel.removeAllRanges();
            sel.addRange(range);

            this._saveRange();

            return;

        } // end of if we were selecting an inserted object.
        // selecting a single cursor position.
        range = sel.getRangeAt(0);

        switch (position) {

            case 'before':

                // for a BR use the zero width space character trick and set the range explicitly.
                if (domNode.nodeName == 'BR') {
                    // <debug>
                    ddt.log('_setCaretPositionRelative(): "before" with a "BR"');
                    // </debug>

                    var textnode = this._insertEmptyNode(domNode, 'before');

                    this._setCaretPositionRelative(textnode, 'end');

                    return;
                }

                range.setStartBefore(domNode);
                range.setEndBefore(domNode);
                range.collapse(true);

                sel.removeAllRanges();
                sel.addRange(range);

                this._saveRange();

                var caret = this._getCaretPosition();

                break;

            case 'after':

                // for a BR use the zero width space character trick and set the range explicitly.
                if (domNode.nodeName == 'BR') {
                    // <debug>
                    ddt.log('_setCaretPositionRelative(): "after" with a "BR"');
                    // </debug>

                    // FIXME: this is probably a hack. For a BR, position the cursor
                    // before the BR and let the browser move the cursor to the other
                    // side of the BR on it's own.
                    range.setStartBefore(domNode);
                    range.setEndBefore(domNode);

                    range.collapse(false);

                    sel.removeAllRanges();
                    sel.addRange(range);

                    this._saveRange();

                    break;
                }

                range.setStartAfter(domNode);
                range.setEndAfter(domNode);

                range.collapse(false);

                sel.removeAllRanges();
                sel.addRange(range);

                this._saveRange();

                break;

            case 'beginning':

                // we only want this to work on text nodes
                if (domNode.nodeType != 3) {
                    console.error('_setCaretPositionRelative(): beginning not on a text node: ', domNode);

                    return;
                }

                range.setStart(domNode, 0);
                range.setEnd(domNode, 0);

                range.collapse(false);

                sel.removeAllRanges();
                sel.addRange(range);

                this._saveRange();

                break;

            case 'end':

                // we only want this to work on text nodes
                if (domNode.nodeType != 3) {
                    console.error('_setCaretPositionRelative(): end not on a text node: ', domNode);

                    return;
                }

                // 'end' is really one character past the end of the node per
                // docs: http://help.dottoro.com/ljlmndqh.php The range end is
                // one character past the end of the range.
                range.setStart(domNode, domNode.nodeValue.length);
                range.setEnd(domNode, domNode.nodeValue.length);

                range.collapse(false);

                sel.removeAllRanges();
                sel.addRange(range);

                this._saveRange();

                break;

            default:
                break;
        }

        // HACK: with nested DIV's in Mozilla it's possible to move the cursor to the end position
        // no-man's land in the editable DIV. In this case we'll insert a zero-width char at the end
        // and adjust the range accordingly.
        if (range.startContainer.nodeName == 'DIV' && range.startContainer === this.inputElement.dom && range.startOffset == range.startContainer.childNodes.length) {

            console.error('_setCaretPositionRelative(): attempted to break out of div.');

            textnode = this._insertEmptyNode(range.startContainer, 'child');

            this._selectTextNode(textnode, 0);

        }

        // <debug>
        ddt.log('_setCaretPositionRelative(): result range is: ', range);
        // </debug>

    },

    /**
     * determines the range surrounding an embedded object
     *
     * returns a range representing an embedded object making sure the object
     * is bordered by textnodes on both sides.
     *
     * NOTE: In a situation where there are two objects right next to one another
     * there is no empty TEXT node between them but apparently, at least based on
     * testing in Chrome, the range will include the first visible character from the object div,
     * which sucks.
     *
     * To offset this, embedded objects are bounded, when necessary, by zero width
     * space characters, forming an invisible text node, which allows us to form a range
     * to position the cursor between div's, span's, etc.
     *
     * When getting the range position before or after an object, we get the position outside the boundary of
     * these zero width spaces. Despite being zero width they still require a key press to arrow or backspace
     * through which is confusing for the user.
     *
     * @param {Node} domNode node representing the object to create a range for.
     *
     * @return {Range} range object.
     */

    _getObjectRange(domNode) {

        // <debug>
        ddt.log('_getObjectRange(): top');
        // </debug>

        var sel = document.getSelection(),
            range,
            tmpRange = null,
            offset = 0;

        if (sel.rangeCount) {
            range = sel.getRangeAt(0);
        } else {
            console.error('_getObjectRange(): NO RANGE. UNABLE TO MOVE CARET.');

            return;
        }

        // ------------------------ BEFORE OBJECT ----------------------------------------
        // <debug>
        ddt.log('_getObjectRange(): getting position "before" node');
        // </debug>

        var textnode;
        // is there a node?
        if (domNode.previousSibling == null) {

            // <debug>
            ddt.log('_getObjectRange(): BEFORE: No sibling node to the left');
            // </debug>

            // this "should not" happen but still does occasionally if the user manages to
            // delete a last remaining zero width space.
            //
            // we'll patch it up in this case, otherwise there's no getting the selection before
            // the object.
            textnode = this._insertEmptyNode(domNode, 'before');

            range.setStart(textnode, 0);

        } else if (domNode.previousSibling.nodeType != 3) {

            // this is probably due to the browser adding some markup by itself.
            // <debug>
            ddt.log(`_getObjectRange(): BEFORE: sibling to the left NOT A TEXT NODE, it's a "${domNode.previousSibling.nodeName}"`);
            // </debug>

            textnode = this._insertEmptyNode(domNode, 'before');

            range.setStart(textnode, 0);

        } else if (domNode.previousSibling.nodeValue == null) {

            // this shouldn't happen, no?
            // <debug>
            ddt.log('_getObjectRange(): BEFORE: sibling to the left is an EMPTY/NULL TextNode');
            // </debug>

            textnode = this._insertEmptyNode(domNode, 'before');

            range.setStart(textnode, 0);

        } else if (domNode.previousSibling.nodeValue.length == 0) {

            // this shouldn't happen, no?
            // <debug>
            ddt.log('_getObjectRange(): BEFORE: sibling to the left is a 0 length TextNode');
            // </debug>

            textnode = this._insertEmptyNode(domNode, 'before');

            range.setStart(textnode, 0);

        } else {

            // we have a text node with some content. This makes the area before the object
            // selectable.
            // <debug>
            ddt.log('_getObjectRange(): existing text node. setting range to start before object');
            // </debug>

            range.setStart(domNode.previousSibling, domNode.previousSibling.nodeValue.length);

        } // end of else we had a textnode containing characters.
        // ------------------------- AFTER OBJECT -----------------------------------
        tmpRange = document.createRange();

        // is there a node?
        if (domNode.nextSibling == null) {

            // <debug>
            ddt.log('_getObjectRange(): AFTER: No sibling node to the right');
            // </debug>

            // this "should not" happen but still does occasionally if the user manages to
            // backspace over the last remaining zero width space.
            //
            // we'll patch it up in this case, otherwise there's no getting the selection after
            // the object.
            textnode = this._insertEmptyNode(domNode, 'after');

            range.setEnd(textnode, 1);

        } else if (domNode.nextSibling.nodeType != 3) {

            // this is probably due to the browser adding some markup by itself.
            // <debug>
            ddt.log(`_getObjectRange(): AFTER: sibling to the right NOT A TEXT NODE, it's a "${domNode.nextSibling.nodeName}"`);
            // </debug>

            textnode = this._insertEmptyNode(domNode, 'after');

            range.setEnd(textnode, 1);

        } else if (domNode.nextSibling.nodeValue == null) {

            // this shouldn't happen, no?
            // <debug>
            ddt.log('_getObjectRange(): AFTER: sibling to the right is an EMPTY/NULL TextNode');
            // </debug>

            textnode = this._insertEmptyNode(domNode, 'after');

            range.setEnd(textnode, 1);

        } else if (domNode.nextSibling.nodeValue.length == 0) {

            // this shouldn't happen, no?
            // <debug>
            ddt.log('_getObjectRange(): AFTER: sibling to the right is a 0 length TextNode');
            // </debug>

            textnode = this._insertEmptyNode(domNode, 'after');

            range.setEnd(textnode, 1);

        } else {

            // we have a text node with some content.
            // <debug>
            ddt.log('_getObjectRange(): existing text node.');
            // </debug>

            // If this is NOT a zero width text node, add one in for good measure.
            //
            // FIXME: I've been having quite a bit of trouble with moving over objects
            // that are <SPAN>s in FireFox vs. Chrome. When event.preventDefault() is set,
            // Chrome doesn't move the cursor out of the span when moving right. If event.preventDefault
            // is not sent, Chrome works but FireFox sends the caret one too many characters to the right
            // in _moveCaret().
            //
            // Making sure there is an empty text node no matter what seems to solve the situation for
            // both browsers. Yes, this polutes a bunch of extra characters but the user gets the behavior
            // they would expect.
            if (domNode.nextSibling.nodeValue != '\u200B') {
                textnode = this._insertEmptyNode(domNode, 'after');
                range.setEnd(textnode, 1);
            } else {
                range.setEnd(domNode.nextSibling, 1);
            }

        } // end of else we had a textnode containing characters.

        return range;

    },
    // end of _getObjectRange()
    /**
     * returns the caret position in the DOM
     *
     * Returns the current position in the DOM in addition to a character
     * offset if it's a text node.
     *
     * In the case the current node is NOT a text node, offset will be -1 and it will be up
     * to the caller to decide what to do.
     *
     * If the current position is not selectable, inserts a zero-width space character, updates the
     * selection range and return the textnode.
     *
     * @return {Object|Boolean} position with keys domNode and offset or FALSE if not a collapsed range.
     */

    _getCaretPosition() {

        var domNode = null,
            textNode = null,
            embeddedObject = null,

            sel = document.getSelection(),
            range;

        // This may fail if nothing is selected.
        if (sel.rangeCount) {
            range = sel.getRangeAt(0);
        } else {
            if (this.currentRange) {
                range = this.currentRange;
            } else {
                // <debug>
                ddt.log('_getCaretPosition(): unable to get position');
                // </debug>
                return false;
            }
        }

        // <debug>
        ddt.log('_getCaretPosition(): top');
        // </debug>

        if (range.collapsed == false) {
            // <debug>
            ddt.log('_getCaretPosition(): multi-char selection');
            // </debug>
            return false;
        }

        domNode = range.startContainer;

        // ddt.log( "_getCaretPosition(): got container from range of type "' + domNode.nodeName + ''" );
        // The problem is, the user may have selected a node INSIDE an embedded object.
        //
        // If it weren't for the webkit bug of having contenteditable=false items on a line interfering
        // with deletions this would be so much easier.
        //
        // in Mozilla it seems like an endless cat and mouse game to avoid getting "inside"
        // an embedded object
        //
        // Check to see if we are inside an object, regardless of our node type.
        // ddt.log( "_getCaretPosition(): checking to see if this node is or is inside an embedded object :', domNode );
        if (embeddedObject = this._isEmbeddedObject(domNode)) {

            // <debug>
            ddt.log('_getCaretPosition(): we have an embedded object');
            // </debug>

            return {
                domNode: embeddedObject,
                offset: -1
            };

        } // end of if we were inside an embedded object.
        // ddt.log( "_getCaretPosition(): not an embedded object" );
        // do we have a text node?
        if (domNode.nodeType == 3) {

            // ddt.log( "_getCaretPosition(): we have a text node of length "' + domNode.nodeValue.length + '" startOffset "' + range.startOffset + ''" );
            return {
                domNode: domNode,
                offset: range.startOffset
            };

        }

        // If the node is a container, we need to use the offset to get the current element in the
        // container (which should NOT be a text node). This can happen if:
        //
        //      . we are at the end of a container.
        //      . we are between elements.
        //      . we are between a BR and the beginning of a container.
        if (domNode === this.inputElement.dom || domNode.nodeName == 'DIV' || domNode.nodeName == 'P') {

            // <debug>
            ddt.log(`_getCaretPosition(): Got a container (DIV/P) as a parent. We are possibly next to a BR or at the end. startOffset is "${range.startOffset}"`);
            // </debug>

            // This should not occur, but have been encountered an empty container?
            if (domNode.childNodes.length == 0) {

                // <debug>
                ddt.log('_getCaretPosition(): EMPTY CONTAINER! Adding empty text node.');
                // </debug>

                textNode = this._insertEmptyNode(domNode, 'child');

                this._selectTextNode(textNode, 0);

                return {
                    domNode: textNode,
                    offset: 0
                };

            } // end of if we had an empty container.
            // are we at the end of the container? It's possible to get a startOffset that is past the
            // range of childNodes meaning we are at the end of a container. In WebKit browsers this is
            // "unselectable no-man's land"
            if (range.startOffset >= domNode.childNodes.length) {

                // <debug>
                ddt.log('_getCaretPosition(): We are at the end of a container which is unselectable in webKit browsers');
                // </debug>

                // insert a zero space node here and return that.
                textNode = this._insertEmptyNode(domNode, 'after');

                this._selectTextNode(textNode, 1);

                return {
                    domNode: textNode,
                    offset: 1
                };

            } // end of if we were at the end of a container.
            domNode = domNode.childNodes[range.startOffset];

            // ddt.log( "_getCaretPosition(): element at offset is :"' + domNode.nodeName + ''" );
            // this should never be a textnode, correct? If it's a textnode then it should have been
            // returned as the container.
            if (domNode.nodeType == 3) {

                // FIXME: If this happens we don't know where in the node to position the caret.
                // console.error('_getCaretPosition(): THIS SHOULD NOT HAPPEN. TEXTNODE RETURNED AS CONTAINER OFFSET');

                this._selectTextNode(domNode, 0);

                return {
                    domNode: domNode,
                    offset: 0
                };

            }

        } // end of if we had a container.

        // this should never be a text node, correct?
        return {
            domNode: domNode,
            offset: -1
        };

    },

    /**
     * 获取 text 类型 node 节点 的坐标
     *
     * @param {Text} textNode
     * @return
     */
    getTextNodeRegion(textNode) {
        var range = document.createRange();
        range.selectNodeContents(textNode);
        var rects = range.getClientRects();
        if (rects.length > 0) {
            var region = rects[0];

            return new Ext.util.Region(region.top, region.right, region.bottom, region.left);
        }

        return null;
    },

    /**
     * inserts an HTML node replacing the current trigger word.
     *
     * given a block of HTML, inserts it at the current cursor position of a
     * content editable div replacing the trigger word accordingly.
     *
     * A data-value attribute typically representing a server side GUID is added to the top level element
     * of the content.
     *
     * Selection is an object containing:
     *
     *   value: value to be communicated back to server representing the object selected from list
     *   content: block of HTML to insert that visually represents the value.
     *
     * trigger is an object representing the selected trigger word that invoked the selection
     *
     *   startNode - start textNode
     *   startOffset - offset in start textNode
     *   endNode - endNode
     *   endOffset - offset in end textNode
     *
     * NOTE:
     *
     * To work around a browser selection/range limitation, zero width space characters are
     * inserted strategically between adjacent objects to allow us to select that position in a range.
     *
     * @param {Object} trigger trigger word details including startNode, startOffset, endNode, endOffset of trigger word.
     * @param {String} selection containing value and content keys.
     *
     * @see http://stackoverflow.com/questions/14098303/how-to-set-caret-cursor-position-in-a-contenteditable-div-between-two-divs
     */

    _insertSelection(trigger, selection) {

        // <debug>
        ddt.log('_insertSelection(): deleting trigger word based on trigger: ', trigger, ' with currentRange ', this.currentRange);
        // </debug>

        this.replaceWord(trigger, selection.content, selection.value);

        // FIXME: There's a bug in jquery.ui.autocomplete having to do with up and down
        // arrows in FireFox not working. autocomplete intercepts and disables some keypresses.
        // so that Firefox works I've modified ui.autocomplete to not disable keypresses but it
        // looks like (hypothesis) that becuase of that onEnter is getting fired even when a
        // selection menu item is selected.
        //
        // Let onKeyUp know not to handle this enter press.
        this.selectionEntered = true;

    },
    // end of _insertSelection()
    /**
     * replace a word with some html content.
     *
     * Given a text range returned by _getWord(), replaces it with the object provided.
     * Typically used in regex callbacks.
     *
     * @param {Object} wordEntry entry with startNode, startOffset, endNode, endOffset and word
     * @param {String} content HTML content to replace wordEntry with
     * @param {String} dataValue data value to tag inserted html with
     */

    replaceWord(wordEntry, content, dataValue) {

        if (!wordEntry.startNode) return;

        var sel = document.getSelection(),
            range = document.createRange();

        // <debug>
        ddt.log('replaceWord(): deleting word: ', wordEntry);
        // </debug>

        // However, because the fact the WebKit does not merge adjacent textnodes the
        // trigger word may span multiple nodes (and have zero width space characters in between)
        // the trigger sent to us contains the complete range.
        range.setStart(wordEntry.startNode, wordEntry.startOffset);

        // from the docs: The end position of a Range is the first position in the DOM hierarchy that is after the Range.
        range.setEnd(wordEntry.endNode, wordEntry.endOffset + 1);

        range.deleteContents();

        this._saveRange(range);

        // FIXME: I do not understand why but if I apply this here it causes one extra space to get consumed
        // when the object is inserted. This makes no sense to me. Clearly I'm missing something.
        //          sel.removeAllRanges();
        //          sel.addRange( range );
        this.insertObject(content, dataValue);

    },
    /**
     * inserts a textnode with a single zero-width space character.
     *
     * Inserts a zero width textnode before, after or as a child of a given DOM node.
     *
     * @param {Node} domNode node the node should be inserted next to
     * @param {String} position 'before', 'after', 'child' indicating where the node should be inserted.
     * @param {Boolean} force whether or not to force creation of empty text nodes. needed to work around some browser weirdness.
     *
     * @return {Node} textnode inserted or the one that was already present.
     *
     * @todo add checking for presence of an existing empty text node.
     */

    _insertEmptyNode(domNode, direction, force) {

        if (typeof force === 'undefined') {
            force = false;
        }

        var textNode = document.createTextNode('\u200B');

        switch (direction) {

            case 'before':

                // FIXME: we seem to be getting back 0 length text nodes in webkit sometimes. Not sure why.
                if (!force && domNode.previousSibling != null && domNode.previousSibling.nodeType == 3 && domNode.previousSibling.nodeValue.length > 0) {
                    // <debug>
                    ddt.log('_insertEmptyNode(): there\'s already a text node before this node');
                    // </debug>
                    return domNode.previousSibling;
                }

                domNode.parentNode.insertBefore(textNode, domNode);

                break;

            case 'after':

                if (!force && domNode.nextSibling != null && domNode.nextSibling.nodeType == 3 && domNode.nextSibling.nodeValue.length > 0) {
                    // <debug>
                    ddt.log('_insertEmptyNode(): there\'s already a text node after this node');
                    // </debug>
                    return domNode.nextSibling;
                }

                domNode.parentNode.insertBefore(textNode, domNode.nextSibling);

                break;

            case 'child':

                // is the last child of this node already a text node?
                if (domNode.childNodes.length != 0 && domNode.childNodes[domNode.childNodes.length - 1].nodeType == 3) {
                    // <debug>
                    ddt.log('_insertEmptyNode(): there\'s already a text node at the end of this container.');
                    // </debug>
                    return domNode.childNodes[domNode.childNodes.length - 1];
                }

                domNode.appendChild(textNode);

                break;

            default:

                console.error(`_insertEmptyNode(): Invalid direction supplied "${direction}"`);

                break;

        }

        return textNode;

    },

    /**
     * checks a sibling to ensure both sides are selectable.
     *
     * Given a node and a direction, checks the sibling to make sure the places in front of
     * and behind the node are selectable.
     *
     * If it's a container makes sure the container begins and ends with textnodes so that the beginning
     * and end of the container will remain selectable in WebKit browsers.
     *
     * Safeguards against embedded objects.
     *
     * @param {Node} domNode domNode to check for sibling containers
     * @param {String} direction 'prev' or 'next' - checks for previous or next siblings.
     *
     */

    _checkSibling(domNode, direction) {

        var sibling = null;

        // <debug>
        ddt.log('_checkSibling(): domNode is :', domNode);
        // </debug>

        if (direction == 'prev') {
            sibling = domNode.previousSibling;
        } else {
            sibling = domNode.nextSibling;
        }

        // <debug>
        ddt.log('_checkSibling(): sibling is :', sibling);
        // </debug>

        // are we at the beginning or end of a container?
        if (sibling == null) {
            // <debug>
            ddt.log('_checkSibling(): sibling is null.');
            // </debug>

            return;
        }

        if (this._isEmbeddedObject(sibling)) {

            // <debug>
            ddt.log('_checkSibling(): object sibling');
            // </debug>

            // make certain the sibling is wrapped in textnodes
            this._insertEmptyNode(sibling, 'before');
            this._insertEmptyNode(sibling, 'after');

            return;
        }

        // it might be a BR
        if (sibling.nodeName == 'BR') {

            // <debug>
            ddt.log('_checkSibling(): sibling is a BR');
            // </debug>

            // make certain the sibling is wrapped in textnodes
            this._insertEmptyNode(sibling, 'before');
            this._insertEmptyNode(sibling, 'after');

            return;
        }

        // is it not a container?
        if (sibling.nodeName != 'SPAN' && sibling.nodeName != 'DIV' && sibling.nodeName != 'P') {
            // <debug>
            ddt.log(`_checkSibling(): sibling is not a container: "${sibling.nodeName}"`);
            // </debug>

            return;
        }

        // is it an empty container?
        if (sibling.childNodes.length == 0) {

            // <debug>
            ddt.log('_checkSibling(): empty container. adding textnode');
            // </debug>

            this._insertEmptyNode(sibling, 'child');

            return;

        }

        // does it just container a BR? (WebKit)
        if (sibling.childNodes.length == 1 && sibling.childNodes[0].nodeName == 'BR') {

            // <debug>
            ddt.log('_checkSibling(): DIV containing just a BR found. Adding a zero width char.');
            // </debug>

            var tmpNode = sibling.childNodes[0];

            this._insertEmptyNode(tmpNode, 'before');

            tmpNode.parentNode.removeChild(tmpNode);

            return;

        }

        // we have a container and it has child nodes. Insert textnodes at the beginning
        // and end.
        this._insertEmptyNode(sibling.childNodes[0], 'before');
        this._insertEmptyNode(sibling.childNodes[sibling.childNodes.length - 1], 'after');

        return;

    },
    // end of _checkSibling()
    /**
     * determines if the given node is an embedded object (or inside of one)
     *
     * Determines if the domNode passed in is an embedded object or some node inside
     * an embedded object. If so, returns the object, false otherwise.
     *
     * @param {Node} domNode domNode to inspect
     *
     * @return {Node|Boolean} domNode of embedded object or null if not an embedded object
     */

    _isEmbeddedObject(domNode) {

        var embeddedObject = null;

        if (domNode == null) {
            // <debug>
            ddt.log('_isEmbeddedObject(): NULL node passsed in');
            // </debug>
            return false;
        }

        // ddt.log( "_isEmbeddedObject(): inspecting node :', domNode );
        /* if (domNode.nodeType != 3 && domNode.getAttribute('data-value') != null) {
            return domNode;
      }*/

        // ddt.log( "_isEmbeddedObject(): not a TOP LEVEL embedded object node. Is one of our parents?" );
        // we may be any kind of node inside an embedded object
        // return $(domNode).parents('[data-value]').get(0);
        let p = domNode;
        while (p && p !== this.element.dom) {
            if (p.nodeType != 3 && p.hasAttribute && p.hasAttribute('data-value')) {
                return p;
            }
            p = p.parentNode;
        }
        // var p = Ext.fly(domNode).up('[data-value]');
        // return p ? p.dom : undefined;
    },

    // end of _isEmbeddedObject()
    /**
     * insert an object at the current caret position
     *
     * Inserts a block of HTML representing an embedded object. The object
     * is tagged with a provided data-value which represents the value of the
     * object on the server (typically a GUID).
     *
     * The caret is moved to the space after the inserted object.
     *
     * @param {String} content HTML content to add.
     * @param {String} value GUID or other value to associate with the object.
     *
     * @return {Node} dom node of inserted object.
     *
     * @see _saveRange()
     */

    insertText(content) {
        // this.inputElement.dom.focus();
        var textNode = document.createTextNode(content),
            range = this.currentRange;

        if (range === false) {
            this.inputElement.dom.appendChild(textNode);
        } else {

            var sel = document.getSelection();

            range.deleteContents();
            range.insertNode(textNode);
            range.setStartAfter(textNode);
            range.collapse(true);

            sel.removeAllRanges();
            sel.addRange(range);
        }

        this._selectTextNode(textNode, textNode.nodeValue.length);
    },

    insertObject(content, value) {

        // <debug>
        ddt.log(`insertObject(): top with content "${content}" and value "${value}"`);
        // </debug>

        // this method is often invoked from the 'outside' and as such the
        // editable div loses focus which messes up the works.
        this.inputElement.dom.focus();

        // <debug>
        ddt.log('insertObject(): after focus - currentRange is ', this.currentRange);
        // </debug>

        var textnode;
        // we may have lost focus so restore the range we saved after
        // each keypress. However, we also need to take into the account
        // that the user may not have clicked in the editable div at all.
        if (this.currentRange === false) {

            // <debug>
            ddt.log('insertObject(): currentRange is false');
            // </debug>

            // insert a blank text node in the div
            textnode = this._insertEmptyNode(this.inputElement.dom, 'child');

            this._selectTextNode(textnode, 1);

            // _selectTextNode() calls _saveRange() which affects currentRange.
            // I know, ugly side-effect.
        }

        var sel = document.getSelection(),
            range = sel.getRangeAt(0);

        // sel.removeAllRanges();
        // sel.addRange(range);

        // for some reason for a range of content returned from the server
        // this results in an expression error.
        //
        // var node = $( content );
        //
        // Trim the content just in case we have a few whitespace characters leading or following.
        var tempDiv = document.createElement('div');
        tempDiv.innerHTML = content.replace(/^[\s\u200B]+|[\s\u200B]+$/g, '');

        // make sure not to include the wrapping temporary div. We make the
        // assumption here that content is wrapped in some single container tag,
        // either a div or a span.
        /* node = $(tempDiv).contents();

        //<debug>
        ddt.log('insertObject(): node is ', node);
        //</debug>

        node.attr('data-value', value);*/
        var domNode;
        if (tempDiv.childNodes.length > 0) {
            domNode = tempDiv.childNodes[0];
        }
        if (!domNode) return;
        domNode.setAttribute('data-value', value);

        //          FIXME: This breaks webkit browsers. If you press DELETE or backspace such that
        //          two lines are joined, the latter of which has a contenteditable=false item on it
        //          everything from the item to the end of the line will be unceremoniously deleted.
        //
        //          node.attr( 'contenteditable', 'false' );
        // to avoid the mess that results when trying to get a range on the
        // empty/non-existent text node between two objects when they are placed next to
        // one another, we insert zero width space characters as needed. This
        // can then be selected in a range allowing us to move the cursor to the space
        // between the objects, notably in WebKit browsers.
        //
        // Without some kind of character between the <div>'s, the selection will
        // jump to the nearest inside one of the divs. (Which, if you think about it, makes
        // sense from the perspective of a user at the keyboard. You don't want to have to
        // move the arrow key over invisible entities ...)
        //
        // The same problem occurs when an object is placed at the very beginning or very
        // end of the contenteditable div.
        //
        // Unfortunately, zero width space characters do take up a keyboard arrow press,
        // i.e. if you arrow over such a character the cursor doesn't move but you have to
        // press the arrow key once for each such character which is confusing. This is
        // addressed in the onKeyDown() handler. We move the cursor over them.
        // The approach is to add the object then check to see if we have sibling objects
        // before or after us. If not, we add them.
        // var domNode = node.get(0);

        range.insertNode(domNode);
        range.setStartAfter(domNode);
        range.collapse(true);

        sel.removeAllRanges();
        sel.addRange(range);

        // <debug>
        ddt.log('insertObject(): previousSibling is : ', domNode.previousSibling);
        // </debug>

        // check siblings before and after us, if any.
        //
        // And, in Chome and possibly other browsers, if this is the first element there is,
        // an entirely empty text node is insert at the first position.
        // <debug>
        ddt.log('insertObject(): inserting zero width node before selection');
        // </debug>

        // FIXME: Not sure why, but if I don't force the inclusion of empty nodes even if
        // the object is surrounded by text nodes selections break. wtf? (i.e. without this
        // inserting object into the middle of text lines fails in Webkit)
        textnode = this._insertEmptyNode(domNode, 'before', true);

        //          this._selectTextNode( textnode, 1 );
        // if there is no sibling after us or if it's not a text node, add a zero width space.
        // <debug>
        ddt.log('insertObject(): inserting zero width node after selection');
        // </debug>

        var textnode2 = this._insertEmptyNode(domNode, 'after', true);

        // 添加
        var textnode3 = document.createTextNode('\u00A0'); // 空格
        textnode2.parentNode.insertBefore(textnode3, textnode2.nextSibling);


        // FIXME: if this is 0, in Chrome it selects a point in the span.
        this._selectTextNode(textnode3, 1);

        this._value = this.inputElement.dom.value = this.inputElement.getHtml();
    },

    // 添加 获取已经替换过表情的html
    getSubmitValue() {
        var proxy = document.createElement('div');
        proxy.innerHTML = this.inputElement.getHtml();
        Ext.fly(proxy).select('span.r-at').removeCls('highlight');
        Ext.fly(proxy).query('span.em').forEach(node => {
            Ext.DomHelper.insertBefore(node, node.getAttribute('data-value'), false);
            node.parentNode.removeChild(node);
        });

        return proxy.innerHTML.replace(/[\u200B]/gm, '');
    },
    getText() {
        var proxy = document.createElement('div');
        proxy.innerHTML = this.inputElement.getHtml();

        return proxy.textContent.replace(/[\u200B]/gm, '');
    },

    // 添加 获取所有data-value
    getEmbeddedValues() {
        var values = [];
        this._getEmbeddedValues(this.inputElement.dom.childNodes, values);

        return Ext.Array.unique(values);
    },
    _getEmbeddedValues(elems, values) {
        var elem;

        // <debug>
        ddt.log('elems ', elems);
        // </debug>

        for (var i = 0; elems[i]; i++) {

            elem = elems[i];

            // <debug>
            ddt.log(`elem is "${elem.nodeName}"`);
            // </debug>

            if (this._isEmbeddedObject(elem) && !this._isEmoji(elem)) {

                // <debug>
                ddt.log('embedded object found');
                // </debug>
                values.push(elem.getAttribute('data-value'));

                continue;
            }

            if (elem.nodeType !== 8) // comment node
            {
                this._getEmbeddedValues(elem.childNodes, values);
            }
        }
    },

    _isEmoji(domNode) {
        return Ext.fly(domNode).is('span.em');
    },

    /**
     * clears the content of the editable div.
     *
     * Typically used after submit, clears the content of the editable div.
     */

    clear() {
        this.inputElement.setHtml('');
    },

    /**
     * focuses the rich_textarea
     *
     * focuses the rich_textarea and sets the initial selection.
     *
     * @todo this is broken. scoping.
     */
    // 添加方法 聚焦在输入框末尾
    focusEnd() {
        this.inputElement.dom.focus();

        var sel = document.getSelection(),
            range = document.createRange(),
            dom = this.inputElement.dom,
            cn = dom.childNodes,
            startNode;
        if (cn.length > 0 && (startNode = this._walkTextNode(cn[cn.length - 1], cn.length, 'left')) != false) {
            var n = startNode.domNode;
            if (n.nodeType != 3) {
                range.setStartAfter(n);
            } else {
                range.setStart(n, n.nodeValue.length);
            }
        } else {
            range.setStart(dom, 0);
        }
        range.collapse(true);

        sel.removeAllRanges();
        sel.addRange(range);
        this._saveRange();
    }
});