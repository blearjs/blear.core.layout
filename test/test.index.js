/**
 * 测试 文件
 * @author ydr.me
 * @create 2016-05-17 12:13
 */


'use strict';

var layout = require('../src/index.js');

describe('测试文件', function () {
    var div1El = document.createElement('div');
    var div2El = document.createElement('div');

    div1El.style.position = div2El.style.position = 'relative';
    div1El.style.width = div2El.style.width = '100px';
    div1El.style.height = div2El.style.height = '100px';
    div1El.style.padding = div2El.style.padding = '7px';
    div1El.style.border = div2El.style.border = '15px solid #cff';
    div1El.style.margin = div2El.style.margin = '31px';
    div1El.style.background = div2El.style.background = '#fcc';
    div1El.style.overflow = div2El.style.overflow = 'auto';
    div2El.style.boxSizing = 'border-box';
    document.body.appendChild(div1El);
    document.body.appendChild(div2El);

    afterAll(function () {
        document.body.removeChild(div1El);
        document.body.removeChild(div2El);
    });

    it('.width:content-box', function (done) {
        var width = layout.width(div1El);
        var innerWidth = layout.innerWidth(div1El);
        var outerWidth = layout.outerWidth(div1El);
        var height = layout.height(div1El);
        var innerHeight = layout.innerHeight(div1El);
        var outerHeight = layout.outerHeight(div1El);

        expect(width).toEqual(height);
        expect(innerWidth).toEqual(innerHeight);
        expect(outerWidth).toEqual(outerHeight);

        expect(width).toEqual(100);
        expect(innerWidth).toEqual(114);
        expect(outerWidth).toEqual(144);

        layout.width(div1El, 110);
        width = layout.width(div1El);
        innerWidth = layout.innerWidth(div1El);
        outerWidth = layout.outerWidth(div1El);
        expect(width).toEqual(110);
        expect(innerWidth).toEqual(124);
        expect(outerWidth).toEqual(154);

        layout.innerWidth(div1El, 134);
        width = layout.width(div1El);
        innerWidth = layout.innerWidth(div1El);
        outerWidth = layout.outerWidth(div1El);
        expect(width).toEqual(120);
        expect(innerWidth).toEqual(134);
        expect(outerWidth).toEqual(164);

        layout.outerWidth(div1El, 174);
        width = layout.width(div1El);
        innerWidth = layout.innerWidth(div1El);
        outerWidth = layout.outerWidth(div1El);
        expect(width).toEqual(130);
        expect(innerWidth).toEqual(144);
        expect(outerWidth).toEqual(174);

        var winWidth1 = layout.width(window);
        var winWidth2 = layout.innerWidth(window);
        var winWidth3 = layout.outerWidth(window);

        expect(winWidth1).toEqual(winWidth2);
        expect(winWidth1).toEqual(winWidth3);

        var docHeight1 = layout.height(document);
        var docHeight2 = layout.innerHeight(document);
        var docHeight3 = layout.outerHeight(document);

        expect(docHeight1).toEqual(docHeight2);
        expect(docHeight1).toEqual(docHeight3);

        done();
    });

    it('.width:border-box', function (done) {
        var width = layout.width(div2El);
        var innerWidth = layout.innerWidth(div2El);
        var outerWidth = layout.outerWidth(div2El);
        var height = layout.height(div2El);
        var innerHeight = layout.innerHeight(div2El);
        var outerHeight = layout.outerHeight(div2El);

        expect(width).toEqual(height);
        expect(innerWidth).toEqual(innerHeight);
        expect(outerWidth).toEqual(outerHeight);

        expect(width).toEqual(56);
        expect(innerWidth).toEqual(70);
        expect(outerWidth).toEqual(100);

        layout.width(div2El, 66);
        width = layout.width(div2El);
        innerWidth = layout.innerWidth(div2El);
        outerWidth = layout.outerWidth(div2El);
        expect(width).toEqual(66);
        expect(innerWidth).toEqual(80);
        expect(outerWidth).toEqual(110);

        layout.innerWidth(div2El, 90);
        width = layout.width(div2El);
        innerWidth = layout.innerWidth(div2El);
        outerWidth = layout.outerWidth(div2El);
        expect(width).toEqual(76);
        expect(innerWidth).toEqual(90);
        expect(outerWidth).toEqual(120);

        layout.outerWidth(div2El, 130);
        width = layout.width(div2El);
        innerWidth = layout.innerWidth(div2El);
        outerWidth = layout.outerWidth(div2El);
        expect(width).toEqual(86);
        expect(innerWidth).toEqual(100);
        expect(outerWidth).toEqual(130);

        done();
    });

    it('window .scroll', function () {
        document.body.style.height = '10000px';
        document.body.style.width = '10000px';
        window.scrollTo(0, 0);
        var scrollLeft = layout.scrollLeft(window);
        var scrollTop = layout.scrollTop(window);
        var scrollWidth = layout.scrollWidth(window);
        var scrollHeight = layout.scrollHeight(window);
        expect(scrollLeft).toEqual(0);
        expect(scrollTop).toEqual(0);
        expect(scrollWidth).toBeGreaterThan(5000);
        expect(scrollHeight).toBeGreaterThan(5000);

        layout.scrollLeft(window, 100);
        layout.scrollTop(window, 100);
        layout.scrollWidth(window, 100);
        layout.scrollHeight(window, 100);
        var scrollLeft2 = layout.scrollLeft(window);
        var scrollTop2 = layout.scrollTop(window);
        var scrollWidth2 = layout.scrollWidth(window);
        var scrollHeigh2 = layout.scrollHeight(window);
        expect(scrollLeft2).toEqual(100);
        expect(scrollTop2).toEqual(100);
        expect(scrollWidth).toEqual(scrollWidth2);
        expect(scrollHeight).toEqual(scrollHeigh2);
    });

    it('el .scroll', function () {
        var div3El = document.createElement('div');

        div3El.style.width = '10000px';
        div3El.style.height = '10000px';
        div2El.appendChild(div3El);

        var scrollLeft = layout.scrollLeft(div2El);
        var scrollTop = layout.scrollTop(div2El);
        var scrollWidth = layout.scrollWidth(div2El);
        var scrollHeight = layout.scrollHeight(div2El);
        expect(scrollLeft).toEqual(0);
        expect(scrollTop).toEqual(0);
        expect(scrollWidth).toBeGreaterThan(9000);
        expect(scrollHeight).toBeGreaterThan(9000);

        layout.scrollLeft(div2El, 100);
        layout.scrollTop(div2El, 100);
        var scrollLeft2 = layout.scrollLeft(div2El);
        var scrollTop2 = layout.scrollTop(div2El);
        var scrollWidth2 = layout.scrollWidth(div2El);
        var scrollHeight2 = layout.scrollWidth(div2El);
        expect(scrollWidth2).toEqual(scrollWidth);
        expect(scrollHeight2).toEqual(scrollWidth);
        expect(scrollLeft2).toEqual(100);
        expect(scrollTop2).toEqual(100);
    });

    it('.offset', function () {
        expect(layout.offsetLeft(window)).toEqual(0);
        expect(layout.offsetTop(window)).toEqual(0);

        expect(layout.offsetLeft(document)).toEqual(0);
        expect(layout.offsetTop(document)).toEqual(0);

        expect(layout.offsetLeft(div1El)).toBeGreaterThan(0);
        expect(layout.offsetTop(div1El)).toBeGreaterThan(0);
    });
});
