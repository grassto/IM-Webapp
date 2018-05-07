Ext.define('IMCommon.utils.ImgMgr', {
    alternateClassName: 'ImgMgr',
    singleton: true,

    prefix: 'node-', // 节点 id 前缀

    getDom(id) {
        return document.getElementById(id);
    },

    /**
     * 节点是否在 document.body 中
     * @param {HTMLElement} node
     */
    isInBody(node) {
        if (!node) return false;

        if (node.baseURI !== undefined) {
            return !Ext.isEmpty(node.baseURI);
        }

        return Ext.getBody().isAncestor(node);
    },

    parsePic(attId) {
        return [
            '<div class="imgBlock">',
            '<img class="viewPic" src="' + Ext.getResourcePath('images/loading.gif') + '" onload="ImgMgr.loadPic(this)" data-thumb="' + attId + '/thumbnail" data-img="' + attId + '" data-showthumb="Y"/>',
            '</div>'
        ].join('');
    },

    loadPic: function (node) {
        var me = this;
        if (!node || !me.isInBody(node)) return;

        var showThumb = node.hasAttribute('data-showthumb'),
            showProgress = node.hasAttribute('data-showprogress'), // 显示下载进度
            thumb = node.getAttribute('data-thumb'),
            imgId = node.getAttribute('data-img'),
            url = me.getFullPicUrl(showThumb ? thumb : imgId),
            saveDir = showThumb ? User.getThumbDir() : User.getImageDir(),
            picName = imgId;

        node.removeAttribute('onload');
        me._setNodeTipText(node, '加载中'); // 在 <div class="imgCt"> 里放一个 文字提示<div>

        if (Ext.browser.is.Cordova || window.cefMain) { // 如果是 cordova（或者 cef）
            var nodeId = Ext.id(node, me.prefix); // 防止 node 节点没有id，给它一个id

            /* cefFile.downloadImage(url, picName, function(evt) {
                var s = JSON.parse(evt);
                if(s.status == 'completed') {
                    ImgMgr._setNodeSrc(nodeId, s.file_path);
                    return;
                }
            });*/

            FileMgr.downFileForSrc(url, 1, saveDir + picName, {
                downloading(percent) {
                    if (showProgress) {
                        me._setNodeTipText(node, `${percent}%`);
                    }
                }
            }).then(path => {
                ImgMgr._setNodeSrc(nodeId, path);
            }).catch(err => {
                console.error('ImgMgr', 'loadPic failed', err);
                ImgMgr._setNodeSrc(nodeId, '!error');
            });
        } else {
            ImgMgr._setNodeSrc(node, url); // 如果是浏览器，直接 url 赋值给 src
        }
    },

    _setNodeSrc: function (node, src, errTip) {
        if (Ext.isString(node) && !Ext.isEmpty(node)) {
            node = Ext.getDom(node);
        }
        if (!node) return;

        // if (errTip === undefined) errTip = true;

        var me = this;
        var imgLoaded = function (e) {
            var n = e.target;
            n.className += ' loaded';
            n.style.removeProperty('background-color');
            n.removeAttribute('width');
            n.removeAttribute('height');
            if (n.hasAttribute('_width')) {
                n.setAttribute('width', n.getAttribute('_width'));
                n.removeAttribute('_width');
            }
            if (n.hasAttribute('_height')) {
                n.setAttribute('height', n.getAttribute('_height'));
                n.removeAttribute('_height');
            }
            n.removeEventListener('load', imgLoaded, false);
            me._removeNodeTip(n);
        };
        var imgLoadErr = function (e) {
            var n = e.target;
            n.className += ' err';
            n.removeEventListener('load', imgLoaded, false);
            n.removeEventListener('error', imgLoadErr, false);

            n.src = ImgUtil.onePxImg;

            if (errTip) {
                //"加载失败"提示
                me._setNodeTipText(n, n.getAttribute('data-errtip') || '加载失败');
            }
            else {
                node.src = Ext.getResourcePath('images/failed.png');
                me._removeNodeTip(n);
            }
        };
        node.addEventListener('load', imgLoaded, false);
        node.addEventListener('error', imgLoadErr, false);

        node.src = src;
    },

    // 在 <div class="imgCt"> 里放一个 文字提示<div>
    _setNodeTipText: function (n, text) {
        if (!n || !n.parentNode) return;
        var tip = n.parentNode.querySelector('.img-tip');
        if (!tip) {
            tip = document.createElement('div');
            tip.className = 'img-tip';
            n.parentNode.insertBefore(tip, null);
        }
        tip.innerHTML = text;
    },
    // 从 <div class="imgCt"> 里移除 文字提示<div>
    _removeNodeTip: function (n) {
        if (!n || !n.parentNode) return;
        var tip = n.parentNode.querySelector('.img-tip');
        if (tip) {
            n.parentNode.removeChild(tip);
        }
    },

    getFullPicUrl(picUrl) {
        return Config.httpUrlForGo + 'files/' + picUrl;
    }
});