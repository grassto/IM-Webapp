Ext.define('IMCommon.utils.ImgMgr', {
    alternateClassName: 'ImgMgr',
    singleton: true,

    parsePic(attId, attType) {
        return [
        '<div class="imgCt">',
            '<img class="viewPic" src="' + ImgUtil.onePxImg + '" onload="ImgMgr.loadPic(this)" data-thumb="' + attId + '/thumbnail" data-img="' + attId + '" data-showthumb="Y" data-errtip="加载失败" data-type="' + attType + '"/>',
        '</div>'].join('');
    },

    loadPic: function (node) {
        var me = this;
        if (!node) return;

        var showThumb = node.hasAttribute('data-showthumb'),
            thumb = node.getAttribute('data-thumb'),
            imgId = node.getAttribute('data-img'),
            picType = node.getAttribute('data-type'),
            url = me.getFullPicUrl(showThumb ? thumb : imgId),
            // picName = imgId + '.' + picType;
            picName = imgId + '.png'; // 这边需要一个类型

        node.removeAttribute('onload');
        me._setNodeTipText(node, '加载中'); // 在 <div class="imgCt"> 里放一个 文字提示<div>

        if (Ext.browser.is.Cordova || window.cefMain) { // 如果是 cordova（或者 cef）
            var nodeId = Ext.id(node, 'node-'); // 防止 node 节点没有id，给它一个id

            cefFile.downloadImage(url, picName, function(evt) {
                var s = JSON.parse(evt);
                if(s.status == 'completed') {
                    ImgMgr._setNodeSrc(nodeId, s.file_path);
                    return;
                }
            });

            // // 下载文件
            // FileMgr.downFile(url, saveDir, picName, {
            //     success: function (path) {
            //         ImgMgr._setNodeSrc(nodeId, path); // 将本地路径 赋值给 src
            //     },
            //     failure: function (error) {
            //         console.log('ImgMgr loadGoodsPic', error);
            //         ImgMgr._setNodeSrc(nodeId, '!error'); // 将 src 赋值为 '!error'
            //     },
            //     scope: me
            // });
        } else {
            ImgMgr._setNodeSrc(node, url); // 如果是浏览器，直接 url 赋值给 src
        }
    },

    _setNodeSrc: function (node, src, errTip) {
        if (Ext.isString(node) && !Ext.isEmpty(node)) {
            node = Ext.getDom(node);
        }
        if (!node) return;

        if (errTip === undefined) errTip = true;

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