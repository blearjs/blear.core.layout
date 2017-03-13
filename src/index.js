/**
 * 核心布局
 * [---------- size ---- padding ---- border ---- margin ]
 * |---- width ----|
 * |-------- innerWidth -------|
 * |-------------- outerWidth -------------|
 * @author ydr.me
 * @create 2016-04-15 12:06
 */



'use strict';

var attribute = require('blear.core.attribute');
var access = require('blear.utils.access');
var array = require('blear.utils.array');
var number = require('blear.utils.number');
var typeis = require('blear.utils.typeis');

var win = window;
var doc = win.document;
var bodyEl = doc.body;
var htmlEl = doc.documentElement;
var parseFloat = number.parseFloat;
var BOUNDARY_CONTENT_INDEX = 0;
var BOUNDARY_PADDING_INDEX = 1;
var BOUNDARY_BORDER_INDEX = 2;
var SCROLL_LEFT_INDEX = 3;
var SCROLL_TOP_INDEX = 4;
var SCROLL_WIDTH_INDEX = 5;
var SCROLL_HEIGHT_INDEX = 6;
var OFFSET_TOP_INDEX = 7;
var OFFSET_LEFT_INDEX = 8;
var CLIENT_TOP_INDEX = 9;
var CLIENT_LEFT_INDEX = 10;
var STR_CLIENT = 'client';
var STR_OFFSET = 'offset';
var STR_SCROLL = 'scroll';
var STR_INNER = 'inner';
var STR_OUTER = 'outer';
var STR_WIDTH = 'width';
var STR_HEIGHT = 'height';
var STR_TOP = 'Top';
var STR_LEFT = 'Left';
var STR_POSITION = 'position';
var STR_RELEATIVE = 'relative';
var rePosition = /^(ab|fi|re)/;


/**
 * 是否为 window 或 document
 * @param obj
 * @returns {*}
 */
var isWindowOrDocument = function (obj) {
    return typeis.Window(obj) || typeis.Document(obj);
};


/**
 * 大写单词中的第一个字母
 * @param {String} word
 * @returns {String}
 * @private
 */
var upperCaseFirstLetter = function upperCaseFirstLetter(word) {
    return word.slice(0, 1).toUpperCase() + word.slice(1);
};


/**
 * 计算获取差值
 * @param boundaryIndex {Number} 边界索引值
 * @param paddingSize {Number} paddingWidth
 * @param borderSize {Number} borderWidth
 * @returns {*}
 */
var calGetDelta = function (boundaryIndex, paddingSize, borderSize) {
    //width = content-width + pading-width + border-width;
    switch (boundaryIndex) {
        // width - border - padding
        case BOUNDARY_CONTENT_INDEX:
            return borderSize + paddingSize;
        // width - border
        case BOUNDARY_PADDING_INDEX:
            return borderSize;
        // width
        case BOUNDARY_BORDER_INDEX:
            return 0;
    }
};


/**
 * 计算设置差值
 * @param borderBox {boolean} 是否为边框盒模型
 * @param boundaryIndex {Number} 边界索引值
 * @param paddingSize {Number} paddingWidth
 * @param borderSize {Number} borderWidth
 * @returns {*}
 */
var calSetDelta = function (borderBox, boundaryIndex, paddingSize, borderSize) {
    if (borderBox) {
        // cssWidth = content-width + pading-width + border-width;
        switch (boundaryIndex) {
            // cssWidth
            case BOUNDARY_CONTENT_INDEX:
                return -paddingSize - borderSize;
            // cssWidth - paddingSize
            case BOUNDARY_PADDING_INDEX:
                return -borderSize;
            // cssWidth - paddingSize - borderSize
            case BOUNDARY_BORDER_INDEX:
                return 0;
        }
    }

    // cssWidth = content-width
    switch (boundaryIndex) {
        // cssWidth
        case BOUNDARY_CONTENT_INDEX:
            return 0;
        // cssWidth - paddingSize
        case BOUNDARY_PADDING_INDEX:
            return paddingSize;
        // cssWidth - paddingSize - borderSize
        case BOUNDARY_BORDER_INDEX:
            return paddingSize + borderSize;
    }
};


/**
 * 获取窗口尺寸
 * @param Name
 * @returns {*}
 */
var getWindowSize = function (Name) {
    return win[STR_INNER + Name] || htmlEl[STR_CLIENT + Name] || 0;
};


/**
 * 获取文档尺寸
 * @param Name
 * @returns {*}
 */
var getDocumentSize = function (Name) {
    // Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
    // whichever is greatest
    // unfortunately, this causes bug #3838 in IE6/8 only,
    // but there is currently no good, small way to fix it.
    return Math.max(
        bodyEl[STR_SCROLL + Name] || 0, doc[STR_SCROLL + Name] || 0,
        bodyEl[STR_OFFSET + Name] || 0, doc[STR_OFFSET + Name] || 0,
        doc[STR_CLIENT + Name] || 0
    );
};


/**
 * 元素尺寸计算器
 * @param el
 * @param name
 * @param boundaryIndex
 * @returns {*}
 */
var sizing = function (el, name, boundaryIndex) {
    var Name = upperCaseFirstLetter(name);

    if (typeis.Window(el)) {
        return {
            get: function () {
                return getWindowSize(Name);
            },
            set: function () {
                //
            }
        };
    }

    if (typeis.Document(el)) {
        return {
            get: function () {
                return getDocumentSize(Name);
            },
            set: function () {
                //
            }
        };
    }

    var val = el.getBoundingClientRect()[name];
    var isHorizontal = name === STR_WIDTH;
    var directionList = isHorizontal ? [STR_LEFT, 'Right'] : [STR_TOP, 'Bottom'];
    var paddingWidth = 0;
    var borderWidth = 0;

    array.each(directionList, function (index, direction) {
        paddingWidth += parseFloat(attribute.style(el, 'padding' + direction));
        borderWidth += parseFloat(attribute.style(el, 'border' + direction + 'Width'));
    });

    return {
        get: function () {
            return val - calGetDelta(boundaryIndex, paddingWidth, borderWidth);
        },
        set: function (val) {
            var boxSizing = attribute.style(el, 'box-sizing');
            val -= calSetDelta(boxSizing === 'border-box', boundaryIndex, paddingWidth, borderWidth);
            attribute.style(el, name, val);
        }
    };
};


/**
 * 生成 size 出口
 * @param boundary
 * @param boundarIndex
 * @returns {Function}
 */
var buildSizeExports = function (boundary, boundarIndex) {
    return function (el, val) {
        var args = access.args(arguments).slice(1);
        return access.getSet({
            get: function () {
                return sizing(el, boundary, boundarIndex).get();
            },
            set: function (val) {
                sizing(el, boundary, boundarIndex).set(val);
            },
            setLength: 1
        }, args);
    };
};


/**
 * 获取元素的 contentWidth
 * @param el {HTMLElement} 元素
 * @param [width] {Number} 设置值
 * @returns {Number|*}
 * @type function
 */
exports.width = buildSizeExports(STR_WIDTH, BOUNDARY_CONTENT_INDEX);


/**
 * 获取元素的 contentHeight
 * @param el {HTMLElement} 元素
 * @param [width] {Number} 设置值
 * @returns {Number|*}
 * @type function
 */
exports.height = buildSizeExports(STR_HEIGHT, BOUNDARY_CONTENT_INDEX);


/**
 * 获取元素的 contentWidth + paddingWidth
 * @param el {HTMLElement} 元素
 * @param [width] {Number} 设置值
 * @returns {Number|*}
 * @type function
 */
exports.innerWidth = buildSizeExports(STR_WIDTH, BOUNDARY_PADDING_INDEX);


/**
 * 获取元素的 contentHeight + paddingHeight
 * @param el {HTMLElement} 元素
 * @param [width] {Number} 设置值
 * @returns {Number|*}
 * @type function
 */
exports.innerHeight = buildSizeExports(STR_HEIGHT, BOUNDARY_PADDING_INDEX);


/**
 * 获取元素的 contentWidth + paddingWidth + borderWidth
 * @param el {HTMLElement} 元素
 * @param [width] {Number} 设置值
 * @returns {Number|*}
 * @type function
 */
exports.outerWidth = buildSizeExports(STR_WIDTH, BOUNDARY_BORDER_INDEX);


/**
 * 获取元素的 contentHeight + paddingHeight + boderHeight
 * @param el {HTMLElement} 元素
 * @param [width] {Number} 设置值
 * @returns {Number|*}
 * @type function
 */
exports.outerHeight = buildSizeExports(STR_HEIGHT, BOUNDARY_BORDER_INDEX);


/**
 * 获取滚动尺寸
 * @param scrollIndex
 * @param el
 * @returns {*}
 */
var getScrollSize = function (scrollIndex, el) {
    switch (scrollIndex) {
        case SCROLL_LEFT_INDEX:
            if (isWindowOrDocument(el)) {
                return win.pageXOffset || htmlEl[STR_SCROLL + STR_LEFT];
            }

            return el[STR_SCROLL + STR_LEFT];

        case SCROLL_TOP_INDEX:
            if (isWindowOrDocument(el)) {
                return win.pageYOffset || htmlEl[STR_SCROLL + STR_TOP];
            }

            return el[STR_SCROLL + STR_TOP];

        case SCROLL_WIDTH_INDEX:
            if (isWindowOrDocument(el)) {
                return htmlEl[STR_SCROLL + upperCaseFirstLetter(STR_WIDTH)];
            }

            return el[STR_SCROLL + upperCaseFirstLetter(STR_WIDTH)];

        case SCROLL_HEIGHT_INDEX:
            if (isWindowOrDocument(el)) {
                return htmlEl[STR_SCROLL + upperCaseFirstLetter(STR_HEIGHT)];
            }

            return el[STR_SCROLL + upperCaseFirstLetter(STR_HEIGHT)];
    }
};


/**
 * 获取滚动尺寸
 * @param scrollIndex
 * @param el
 * @param val
 * @returns {*}
 */
var setScrollSize = function (scrollIndex, el, val) {
    switch (scrollIndex) {
        case SCROLL_LEFT_INDEX:
            if (isWindowOrDocument(el)) {
                win.scrollTo(val, getScrollSize(SCROLL_TOP_INDEX, el));
            } else {
                el[STR_SCROLL + STR_LEFT] = val;
            }
            break;

        case SCROLL_TOP_INDEX:
            if (isWindowOrDocument(el)) {
                win.scrollTo(getScrollSize(SCROLL_LEFT_INDEX, el), val);
            } else {
                el[STR_SCROLL + STR_TOP] = val;
            }
            break;

        // 忽略设置元素的 scrollWidth、scrollHeight
        // scrollWidth、scrollHeight 是由其内容撑起来的，
        // 外围元素无法改变
        // case SCROLL_WIDTH_INDEX:
        //    if (isWindowOrDocument(el)) {
        //        htmlEl[STR_SCROLL + upperCaseFirstLetter(STR_WIDTH)] = val;
        //    } else {
        //        el[STR_SCROLL + upperCaseFirstLetter(STR_WIDTH)] = val;
        //    }
        //    break;
        //
        // case SCROLL_HEIGHT_INDEX:
        //    if (isWindowOrDocument(el)) {
        //        // htmlEl[STR_SCROLL + upperCaseFirstLetter(STR_HEIGHT)] = val;
        //    } else {
        //        el[STR_SCROLL + upperCaseFirstLetter(STR_HEIGHT)] = val;
        //    }
        //    break;
    }
};


/**
 * scroll 出口
 * @param scrollIndex
 * @returns {Function}
 */
var buildScrollExports = function (scrollIndex) {
    return function (el, scrollTop) {
        var args = access.args(arguments).slice(1);
        return access.getSet({
            get: function () {
                return getScrollSize(scrollIndex, el);
            },
            set: function (scrollTop) {
                setScrollSize(scrollIndex, el, scrollTop);
            },
            setLength: 1
        }, args);
    };
};


/**
 * 获取、设置元素的 scrollLeft
 * @param el {HTMLElement|Document|Window} 元素
 * @param [scrollLeft] {Number} 值
 * @type function
 */
var scrollLeft = exports.scrollLeft = buildScrollExports(SCROLL_LEFT_INDEX);


/**
 * 获取、设置元素的 scrollTop
 * @param el {HTMLElement|Document|Window} 元素
 * @param [scrollTop] {Number} 值
 * @type function
 */
var scrollTop = exports.scrollTop = buildScrollExports(SCROLL_TOP_INDEX);


/**
 * 获取、设置元素的 scrollWidth
 * @param el {HTMLElement|Document|Window} 元素
 * @param [scrollTop] {Number} 值
 * @type function
 */
exports.scrollWidth = buildScrollExports(SCROLL_WIDTH_INDEX);


/**
 * 获取、设置元素的 scrollHeight
 * @param el {HTMLElement|Document|Window} 元素
 * @param [scrollTop] {Number} 值
 * @type function
 */
exports.scrollHeight = buildScrollExports(SCROLL_HEIGHT_INDEX);


/**
 * 判断元素释放被定位
 * @param el
 * @returns {boolean}
 */
var positioned = exports.positioned = function (el) {
    var positionStyle = attribute.style(el, STR_POSITION);

    return rePosition.test(positionStyle)
};


/**
 * 获取元素的 offset 位移，从元素的边框开始计算，到文档边缘
 * @param el
 * @returns {{}}
 */
var getOffset = function (el) {
    var ret = {};

    if (isWindowOrDocument(el)) {
        ret[OFFSET_TOP_INDEX] = 0;
        ret[OFFSET_LEFT_INDEX] = 0;
        return ret;
    }

    ret[OFFSET_TOP_INDEX] = el.offsetTop;
    ret[OFFSET_LEFT_INDEX] = el.offsetLeft;

    return ret;
};

/**
 * 获取元素的 offset 位移，从元素的边框开始计算，到客户端边缘
 * @param el
 * @returns {{}}
 */
var getClient = function (el) {
    var box = {
        top: 0,
        left: 0
    };
    var ret = {};
    var deltaLeft = 0;
    var deltaTop = 0;

    if (!isWindowOrDocument(el)) {
        box = el.getBoundingClientRect();
        deltaLeft = scrollLeft(win);
        deltaTop = scrollTop(win);
    }

    ret[CLIENT_TOP_INDEX] = box.top + deltaTop;
    ret[CLIENT_LEFT_INDEX] = box.left + deltaLeft;

    return ret;
};


/**
 * 获取元素的 offset 位移，从元素的边框开始计算，到文档边缘
 * @param el
 * @param index
 * @param old
 * @param val
 * @returns {{}}
 */
var setOffsetOrClient = function (el, index, old, val) {
    var original = old[index];
    var delta = val - original;

    if (!positioned(el)) {
        attribute.style(el, STR_POSITION, STR_RELEATIVE);
    }

    var oldKey = '';

    switch (index) {
        case OFFSET_LEFT_INDEX:
        case CLIENT_LEFT_INDEX:
            oldKey = 'left';
            break;

        case OFFSET_TOP_INDEX:
        case CLIENT_TOP_INDEX:
            oldKey = 'top';
            break;
    }

    var oldVal = number.parseFloat(attribute.style(el, oldKey));
    var newVal = oldVal + delta;
    attribute.style(el, oldKey, newVal);
};


/**
 * 获取元素在文档中的左位移
 * @param el {HTMLElement|Document|Window} 元素
 * @param [val] {Number} 设置值
 * @returns {Number}
 */
exports.offsetLeft = function (el, val) {
    var args = access.args(arguments).slice(1);

    return access.getSet({
        get: function () {
            return getOffset(el)[OFFSET_LEFT_INDEX];
        },
        set: function (val) {
            setOffsetOrClient(el, OFFSET_LEFT_INDEX, getOffset(el), val);
        },
        setLength: 1
    }, args);
};


/**
 * 获取元素在文档中的上位移
 * @param el {HTMLElement|Document|Window} 元素
 * @param [val] {Number} 设置值
 * @returns {Number}
 */
exports.offsetTop = function (el, val) {
    var args = access.args(arguments).slice(1);

    return access.getSet({
        get: function () {
            return getOffset(el)[OFFSET_TOP_INDEX];
        },
        set: function (val) {
            setOffsetOrClient(el, OFFSET_TOP_INDEX, getOffset(el), val);
        },
        setLength: 1
    }, args);
};


/**
 * 获取元素在客户端中的左位移
 * @param el {HTMLElement|Document|Window} 元素
 * @param [val] {Number} 设置值
 * @returns {Number}
 */
exports.clienttLeft = function (el, val) {
    var args = access.args(arguments).slice(1);

    return access.getSet({
        get: function () {
            return getClient(el)[CLIENT_LEFT_INDEX];
        },
        set: function (val) {
            setOffsetOrClient(el, CLIENT_LEFT_INDEX, getClient(el), val);
        },
        setLength: 1
    }, args);
};


/**
 * 获取元素在客户端的上位移
 * @param el {HTMLElement|Document|Window} 元素
 * @param [val] {Number} 设置值
 * @returns {Number}
 */
exports.clientTop = function (el, val) {
    var args = access.args(arguments).slice(1);

    return access.getSet({
        get: function () {
            return getClient(el)[CLIENT_TOP_INDEX];
        },
        set: function (val) {
            setOffsetOrClient(el, CLIENT_TOP_INDEX, getClient(el), val);
        },
        setLength: 1
    }, args);
};


///**
// * 判断元素是否在视口内
// * @param el
// * @returns {boolean}
// */
//exports.inViewPort = function (el) {
//    var ret = attribute.style(el, ['display', 'visibility']);
//
//    if (ret.display === 'none' || ret.visibility === 'hidden') {
//        return false;
//    }
//
//
//};
