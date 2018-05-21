/**
 * 表情 carousel
 */
Ext.define('IMMobile.view.chatView.editor.emoji.Carousel', {
    extend: 'Ext.carousel.Carousel',
    requires: [
        'IMMobile.view.chatView.editor.emoji.CarouselItem'
    ],

    xtype : 'emj_carousel',

    innerItemConfig: {
        xtype: 'emj_carousel_item'
    },

    pageSize: 20, // 每页显示的 emoji 个数

    emojis: [{t:'😁'}, {t:'😂'}, {t:'😃'}, {t:'😄'}, {t:'😅'}, {t:'😆'}, {t:'😉'}, {t:'😊'}, {t:'😋'}, {t:'😌'}, {t:'😍'}, {t:'😏'}, {t:'😒'}, {t:'😓'}, {t:'😔'}, {t:'😖'}, {t:'😘'}, {t:'😚'}, {t:'😜'}, {t:'😝'}, {t:'😞'}, {t:'😠'}, {t:'😡'}, {t:'😢'}, {t:'😣'}, {t:'😤'}, {t:'😥'}, {t:'😨'}, {t:'😩'}, {t:'😪'}, {t:'😫'}, {t:'😭'}, {t:'😰'}, {t:'😱'}, {t:'😲'}, {t:'😳'}, {t:'😵'}, {t:'😷'}, {t:'😸'}, {t:'😹'}, {t:'😺'}, {t:'😻'}, {t:'😼'}, {t:'😽'}, {t:'😾'}, {t:'😿'}, {t:'🙀'}, {t:'🙅'}, {t:'🙆'}, {t:'🙇'}, {t:'🙈'}, {t:'🙉'}, {t:'🙊'}, {t:'🙋'}, {t:'🙌'}, {t:'🙍'}, {t:'🙎'}, {t:'🙏'}, {t:'✂'}, {t:'✅'}, {t:'✈'}, {t:'✉'}, {t:'✊'}, {t:'✋'}, {t:'✌'}, {t:'✏'}, {t:'✒'}, {t:'✔'}, {t:'✖'}, {t:'✨'}, {t:'✳'}, {t:'✴'}, {t:'❄'}, {t:'❇'}, {t:'❌'}, {t:'❎'}, {t:'❓'}, {t:'❔'}, {t:'❕'}, {t:'❗'}, {t:'❤'}, {t:'➕'}, {t:'➖'}, {t:'➗'}, {t:'➡'}, {t:'➰'}, {t:'🚀'}, {t:'🚃'}, {t:'🚄'}, {t:'🚅'}, {t:'🚇'}, {t:'🚉'}, {t:'🚌'}, {t:'🚏'}, {t:'🚑'}, {t:'🚒'}, {t:'🚓'}, {t:'🚕'}, {t:'🚗'}, {t:'🚙'}, {t:'🚚'}, {t:'🚢'}, {t:'🚤'}, {t:'🚥'}, {t:'🚧'}, {t:'🚨'}, {t:'🚩'}, {t:'🚪'}, {t:'🚫'}, {t:'🚬'}, {t:'🚭'}, {t:'🚲'}, {t:'🚶'}, {t:'🚹'}, {t:'🚺'}, {t:'🚻'}, {t:'🚼'}, {t:'🚽'}, {t:'🚾'}, {t:'🛀'}],

    initialize() {
        const me = this;
        me.callParent(arguments);

        const len = me.emojis.length,
            pageCount = Math.ceil(len / me.pageSize);

        for(var i = 0; i < pageCount; i++) {
            const pageData = me.emojis.slice(i * me.pageSize, (i + 1) * me.pageSize);
            me.add({
                xtype: 'emj_carousel_item',
                data: pageData
            });
        }
    }
});