/**
 * 全局设置：为 ajax proxy 设置跨域、提供 api 配置项、默认读取数据的格式、以及异常处理
 */
Ext.define(null, { // 'Ext.overrides.data.proxy.Ajax'
    override: 'Ext.data.proxy.Ajax',

    config: {
        /**
         * 接口地址，除去前面 协议://域名:端口，剩下的后面那部分
         */
        api: null,
        /**
         * 当 proxy 请求失败时，是否把异常信息弹出来(Ext.Msg.alert)
         */
        silence: false,

        useDefaultXhrHeader: false,

        withCredentials: true,

        actionMethods: {
            read: 'POST'
        },
        reader: {
            type: 'json',
            rootProperty: 'root',
            messageProperty: 'message'
        },
        writer: {
            type: 'json'
        }
    },

    updateApi(api) {
        this.setUrl(Utils.getFullUrl(api));
    },

    constructor() {
        var me = this;
        me.callParent(arguments);

        me.on({
            exception(proxy, r, options) { //统一监听proxy的异常

                var err = r.responseText;
                if (!Ext.isEmpty(err)) {
                    try {
                        err = eval(`(${err})`);
                    } catch (e) {}
                } else {
                    err = r.statusText;
                }

                var msg = err.message || err;
                if (r.status == '0') {
                    Utils.toastShort(msg || 'communication failure');
                } else if (r.status == '-1') { // ajax被中止
                    // aborted
                } else if (Utils.isUnauthorized(r.status)) { // 未授权
                    Utils.toastShort(msg);
                    // 转到登录页
                    Utils.getApp().fireEvent('needlogin');
                } else if (!this.getSilence()) {
                    Utils.alert(msg);
                }
                //<debug>
                console.log(arguments);
                //</debug>
            }
        });
    },

    buildRequest() {
        var info = Utils.getApp().getClientInfo();
        if (info) {
            for (var i in info) {
                if (info.hasOwnProperty(i)) {
                    this.setExtraParam(i, info[i]);
                }
            }
        }

        return this.callParent(arguments);
    }
});