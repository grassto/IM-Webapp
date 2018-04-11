// 图片若未加载完成，则显示loading,加载未完成，显示默认图片
(function () {
    //判断浏览器
    var Browser = new Object();
    Browser.userAgent = window.navigator.userAgent.toLowerCase();
    Browser.ie = /msie/.test(Browser.userAgent);
    Browser.Moz = /gecko/.test(Browser.userAgent);

    //判断是否加载完成
    window.imagess = function Imagess(url, imgid/* , callback*/) {
        var val = url;
        var img = new Image();
        if (Browser.ie) {
            img.onreadystatechange = function () {
                if (img.readyState == "complete" || img.readyState == "loaded") {
                    // callback(img, imgid);
                    checkimg(img, imgid);
                // debugger;
                    ChatHelper.onScroll(Ext.Viewport.lookup('IM').lookup('im-main').down('#chatView'));
                }
            }
        } else if (Browser.Moz) {
            img.onload = function () {
                if (img.complete == true) {
                    // callback(img, imgid);
                    checkimg(img, imgid);
                    // debugger;
                    
                }
            }
        }
        //如果因为网络或图片的原因发生异常，则显示该图片
        img.onerror = function () { img.src = "/resources/images/failed.png" }
        img.src = val;
    }

    //显示图片
    function checkimg(obj, imgid) {
        var img = document.getElementById(imgid);
        if(img) {
            img.style.cssText = "";
            img.src = obj.src;
            if(Ext.Viewport.lookup('IM')) {
                ChatHelper.onScroll(Ext.Viewport.lookup('IM').lookup('im-main').down('#chatView'));
            } else if(Ext.Viewport.lookup('IMMobile')) {
                AddDataUtil.onScroll(Ext.Viewport.lookup('IMMobile').down('#IMMobile-chatView').down('#IMMobileChatView'));
            }
        }
        // document.getElementById(imgid).style.cssText = "";
        // document.getElementById(imgid).src = obj.src;
    }
})();
