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

    // parsePic(attId) {
    //     const me = this,
    //         previewUrl = me.getFullPicUrl(`${attId}/thumbnail`),
    //         originalUrl = me.getFullPicUrl(attId);

    //     return [
    //         '<div class="imgBlock">',
    //         `<img class="viewPic" src="${Ext.getResourcePath('images/loading.gif')}" onload="ImgMgr.loadPic(this)" data-preview="${previewUrl}" data-original="${originalUrl}" data-showpreview="Y"/>`,
    //         '</div>'
    //     ].join('');
    // },

    parsePic(attId, showpreview) {
        const me = this,
            previewUrl = me.getFullPicUrl(`${attId}/thumbnail`),
            originalUrl = me.getFullPicUrl(attId);

        return [
            '<div class="imgBlock">',
            `<img class="viewPic" src="${Ext.getResourcePath('images/loading.gif')}" onload="ImgMgr.loadPic(this)" data-preview="${previewUrl}" data-original="${originalUrl}" ${showpreview ? 'data-showpreview="Y"' : ''}/>`,
            '</div>'
        ].join('');
    },

    // 给图片一个占位，然后根据msg_id来找到store对应的record
    setPicIndex() {
        return [
            '<div class="imgBlock">',
            `<img class="viewPic" src="${Ext.getResourcePath('images/loading.gif')}"/>`,
            '<div class="img-tip">加载中</div>',
            '</div>'
        ].join('');
    },


    loadPic(node) {
        var me = this;
        if (!node || !me.isInBody(node)) return;

        var showPreview = node.hasAttribute('data-showpreview'),
            showProgress = node.hasAttribute('data-showprogress'), // 显示下载进度
            previewUrl = node.getAttribute('data-preview'),
            originalUrl = node.getAttribute('data-original'),
            url = showPreview ? previewUrl : originalUrl,
            saveDir = User.getImageDir(),
            picName = FileUtil.getFileName(url);

        node.removeAttribute('onload');
        me._setNodeTipText(node, '加载中'); // 在 <div class="imgCt"> 里放一个 文字提示<div>

        if (Ext.browser.is.Cordova || window.cefMain) { // 如果是 cordova（或者 cef）
            var nodeId = Ext.id(node, me.prefix); // 防止 node 节点没有id，给它一个id

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

    _setNodeSrc(node, src, errTip) {
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

            // n.src = ImgUtil.onePxImg;

            n.src = Ext.getResourcePath('images/failed.png');
            if (errTip) {
                // "加载失败"提示
                me._setNodeTipText(n, n.getAttribute('data-errtip') || '加载失败');
            } else {
                me._removeNodeTip(n);
            }
        };
        node.addEventListener('load', imgLoaded, false);
        node.addEventListener('error', imgLoadErr, false);

        // http 页面 显示不了本地 file:// 图片, cef 加了一个 localfile:// 协议
        if (Utils.isWeb && window.cefMain && FileUtil.isFileUri(src)) {
            src = `local${src}`;
        }

        node.src = src;
    },

    // 在 <div class="imgCt"> 里放一个 文字提示<div>
    _setNodeTipText(n, text) {
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
    _removeNodeTip(n) {
        if (!n || !n.parentNode) return;
        var tip = n.parentNode.querySelector('.img-tip');
        if (tip) {
            n.parentNode.removeChild(tip);
        }
    },

    getFullPicUrl(picUrl) {
        return `${Config.httpUrlForGo}files/${picUrl}`;
    },

    /**
     * 网络上第三方的图片，为了防止图片地址获取不到文件名，或者多个地址文件名一样
     * 比如 https://img-blog.csdn.net/20161109102301174?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQv/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center
     * 我们 用这个方法生成文件名
     */
    getRemoteName(url) {
        if (Ext.isEmpty(url)) return url;

        var ext = FileUtil.getExtension(url); // 不带点后缀
        if (ext) ext = `.${ext}`;

        return `${url.length}_${Utils.hashCode(url)}${ext}`; // 缓存图片的名字
    },

    /**
     * 选择图片，得到图片 Uri 数组，支持CEF、Cordova
     * CEF: 支持多选
     * 移动端：暂时只能单选
     *      Android: cordova-plugin-filechooser
     *      iOS: cordova-plugin-filepicker
     *
     * 使用方法 ImgMgr.chooseImage().then(result => { }).catch(err => { })
     * result 格式 { images: ['file://......jpg', 'file://......jpg'], isOrigin: true/false }
     * @returns {Ext.Promise}
     */
    chooseImages() {
        return new Ext.Promise((resolve, reject) => {
            if (window.cefMain) {
                cefMain.selectImages(fileUris => {
                    resolve({
                        images: fileUris,
                        isOrigin: true // 表示 原图
                    });
                });
            } else if (Ext.browser.is.Cordova) {
                ImagePicker.getPictures(resolve, reject);
            }
        });
    },

    /**
     * 拍照
     * 使用方法 ImgMgr.takePhoto().then(result => { }).catch(err => { })
     * result 格式 { images: ['file://......jpg'], isOrigin: false }
     * @returns {Ext.Promise}
     */
    takePhoto() {
        return new Ext.Promise((resolve, reject) => {
            if (Ext.browser.is.Cordova) {
                if (Ext.os.is.Android) {
                    ImagePicker.takePhoto(resolve, reject);
                } else {
                    navigator.camera.getPicture(uri => {
                        uri = Utils.stripQueryStr(uri);
                        resolve({
                            images: [uri],
                            isOrigin: false
                        });
                    }, reject, {
                        quality: 50,
                        targetWidth: 100,
                        targetHeight: 100,
                        correctOrientation: true,
                        destinationType: navigator.camera.DestinationType.FILE_URI,
                        sourceType: navigator.camera.PictureSourceType.CAMERA,
                        saveToPhotoAlbum: true
                    });
                }
            }
        });
    },

    /**
     * 移动端 点击查看大图 事件
     */
    addViewerListener(container) {
        (container.innerElement || container.element).on({
            delegate: 'img',
            tap: 'showViewerOnTapImg',
            scope: this
        });
    },
    showViewerOnTapImg(e) {
        this.showViewerOfDom(e.target);
    },
    showViewerOfDom(node) {
        if (node.hasAttribute('data-original')) {
            var src = node.getAttribute('data-original'),
                isPreview = node.hasAttribute('data-showpreview'),
                loaded = node.className.indexOf('loaded') >= 0,
                previewSrc = isPreview && loaded ? node.src : null,
                name = FileUtil.getFileName(src);

            Ext.Viewport.add({
                xtype: 'imgviewer',
                imgName: name,
                saveDir: 'images/',
                previewSrc: previewSrc,
                originNodeId: isPreview ? null : Ext.id(node, this.prefix),
                src: src
            });
        }
    }
});