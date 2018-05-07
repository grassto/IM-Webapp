/**
 * 通用 图片帮助类
 * @author jiangwei
 */
Ext.define('MX.util.ImgUtil', {
    singleton: true,
    alternateClassName: 'ImgUtil',
    requires: [
        'MX.ImgViewer'
    ],

    // 1×1像素透明图片base64
    onePxImg: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',

    /**
     * 是否是图片后缀
     * @param {String} ext 后缀，不带.
     * @return {Boolean}
     */
    isImgExtension(ext) {
        return FileUtil.isImgExtension(ext);
    },

    /**
     * 从input type="file"读取image DataURL
     *
     * @param {any} imgFile file对象
     * @param {Number} maxHeight 最大高度
     * @param {Function} callback 回调
     * @param {Object} scope 作用域this
     * @returns
     */
    getImageDataURL: function (imgFile, maxHeight, callback, scope) {
        if (!imgFile.type.match(/image.+/)) {
            Utils.toastShort('只能选择图片文件');
            return;
        }
        var reader = new FileReader();
        reader.onload = function (e) {
            if (maxHeight > 0) { //缩放
                var image = new Image();
                image.onload = function () {
                    var canvas = document.createElement('canvas');
                    if (image.height > maxHeight) {
                        image.width *= maxHeight / image.height;
                        image.height = maxHeight;
                    }
                    var ctx = canvas.getContext('2d');
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    canvas.width = image.width;
                    canvas.height = image.height;
                    ctx.drawImage(image, 0, 0, image.width, image.height);
                    callback.call(scope, canvas.toDataURL('image/jpeg', 0.7)); //0.3 图片质量
                };
                image.src = e.target.result;
            } else {
                callback.call(scope, e.target.result);
            }
        };
        reader.readAsDataURL(imgFile);
    },

    /**
     * 显示 dom 容器里面的 img
     * img 元素需要具有 data-original 属性表示原图，alt 属性是文件名
     * @param {Component/Element/HTMLElement/String} node
     */
    viewImgs(node) {
        if (!node) return;

        const me = this,
            bundleId = 'viewerjslibsloaded';
        if (!RM.isDefined(bundleId)) {
            const path = Ext.getResourcePath('viewerjs/', 'shared', 'MX'),
                isDev = Ext.manifest.env == 'development',
                min = isDev ? '' : '.min',
                ver = Ext.manifest.version;
            RM.load([
                `${path}viewer${min}.css?v=${ver}`,
                `${path}viewer${min}.js?v=${ver}`
            ], bundleId);
        }
        RM.ready(bundleId, {
            success() {
                me.doViewImgs(node);
            }
        });
    },
    doViewImgs(node) {
        if (node.isComponent) {
            node = node.element.dom;
        } else if (node.isElement) {
            node = node.dom;
        }
        else if(Ext.isString(node)) { // url
            const img = document.createElement('img');
            img.setAttribute('data-original', node);
            img.src = ImgUtil.onePxImg;
            img.alt = FileUtil.getFileName(node);

            node = img;
        }
        const viewer = new Viewer(node, {
            url: 'data-original',
            zIndex: 2000000,
            zoomRatio: 0.25,
            viewed() {
                viewer.canvas.addEventListener('click', e => { // 点击旁边遮罩 隐藏当前 viewer
                    if(e.target.className == 'viewer-canvas') {
                        viewer.hide();
                    }
                });
            },
            hide() {
                viewer.destroy();
            }
        });
        viewer.show();
    },

    /**
     * 移动端 点击查看大图 事件
     */
    addViewerListener (container) {
        (container.innerElement || container.element).on({
            delegate: 'img',
            tap: 'showViewerOnTapImg',
            scope: this
        });
    },
    showViewerOnTapImg (e) {
        this.showViewerOfDom(e.target);
    },
    showViewerOfDom (node) {
        if (node.hasAttribute('data-img')) {
            var src = this.getFullPicUrl(node.getAttribute('data-img')),
                isThumb = node.hasAttribute('data-showthumb'),
                loaded = node.className.indexOf('loaded') >= 0,
                previewSrc = isThumb && loaded ? node.src : null,
                name = FileUtil.getFileName(src);

            Ext.Viewport.add({
                xtype: 'imgviewer',
                imgName: name,
                saveDir: 'images/',
                previewSrc: previewSrc,
                originNodeId: isThumb ? null : Ext.id(node, this.prefix),
                src: src
            });
        }
    }
});