

 const buttons = Object.freeze(  {
        FILTER: 1,  // 筛选
        ABBREVIATE: 2, // 简称
        TEMPLATE: 4, //模板
        EDIT: 8,   // 编辑
        ZOOMOUT : 16,  // 缩小
        ZOOMIN : 32,  // 放大
        REFRESH: 64,  // 刷新
        FULLSCREEN: 128,  //全屏幕
        SAVE: 256, // 全屏
        WRITTENWORDS: 512, // 文字
        SEARCH: 1024, // 搜索
        OPENNODE: 2048, // 展开收起节点
       
});
// buttons.ALl = buttons.FILTER | 
//                 buttons.ABBREVIATE |
//                 buttons.TEMPLATE |
//                 buttons.EDIT |
//                 buttons.ZOOMOUT |
//                 buttons.ZOOMIN |
//                 buttons.REFRESH |
//                 buttons.FULLSCREEN |
//                 buttons.SAVE ;

export default buttons;