/**
 * 通用 图片帮助类
 * @author jiangwei
 */
Ext.define('MX.util.ImgUtil', {
    requires: [
        'MX.utils.ResourceMgr'
    ],
    singleton: true,
    alternateClassName: 'ImgUtil',

    // 1×1像素透明图片base64
    onePxImg: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',

    // 点击查看大图 事件
    /*addViewerListener(container) {
        (container.innerElement || container.element).on({
            delegate: 'img',
            tap: 'showViewerOnTapImg',
            scope: this
        });
    },
    showViewerOnTapImg(e) {
        this.viewImgOfContainer(e.target);
    },*/

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
     * 是否是图片后缀
     * @param {String} ext 后缀，不带.
     * @return {Boolean}
     */
    isImgExtension(ext) {
        return FileUtil.isImgExtension(ext);
    }

});