"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCursorAtStart = exports.isCursorAtEnd = exports.moveCursorToEnd = exports.moveCursorToStart = exports.createDocumentFragment = exports.createTextNode = exports.getRangeAt = exports.getSelection = exports.isEmptyElement = exports.getCurrentP = exports.createElement = void 0;
var const_1 = require("./const");
var createElement = function (type, _a) {
    var _b = _a === void 0 ? {} : _a, className = _b.className, style = _b.style, content = _b.content;
    var element = document.createElement(type);
    if (className)
        element.className = className;
    if (style) {
        Object.keys(style).forEach(function (key) { return (element.style[key] = style[key]); });
    }
    if (content && typeof content === "string")
        element.innerHTML = content;
    else if (content && typeof content === "object")
        element.appendChild(content);
    return element;
};
exports.createElement = createElement;
/**
 * 获取当前光标所在的p标签
 */
var getCurrentP = function (range, type) {
    var _a;
    if (type === void 0) { type = "common"; }
    var currentP;
    if (type === "start") {
        currentP = range.startContainer;
    }
    else if (type === "end") {
        currentP = range.endContainer;
    }
    else {
        currentP = range.commonAncestorContainer;
    }
    if (!currentP)
        return null;
    // 如果当前光标所在节点为根节点，则向下寻找p标签
    if ((_a = currentP.className) === null || _a === void 0 ? void 0 : _a.includes(const_1.EDITOR_CLASS)) {
        currentP = currentP.childNodes[range.endOffset > 0 ? range.endOffset - 1 : 0];
        if ((currentP === null || currentP === void 0 ? void 0 : currentP.className) !== const_1.P_TAG_CLASS)
            return null;
        // 修正光标位置
        var index = range.endOffset > currentP.childNodes.length ? currentP.childNodes.length : range.endOffset;
        if (type === "start") {
            index = range.startOffset > currentP.childNodes.length ? currentP.childNodes.length : range.startOffset;
            range.setStart(currentP, index);
        }
        else if (type === "end") {
            range.setEnd(currentP, index);
        }
        else {
            range.setStart(currentP, index);
            range.setEnd(currentP, index);
        }
    }
    for (var i = 0; i < 10 && currentP.className !== const_1.P_TAG_CLASS; i++) {
        currentP = currentP.parentElement;
    }
    if ((currentP === null || currentP === void 0 ? void 0 : currentP.className) !== const_1.P_TAG_CLASS)
        return null;
    if (type === "common") {
        // 如果子节点大于1的情况下，删除所有BR子节点
        if (currentP.childNodes.length > 1) {
            var brs = currentP.querySelectorAll("br");
            brs.forEach(function (br) { return br.remove(); });
        }
        if ((0, exports.isEmptyElement)(currentP)) {
            currentP.innerHTML = "<br/>";
        }
    }
    return currentP;
};
exports.getCurrentP = getCurrentP;
/**
 * 判断一个标签是否为空标签
 */
var isEmptyElement = function (element) {
    return Boolean(!element.innerText || element.innerText === "\n");
};
exports.isEmptyElement = isEmptyElement;
var getSelection = function () {
    return window.getSelection();
};
exports.getSelection = getSelection;
var getRangeAt = function (selection, index) {
    if (index === void 0) { index = 0; }
    if (!selection)
        return null;
    var range = selection.getRangeAt(index);
    if (!range)
        return null;
    // 如果当前光标不在P标签中，则将光标移动到P标签中
    var currentP = (0, exports.getCurrentP)(range);
    if (currentP) {
        return range;
    }
    return null;
};
exports.getRangeAt = getRangeAt;
var createTextNode = function (text) {
    if (text === void 0) { text = ""; }
    return document.createTextNode(text);
};
exports.createTextNode = createTextNode;
// 创建一个空节点用来装载子元素
var createDocumentFragment = function (el) {
    var fr = document.createDocumentFragment();
    if (el) {
        fr.appendChild(el);
    }
    return fr;
};
exports.createDocumentFragment = createDocumentFragment;
/**
 * 将光标移动到P标签的开头
 */
var moveCursorToStart = function (range, currentP) {
    var firstChild = currentP.firstChild;
    if ((firstChild === null || firstChild === void 0 ? void 0 : firstChild.nodeName) === "#text") {
        range.setStart(firstChild, 0);
        range.setEnd(firstChild, 0);
    }
    else {
        range.setStart(currentP, 0);
        range.setEnd(currentP, 0);
    }
};
exports.moveCursorToStart = moveCursorToStart;
/**
 * 将光标移动到P标签的末尾
 */
var moveCursorToEnd = function (range, currentP) {
    var _a, _b;
    var lastChild = currentP.lastChild;
    if ((lastChild === null || lastChild === void 0 ? void 0 : lastChild.nodeName) === "#text") {
        range.setStart(lastChild, ((_a = lastChild.textContent) === null || _a === void 0 ? void 0 : _a.length) || 0);
        range.setEnd(lastChild, ((_b = lastChild.textContent) === null || _b === void 0 ? void 0 : _b.length) || 0);
    }
    else {
        range.setStart(currentP, currentP.childNodes.length);
        range.setEnd(currentP, currentP.childNodes.length);
    }
};
exports.moveCursorToEnd = moveCursorToEnd;
/**
 * 判断当前光标是否在p标签的末尾
 */
var isCursorAtEnd = function (range, currentP) {
    var _a;
    // 如果当前光标坐在P表示是空的，则认为光标在末尾
    if ((0, exports.isEmptyElement)(currentP))
        return true;
    // 获取当前P标签中的最后一个标签
    var lastChild = currentP.lastChild;
    if (!lastChild)
        return true;
    var endContainer = range.endContainer; // 获取光标所在标签
    if (endContainer === currentP) {
        // 如果光标直接在P标签上
        if (range.endOffset === currentP.childNodes.length)
            return true;
        if (lastChild.nodeName === "#text" && !lastChild.textContent && range.endOffset === currentP.childNodes.length - 1)
            return true;
    }
    else if (endContainer === lastChild) {
        // 如果光标在最后一个标签上
        if (lastChild.nodeName === "#text" && range.endOffset === Number((_a = lastChild.textContent) === null || _a === void 0 ? void 0 : _a.length))
            return true;
        if (lastChild.nodeName !== "#text" && range.endOffset === currentP.childNodes.length)
            return true;
    }
    return false;
};
exports.isCursorAtEnd = isCursorAtEnd;
/**
 * 判断当前光标是否在p标签的开头
 */
var isCursorAtStart = function (range, currentP) {
    // 如果当前光标坐在P表示是空的，在开头
    if ((0, exports.isEmptyElement)(currentP))
        return true;
    // 获取当前P标签中的第一个标签
    var firstChild = currentP.firstChild;
    if (!firstChild)
        return true;
    var startContainer = range.startContainer; // 获取光标所在标签
    // 如果光标直接在P标签上
    if (startContainer === currentP && range.startOffset === 0)
        return true;
    // 如果光标在第一个标签上
    if (startContainer === firstChild && range.startOffset === 0)
        return true;
    return false;
};
exports.isCursorAtStart = isCursorAtStart;
