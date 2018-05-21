// 表情 Carousel 每页组件
Ext.define('IMMobile.view.chatView.editor.emoji.CarouselItem', {
    extend: 'Ext.Component',
    xtype: 'emj_carousel_item',
    config: {
        cls: 'emj-carousel-item',
        tpl: [
            '<table style="width:100%;height:100%">',
                '<tpl for=".">',
                    '<tpl if="xindex % 7 == 1">',
                    '<tr>',
                    '</tpl>',
                    '<td class="emj">{t}</td>',
                    '<tpl if="xindex == 20">',
                        '<td class="backspace"></td>',
                    '</tpl>',
                    '<tpl if="xindex % 7 == 0 || xindex == 20">',
                    '</tr>',
                    '</tpl>',
                '</tpl>',
            '</table>'
        ].join('')
    }
});