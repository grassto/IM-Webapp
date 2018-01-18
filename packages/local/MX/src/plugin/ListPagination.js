/**
 * list 分页 plugin
 * 上一页 1 2 3 下一页
 *
 * 移植自 https://github.com/infusion/jQuery-Paging
 * @author jiangwei
 */
Ext.define('MX.plugin.ListPagination', {
    extend: 'Ext.plugin.Abstract',
    alias: 'plugin.listpagination',

    config: {

        /**
         * @cfg {String} visual format string
         */
        format: '< (qq -) nncnn (- pp) >',

        /**
         * @cfg {Boolean} set to true if you want the next/prev buttons go circular
         */
        circular: false,

        /**
         * @cfg {Function} callback for every format element
         */
        onFormat(type) {

            switch (type) {

                case 'block':

                    if (!this.active) {
                        return `<span class="page disabled">${this.value}</span>`;
                    } else if (this.value != this.page) {
                        return `<a class="page">${this.value}</a>`;
                    }

                    return `<span class="page current">${this.value}</span>`;

                case 'right':
                case 'left':

                    if (!this.active) {
                        return '';
                    }

                    return `<a class="page">${this.value}</a>`;

                case 'next':

                    if (this.active) {
                        return '<a class="page next">下一页</a>';
                    }

                    return '<span class="page disabled">下一页</span>';

                case 'prev':

                    if (this.active) {
                        return '<a class="page prev">上一页</a>';
                    }

                    return '<span class="page disabled">上一页</span>';

                case 'first':

                    if (this.active) {
                        return '<a class="page first">|&lt;</a>';
                    }

                    return '<span class="page disabled">|&lt;</span>';

                case 'last':

                    if (this.active) {
                        return 'a class="page prev">&gt;|</a>';
                    }

                    return '<span class="page disabled">&gt;|</span>';

                case 'fill':
                    if (this.active) {
                        return '...';
                    }

                    return '';

                default:
                    break;
            }

            return '';
        },

        /**
         * @cfg totalCount
         * @inheritdoc Ext.data.AbstractStore#cfg!currentPage
         */
        currentPage: 1,

        /**
         * @cfg pageSize
         * @inheritdoc Ext.data.AbstractStore#cfg!pageSize
         * @private
         */
        pageSize: 0,

        /**
         * @cfg totalCount
         * @inheritdoc Ext.data.AbstractStore#cfg!totalCount
         * @private
         */
        totalCount: 0,

        totalPages: 0,

        /**
         * @cfg {Object} pageCmp
         * @private
         */
        pageCmp: {
            xtype: 'component',
            cls: `${Ext.baseCSSPrefix}listpagination`,
            scrollDock: 'end',
            hidden: true,
            inheritUi: true
        },

        /**
         * @private
         * @cfg {Boolean} loading True if the plugin has initiated a Store load that has not yet completed
         */
        loading: false
    },
    pattern: /[*<>pq[\]().-]|[nc]+!?/g,
    known: {
        '[': 'first',
        ']': 'last',
        '<': 'prev',
        '>': 'next',
        'q': 'left',
        'p': 'right',
        '-': 'fill',
        '.': 'leap'
    },

    applyFormat(format) {
        if (Ext.isString(format)) {
            var me = this,
                known = me.known,
                tok,
                gndx = 0,
                group = 0,
                num = 1,
                res = {
                    fstack: [], // format stack
                    asterisk: 0, // asterisk?
                    inactive: 0, // fill empty pages with inactives up to w?
                    blockwide: 5, // width of number block
                    current: 3, // position of current element in number block
                    rights: 0, // num of rights
                    lefts: 0 // num of lefts
                },
                count = {};

            while (tok = me.pattern.exec(format)) {
                tok = `${tok}`;

                if (undefined === known[tok]) {

                    if ('(' === tok) {
                        group = ++gndx;
                    } else if (')' === tok) {
                        group = 0;
                    } else if (num) {

                        if ('*' === tok) {
                            res.asterisk = 1;
                            res.inactive = 0;
                        } else {
                            // number block is the only thing left here
                            res.asterisk = 0;
                            res.inactive = '!' === tok.charAt(tok.length - 1);
                            res.blockwide = tok.length - res.inactive;
                            if (!(res.current = 1 + tok.indexOf('c'))) {
                                res.current = 1 + res.blockwide >> 1;
                            }
                        }

                        res.fstack.push({
                            ftype: 'block', // type
                            fgroup: 0, // group
                            fpos: 0 // pos
                        });
                        num = 0;
                    }

                } else {

                    res.fstack.push({
                        ftype: known[tok], // type
                        fgroup: group, // group
                        fpos: undefined === count[tok] ? count[tok] = 1 : ++count[tok] // pos
                    });

                    if ('q' === tok) {
                        ++res.lefts;
                    } else if ('p' === tok) {
                        ++res.rights;
                    }
                }
            }

            return res;
        }

        return format;
    },

    /**
     * @private
     * Sets up all of the references the plugin needs
     */
    init(list) {
        var me = this;

        list.on('storechange', 'onStoreChange', me);
        me.bindStore(list.getStore());
        me.addPageCmp();
    },

    destroy() {
        Ext.destroy(this._storeListeners);
        this.callParent();
    },

    /**
     * @private
     */
    onStoreChange(list, store) {
        this.bindStore(store);
    },

    /**
     * @private
     */
    bindStore(store) {
        var me = this,
            listeners = {
                beforeload: 'onStoreBeforeLoad',
                load: 'onStoreLoad',
                add: 'onTotalCountChange',
                remove: 'onTotalCountChange',
                refresh: 'onTotalCountChange',
                clear: 'onTotalCountChange',
                destroyable: true,
                scope: me
            };

        me._storeListeners = Ext.destroy(me._storeListeners);
        if (store) {
            me._storeListeners = store.on(listeners);

            if (store.isLoaded()) {
                me.onTotalCountChange(store);
            }
        }
    },

    updateTotalPages() {
        if (!this.isConfiguring) {
            this.syncState();
        }
    },

    updateCurrentPage(page) {
        var me = this;

        if (!me.isConfiguring) {
            me.cmp.getStore().loadPage(page);
        }
    },

    updateTotalCount(totalCount) {
        if (!this.isConfiguring) {
            this.syncState();
        }
    },

    /**
     * @private
     * If the Store is just about to load but it's currently empty, we hide the load more button because this is
     * usually an outcome of setting a new Store on the List so we don't want the load more button to flash while
     * the new Store loads
     */
    onStoreBeforeLoad(store) {
        const me = this,
            list = me.cmp;
        me.setLoading(true);

        me.currentScrollToTopOnRefresh = list.getScrollToTopOnRefresh();
        list.setScrollToTopOnRefresh(false);
    },
    onStoreLoad(store) {
        const me = this,
            list = me.cmp;
        if(me.isTapLoadPage) {
            list.fireEvent('tappageloaded', list);
        }
        me.isTapLoadPage = false;
    },
    /**
     * @private
     * Makes sure we add/remove the loading CSS class while the Store is loading
     */
    updateLoading(isLoading) {
        this.getPageCmp().toggleCls(this.loadingCls, isLoading);
    },

    /**
     * @private
     */
    getPageData() {
        var list = this.cmp,
            store = list.getStore(),
            totalCount = store.getTotalCount() || store.getCount(),
            pageSize = store.pageSize,
            pageCount = Math.ceil(totalCount / pageSize);

        return {
            totalCount: totalCount,
            totalPages: Ext.Number.isFinite(pageCount) ? pageCount : 1,
            currentPage: store.currentPage,
            pageSize: pageSize
        };
    },

    onTotalCountChange(store) {
        var me = this,
            data = me.getPageData();

        me.bulkConfigs = true;
        me.setConfig(data);
        me.bulkConfigs = false;
        me.syncState();
    },

    /**
     * @private
     * Because the attached List's inner list element is rendered after our init function is called,
     * we need to dynamically add the loadMoreCmp later. This does this once and caches the result.
     */
    addPageCmp() {
        var me = this;

        if (!me.isAdded) {
            me.cmp.add(me.getPageCmp());
            me.isAdded = true;
            me.syncState();
        }
    },

    /**
     * @private
     */
    applyPageCmp(config, instance) {
        return Ext.updateWidget(instance, config, this, 'createPageCmp');
    },

    createPageCmp(config) {
        return Ext.apply({
            //weight: -100 // 顺序
        }, config);
    },

    updatePageCmp(pageCmp, old) {
        Ext.destroy(old);

        if (pageCmp) {
            pageCmp.element.on({
                delegate: 'a',
                tap: 'onTapPageNumber',
                scope: this
            });
        }
    },

    /**
     * @private
     */
    onTapPageNumber(e, el) {
        var me = this;

        me.setCurrentPage(parseInt(el.getAttribute('data-page'), 10));

        me.isTapLoadPage = true;
    },

    privates: {
        loadingCls: `${Ext.baseCSSPrefix}loading`,

        syncState() {
            var me = this,
                list = me.cmp;

            me.setLoading(false);

            if (me.currentScrollToTopOnRefresh !== undefined) {
                list.setScrollToTopOnRefresh(me.currentScrollToTopOnRefresh);
                delete me.currentScrollToTopOnRefresh;
            }

            if (me.bulkConfigs) {
                return;
            }

            var pageCmp = me.getPageCmp(),
                totalCount = me.getTotalCount(),
                currentPage = me.getCurrentPage(),
                totalPages = me.getTotalPages(),
                pageSize = me.getPageSize(),
                format = me.getFormat(),
                onFormat = me.getOnFormat(),
                circular = me.getCircular(),
                rStart,
                rStop;

            // Do we need to print all numbers?
            if (format.asterisk) {
                rStart = 1;
                rStop = 1 + totalPages;

                // Disable :first and :last for asterisk mode as we see all buttons
                format.current = currentPage;
                format.blockwide = totalPages;

            } else {

                // If no, start at the best position and stop at max width or at num of pages
                rStart = Math.max(1, Math.min(currentPage - format.current, totalPages - format.blockwide) + 1);
                rStop = format.inactive ? rStart + format.blockwide : Math.min(rStart + format.blockwide, 1 + totalPages);
            }

            var lapping = 0;

            var groups = 1,
                count = format.fstack.length,
                i = count,
                data,
                tmp,
                node;
            while (i--) {

                tmp = 0; // default everything is visible
                node = format.fstack[i];

                switch (node.ftype) {

                    case 'left':
                        tmp = node.fpos < rStart;
                        break;
                    case 'right':
                        tmp = rStop <= totalPages - format.rights + node.fpos;
                        break;

                    case 'first':
                        tmp = format.current < currentPage;
                        break;
                    case 'last':
                        tmp = format.blockwide < format.current + totalPages - currentPage;
                        break;

                    case 'prev':
                        tmp = 1 < currentPage;
                        break;
                    case 'next':
                        tmp = currentPage < totalPages;
                        break;
                    default:
                        break;
                }
                groups |= tmp << node.fgroup; // group visible?
            }

            data = {
                'number': totalCount, // number of elements
                'lapping': lapping, // overlapping
                'pages': totalPages, // number of pages
                'perpage': pageSize, // number of elements per page
                'page': currentPage, // current page
                'slice': [ // two element array with bounds of the current page selection
                    (tmp = currentPage * (pageSize - lapping) + lapping) - pageSize, // Lower bound
                    Math.min(tmp, totalCount) // Upper bound
                ]
            };

            var buffer = '';

            var bufferAppend = function (data, type) {
                type = `${onFormat.call(data, type)}`;

                if (data.value) {
                    buffer += type.replace(/<a/i, `<a data-page="${data.value}"`);
                } else {
                    buffer += type;
                }
            };


            while (++i < count) {

                node = format.fstack[i];

                tmp = groups >> node.fgroup & 1;

                switch (node.ftype) {
                    case 'block':
                        for (; rStart < rStop; ++rStart) {

                            data.value = rStart;
                            data.pos = 1 + format.blockwide - rStop + rStart;

                            data.active = rStart <= totalPages || totalCount < 0; // true if infinity series and rStart <= pages
                            data.first = 1 === rStart; // check if it is the first page
                            data.last = rStart === totalPages && 0 < totalCount; // false if infinity series or rStart != pages

                            bufferAppend(data, node.ftype);
                        }
                        continue;

                    case 'left':
                        data.value = node.fpos;
                        data.active = node.fpos < rStart; // Don't take group-visibility into account!
                        break;

                    case 'right':
                        data.value = totalPages - format.rights + node.fpos;
                        data.active = rStop <= data.value; // Don't take group-visibility into account!
                        break;

                    case 'first':
                        data.value = 1;
                        data.active = tmp && 1 < currentPage;
                        break;

                    case 'prev':
                        if (data.active = circular) {
                            data.value = currentPage === 1 ? totalPages : currentPage - 1;
                        } else {
                            data.value = Math.max(1, currentPage - 1);
                            data.active = tmp && 1 < currentPage;
                        }
                        break;

                    case 'last':
                        if (data.active = totalCount < 0) {
                            data.value = 1 + currentPage;
                        } else {
                            data.value = totalPages;
                            data.active = tmp && currentPage < totalPages;
                        }
                        break;

                    case 'next':
                        if (data.active = circular) {
                            data.value = 1 + currentPage % totalPages;
                        } else if (data.active = totalCount < 0) {
                            data.value = 1 + currentPage;
                        } else {
                            data.value = Math.min(1 + currentPage, totalPages);
                            data.active = tmp && currentPage < totalPages;
                        }
                        break;

                    case 'leap':
                    case 'fill':
                        data.pos = node.fpos;
                        data.active = tmp; // tmp is true by default and changes only for group behaviour
                        bufferAppend(data, node.ftype);
                        continue;
                    default:
                        break;
                }

                data.pos = node.fpos;
                data.last = /* void */
                    data.first = undefined;

                bufferAppend(data, node.ftype);
            }

            pageCmp.setHtml(buffer);
        }
    }
});