"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertElement = exports.insertText = exports.createDocumentFragment = exports.createTextNode = exports.fixTextContent = exports.fixRowContent = exports.fixEditorContent = exports.createRowTag = exports.createTextTag = exports.isEmptyElement = exports.createElement = void 0;
var const_1 = require("../const");
var range_1 = require("./range");
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
 * 判断一个标签是否为空标签
 */
var isEmptyElement = function (el) {
    return Boolean(!el.textContent || el.textContent === "\n" || el.textContent === const_1.PLACEHOLDER_TEXT);
};
exports.isEmptyElement = isEmptyElement;
/**
 * 创建一个文本标签
 */
var createTextTag = function (content) {
    if (content === void 0) { content = const_1.PLACEHOLDER_TEXT; }
    return (0, exports.createElement)("span", { className: const_1.TEXT_TAG_CLASS, content: content });
};
exports.createTextTag = createTextTag;
/**
 * 创建一个行标签
 */
var createRowTag = function () {
    return (0, exports.createElement)("p", { className: const_1.ROW_TAG_CLASS, content: (0, exports.createTextTag)(const_1.NEW_LINE) });
};
exports.createRowTag = createRowTag;
/**
 * 修正编辑器内容
 */
var fixEditorContent = function (editor) {
    if (!editor.innerText || editor.innerText === "\n" || editor.innerText === const_1.PLACEHOLDER_TEXT) {
        editor.innerHTML = "";
        var textTag = (0, exports.createTextTag)(const_1.NEW_LINE);
        editor.appendChild((0, exports.createElement)("p", { className: const_1.ROW_TAG_CLASS, content: textTag }));
        return true;
    }
    return false;
};
exports.fixEditorContent = fixEditorContent;
/**
 * 修正行内容
 */
var fixRowContent = function (rowEl) {
    var _a;
    if (rowEl.childNodes.length > 1) {
        var brs = rowEl.querySelectorAll("br");
        brs.forEach(function (br) { return br.remove(); });
    }
    if ((0, exports.isEmptyElement)(rowEl)) {
        rowEl.innerHTML = (0, exports.createTextTag)(const_1.NEW_LINE).outerHTML;
    }
    else if (((_a = rowEl.children[rowEl.children.length - 1]) === null || _a === void 0 ? void 0 : _a.className) !== const_1.TEXT_TAG_CLASS) {
        rowEl.appendChild((0, exports.createTextTag)());
    }
};
exports.fixRowContent = fixRowContent;
/**
 * 修正文本内容
 */
var fixTextContent = function (textEl) {
    // 修正文本内容，如果内容长度>1则删除所有的0宽占位符
    if (textEl.textContent && textEl.textContent.length > 1) {
        textEl.textContent = textEl.textContent.replace(const_1.PLACEHOLDER_TEXT, "");
    }
};
exports.fixTextContent = fixTextContent;
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
// 插入文本
var insertText = function (text, range) {
    var commonEl = range.commonAncestorContainer;
    if (!["BR", "#text"].includes(commonEl === null || commonEl === void 0 ? void 0 : commonEl.nodeName) && commonEl.className !== const_1.TEXT_TAG_CLASS)
        return false;
    if (commonEl.nodeName === "BR") {
        var els = (0, range_1.rangeEls)(range);
        if (!els)
            return false;
        els.textEl.removeChild(range.commonAncestorContainer);
        els.textEl.innerHTML = text;
        // 修正光标位置
        (0, range_1.moveRangeAtRowEnd)(range, els.rowEl);
        return true;
    }
    range.insertNode((0, exports.createTextNode)(text));
    return true;
};
exports.insertText = insertText;
// 在文本内容中插入元素
var insertElement = function (el, range) {
    var _a, _b, _c;
    var commonEl = range.commonAncestorContainer;
    if (!["BR", "#text"].includes(commonEl === null || commonEl === void 0 ? void 0 : commonEl.nodeName) && commonEl.className !== const_1.TEXT_TAG_CLASS)
        return false;
    var els = (0, range_1.rangeEls)(range);
    if (!els)
        return false;
    // 如果光标在BR标签上
    var brs = els.textEl.querySelectorAll("br");
    if (brs.length) {
        brs.forEach(function (br) { return br.remove(); });
    }
    // 如果当前文本元素是个空元素
    if (!els.textEl.textContent) {
        var t = (0, exports.createTextNode)(const_1.PLACEHOLDER_TEXT);
        els.textEl.appendChild(t);
        // 修正光标位置
        range.setStart(t, 0);
        range.setEnd(t, 0);
    }
    el.setAttribute("contenteditable", "false");
    // 如果当前光标在文本节点开头，则将元素插入到文本节点之前
    if (range.startOffset === 0) {
        // 获取当前textEL的前一个兄弟节点
        var prevEl = els.textEl.previousElementSibling;
        if (!prevEl || prevEl.className !== const_1.TEXT_TAG_CLASS) {
            els.textEl.insertAdjacentElement("beforebegin", (0, exports.createTextTag)());
        }
        els.textEl.insertAdjacentElement("beforebegin", el);
        return true;
    }
    else if (range.endOffset === ((_a = range.endContainer.textContent) === null || _a === void 0 ? void 0 : _a.length)) {
        // 获取当前textEL的下一个兄弟节点
        var nextEl = els.textEl.nextElementSibling;
        if (!nextEl || nextEl.className !== const_1.TEXT_TAG_CLASS) {
            nextEl = (0, exports.createTextTag)();
            els.textEl.insertAdjacentElement("afterend", nextEl);
        }
        els.textEl.insertAdjacentElement("afterend", el);
        // 更新光标位置
        range.setStart(nextEl, 0);
        range.setEnd(nextEl, 0);
        return true;
    }
    // 如果当前光标在文本节点中间，则将文本节点分割为两个，并将元素插入到中间
    var text1 = ((_b = range.endContainer.textContent) === null || _b === void 0 ? void 0 : _b.slice(0, range.endOffset)) || const_1.PLACEHOLDER_TEXT;
    var text2 = ((_c = range.endContainer.textContent) === null || _c === void 0 ? void 0 : _c.slice(range.endOffset)) || const_1.PLACEHOLDER_TEXT;
    range.endContainer.textContent = text1;
    var textEl2 = (0, exports.createTextTag)(text2);
    els.textEl.insertAdjacentElement("afterend", textEl2);
    els.textEl.insertAdjacentElement("afterend", el);
    // 更新光标位置
    range.setStart(textEl2.childNodes[0], 0);
    range.setEnd(textEl2.childNodes[0], 0);
    return true;
};
exports.insertElement = insertElement;
