"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createElement = createElement;
exports.isEmptyElement = isEmptyElement;
exports.createTextTag = createTextTag;
exports.createRowTag = createRowTag;
exports.fixEditorContent = fixEditorContent;
exports.fixRowContent = fixRowContent;
exports.createTextNode = createTextNode;
exports.createDocumentFragment = createDocumentFragment;
exports.transferElement = transferElement;
exports.isNeedFix = isNeedFix;
exports.formatString = formatString;
var const_1 = require("../const");
function createElement(type, _a) {
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
}
/**
 * 判断一个标签是否为空标签
 */
function isEmptyElement(el) {
    var text = el.innerText;
    if (!text)
        text = el.textContent || "";
    var notContext = !text;
    var newLine = text === "\n";
    var isEmpty = new RegExp("^".concat(const_1.PLACEHOLDER_TEXT, "+$")).test(text);
    return Boolean(notContext || newLine || isEmpty);
}
/**
 * 创建一个文本标签
 */
function createTextTag(content) {
    if (content === void 0) { content = const_1.PLACEHOLDER_TEXT; }
    return createElement("span", { className: const_1.TEXT_TAG_CLASS, content: content });
}
/**
 * 创建一个行标签
 */
function createRowTag() {
    return createElement("p", { className: const_1.ROW_TAG_CLASS, content: createTextTag(const_1.NEW_LINE) });
}
/**
 * 修正编辑器内容
 */
function fixEditorContent(editor) {
    if (isEmptyElement(editor)) {
        editor.innerHTML = "";
        editor.appendChild(createElement("p", { className: const_1.ROW_TAG_CLASS, content: createTextTag(const_1.NEW_LINE) }));
        return true;
    }
    return false;
}
/**
 * 修正行内容
 */
function fixRowContent(rowEl, rangeTextEl) {
    var _a, _b;
    if (isEmptyElement(rowEl)) {
        rowEl.innerHTML = createTextTag(const_1.NEW_LINE).outerHTML;
        return;
    }
    if (((_a = rowEl.children[0]) === null || _a === void 0 ? void 0 : _a.className) !== const_1.TEXT_TAG_CLASS) {
        rowEl.insertBefore(createTextTag(), rowEl.firstChild);
    }
    if (((_b = rowEl.children[rowEl.children.length - 1]) === null || _b === void 0 ? void 0 : _b.className) !== const_1.TEXT_TAG_CLASS) {
        rowEl.appendChild(createTextTag(const_1.NEW_LINE));
    }
    // 将相邻的空节点合并
    for (var i = rowEl.childNodes.length - 1; i > 0; i--) {
        var prev = rowEl.childNodes[i - 1];
        var next = rowEl.childNodes[i];
        if (isEmptyElement(prev) && isEmptyElement(next)) {
            // 不改变光标标签
            if (rangeTextEl && next === rangeTextEl) {
                prev.remove();
            }
            else {
                next.remove();
            }
        }
    }
}
function createTextNode(text) {
    if (text === void 0) { text = ""; }
    return document.createTextNode(text);
}
/**
 * 创建一个空节点用来装载子元素
 * @returns
 */
function createDocumentFragment() {
    var fr = document.createDocumentFragment();
    return fr;
}
/**
 * 将一个元素的内容转移到另外一个元素下面
 * @param el 需要移动的元素
 * @param target 目标元素
 */
function transferElement(el, target) {
    // 先合并紧挨着的相同的元素（text元素和text文本）
    var children = [];
    for (var i = el.childNodes.length - 1; i >= 0; i--) {
        var child = el.childNodes[i];
        if (child.nodeName === "#text" || child.className === const_1.TEXT_TAG_CLASS) {
            var content = child.textContent || "";
            var prevChild = el.childNodes[i - 1];
            if (prevChild && (prevChild.nodeName === "#text" || prevChild.className === const_1.TEXT_TAG_CLASS)) {
                content = (child.textContent || "") + (prevChild.textContent || "");
                el.removeChild(prevChild);
                i--;
            }
            content = formatString(content, true);
            child.textContent = content;
        }
        children.unshift(child);
    }
    var fr = createDocumentFragment();
    var targetIsRow = target.className === const_1.ROW_TAG_CLASS;
    children.forEach(function (node) {
        var el = targetIsRow && node.nodeName === "#text" ? createTextTag(node.textContent || const_1.PLACEHOLDER_TEXT) : node;
        fr.appendChild(el);
    });
    target.appendChild(fr);
}
/**
 * 判断文本内容是否需要修正
 */
function isNeedFix(text) {
    if (!text)
        return false;
    return new RegExp("\n|".concat(const_1.PLACEHOLDER_TEXT, "|\r")).test(text);
}
/**
 * 格式化字符串，删除字符串中的\n和连续的\r
 */
function formatString(str, isPlaceholder) {
    if (isPlaceholder === void 0) { isPlaceholder = false; }
    if (!str)
        return isPlaceholder ? const_1.PLACEHOLDER_TEXT : "";
    var result = str.replace(/\r+/g, "\r").replace(/\n+/g, "").replace(new RegExp(const_1.PLACEHOLDER_TEXT, "g"), "");
    return result ? result : isPlaceholder ? const_1.PLACEHOLDER_TEXT : "";
}
