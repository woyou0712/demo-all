"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSelection = getSelection;
exports.getRangeAt = getRangeAt;
exports.moveRangeAtEditorEnd = moveRangeAtEditorEnd;
exports.moveRangeAtRowEnd = moveRangeAtRowEnd;
exports.moveRangeAtRowStart = moveRangeAtRowStart;
exports.rangeEls = rangeEls;
exports.isRangeAtRowEnd = isRangeAtRowEnd;
exports.isRangeAtTextEnd = isRangeAtTextEnd;
exports.isRangeAtRowStart = isRangeAtRowStart;
exports.isRangeAtTextStart = isRangeAtTextStart;
exports.fixTextRange = fixTextRange;
var _1 = require(".");
var const_1 = require("../const");
function getSelection() {
    if (window.getSelection) {
        return window.getSelection();
    }
    return null;
}
/**
 * 获取光标位置
 * @param index
 * @returns
 */
function getRangeAt(index, selection) {
    if (index === void 0) { index = 0; }
    if (selection === void 0) { selection = getSelection(); }
    try {
        var range = selection === null || selection === void 0 ? void 0 : selection.getRangeAt(index);
        if (!range) {
            range = document.createRange();
            range.selectNodeContents(document.body);
            range.collapse(false);
            selection === null || selection === void 0 ? void 0 : selection.removeAllRanges();
            selection === null || selection === void 0 ? void 0 : selection.addRange(range);
        }
        // 如果光标没有选中内容，修正光标位置
        if (range.collapsed) {
            rangeEls(range);
        }
        return range;
    }
    catch (error) {
        console.error("编辑器未获取焦点");
        return null;
    }
}
/**
 * 将光标移动到编辑器末尾
 */
function moveRangeAtEditorEnd(range, editorEl) {
    // 获取最后一行
    var lastLine = editorEl.children[editorEl.children.length - 1];
    // 如果不是行元素
    if (!lastLine || lastLine.className !== const_1.ROW_TAG_CLASS) {
        // 修正标签
        lastLine = (0, _1.createElement)("p", { className: const_1.ROW_TAG_CLASS, content: (0, _1.createElement)("span", { className: const_1.TEXT_TAG_CLASS, content: const_1.NEW_LINE }) });
        // 添加到编辑器末尾
        editorEl.appendChild(lastLine);
    }
    moveRangeAtRowEnd(range, lastLine);
}
/**
 * 将光标位置移动到当前行的末尾
 */
function moveRangeAtRowEnd(range, rowEl) {
    var _a, _b;
    // 获取最后一个文本标签
    var lastText = rowEl.children[rowEl.children.length - 1];
    if (!lastText || lastText.className !== const_1.TEXT_TAG_CLASS) {
        // 修正标签
        lastText = (0, _1.createElement)("span", { className: const_1.TEXT_TAG_CLASS, content: rowEl.children.length > 0 ? const_1.PLACEHOLDER_TEXT : const_1.NEW_LINE });
        // 添加到行末尾
        rowEl.appendChild(lastText);
    }
    // 获取最后一个文本标签的长度
    var textNode = lastText.lastChild;
    var lastTextLength = (textNode ? (_a = textNode.textContent) === null || _a === void 0 ? void 0 : _a.length : (_b = lastText.textContent) === null || _b === void 0 ? void 0 : _b.length) || 0;
    // 设置光标位置
    range.setStart(textNode ? textNode : lastText, lastTextLength);
    range.collapse(true);
}
/**
 * 将光标位置移动到当前行的开头
 */
function moveRangeAtRowStart(range, rowEl) {
    // 获取第一个文本标签
    var firstText = rowEl.children[0];
    if (!firstText || firstText.className !== const_1.TEXT_TAG_CLASS) {
        // 修正标签
        firstText = (0, _1.createTextTag)(rowEl.children.length > 0 ? const_1.PLACEHOLDER_TEXT : const_1.NEW_LINE);
        // 添加到行开头
        rowEl.prepend(firstText);
    }
    // 设置光标位置
    var textNode = firstText.firstChild;
    range.setStart(textNode ? textNode : firstText, 0);
    range.collapse(true);
}
/**
 * 修正光标位置,并获取当前光标所在的编辑器/行/文本
 */
function rangeEls(range, which) {
    if (which === void 0) { which = "common"; }
    // 光标所在的编辑器
    var editorEl = null;
    // 光标所在的行
    var rowEl = null;
    // 光标所在的文本
    var textEl = null;
    var el;
    if (which === "end") {
        el = range.endContainer;
    }
    else if (which === "start") {
        el = range.startContainer;
    }
    else {
        el = range.commonAncestorContainer;
    }
    if (!el)
        return null;
    // 向上找节点，最多找10层
    for (var i = 0; i < 10 && !editorEl; i++) {
        if (el.className === const_1.TEXT_TAG_CLASS) {
            textEl = el;
        }
        else if (el.className === const_1.ROW_TAG_CLASS) {
            rowEl = el;
        }
        else if (el.className === const_1.EDITOR_CLASS) {
            editorEl = el;
            break;
        }
        el = el.parentElement;
    }
    if (!editorEl)
        return null;
    if (textEl && rowEl)
        return { editorEl: editorEl, rowEl: rowEl, textEl: textEl };
    if (which !== "common")
        return null;
    // 查找当前光标，如果光标不在文本标签中，修正光标位置
    if (!rowEl) {
        var index = range.startOffset > editorEl.childNodes.length - 1 ? editorEl.childNodes.length - 1 : range.startOffset;
        rowEl = editorEl.childNodes[index];
        if (!rowEl || rowEl.className !== const_1.ROW_TAG_CLASS) {
            textEl = (0, _1.createTextTag)(const_1.NEW_LINE);
            rowEl = (0, _1.createElement)("p", { className: const_1.ROW_TAG_CLASS, content: textEl });
            editorEl.appendChild(rowEl);
        }
    }
    textEl = rowEl.children[rowEl.children.length - 1];
    if (!textEl || textEl.className !== const_1.TEXT_TAG_CLASS) {
        textEl = (0, _1.createTextTag)(rowEl.children.length > 0 ? const_1.PLACEHOLDER_TEXT : const_1.NEW_LINE);
        rowEl.appendChild(textEl);
    }
    // 如果光标位置不在TEXT节点上，修正光标位置
    if (range.commonAncestorContainer.nodeName !== "#text") {
        var tNode = textEl.firstChild;
        // 设置光标位置
        range.setStart(tNode ? tNode : textEl, 0);
        range.collapse(true);
    }
    return { editorEl: editorEl, rowEl: rowEl, textEl: textEl };
}
/**
 * 判断光标是否在当前行的末尾
 */
function isRangeAtRowEnd(range, rowEl) {
    var els = rangeEls(range);
    if (!els)
        return false;
    if (els.rowEl !== rowEl)
        return false;
    if (els.textEl !== rowEl.children[rowEl.children.length - 1])
        return false;
    if (range.endContainer === rowEl && range.endOffset === rowEl.childNodes.length)
        return true;
    return isRangeAtTextEnd(range);
}
/**
 * 判断光标是否在当前文本元素末尾
 */
function isRangeAtTextEnd(range) {
    var _a, _b, _c, _d;
    var textEl = range.endContainer;
    if (((_a = textEl.textContent) === null || _a === void 0 ? void 0 : _a[((_b = textEl.textContent) === null || _b === void 0 ? void 0 : _b.length) - 1]) === const_1.PLACEHOLDER_TEXT && range.endOffset === ((_c = textEl.textContent) === null || _c === void 0 ? void 0 : _c.length) - 1)
        return true;
    return range.endOffset === ((_d = textEl.textContent) === null || _d === void 0 ? void 0 : _d.length);
}
/**
 * 判断光标是否在当前行的开头
 */
function isRangeAtRowStart(range, rowEl) {
    // 如果不是0宽占位符就必须是0
    if (range.commonAncestorContainer.textContent !== const_1.PLACEHOLDER_TEXT && range.startOffset !== 0)
        return false;
    var els = rangeEls(range);
    if (!els)
        return false;
    if (els.rowEl !== rowEl)
        return false;
    if (els.textEl !== rowEl.children[0])
        return false;
    if (range.startContainer === rowEl && range.startOffset === 0)
        return true;
    return isRangeAtTextStart(range);
}
/**
 * 判断光标是否在当前文本元素开头
 */
function isRangeAtTextStart(range) {
    var _a;
    var textEl = range.startContainer;
    if (((_a = textEl.textContent) === null || _a === void 0 ? void 0 : _a[0]) === const_1.PLACEHOLDER_TEXT && range.startOffset === 1)
        return true;
    return range.startOffset === 0;
}
/**
 * 修正文本标签光标
 */
function fixTextRange(range, textEl) {
    var _a, _b;
    if (range.startContainer.nodeName === "BR") {
        var text_1 = (0, _1.createTextNode)();
        textEl.appendChild(text_1);
        range.setStart(text_1, 0);
        range.collapse(true);
        return;
    }
    if (textEl.childNodes.length <= 1)
        return;
    if (range.startContainer.nodeName !== "#text" && range.startContainer !== textEl)
        return;
    var rangeEl = range.startContainer;
    var rangeIndex = range.startOffset;
    if (rangeEl === textEl) {
        rangeEl = textEl.childNodes[range.startOffset - 1];
        rangeIndex = ((_a = rangeEl.textContent) === null || _a === void 0 ? void 0 : _a.length) || 0;
    }
    for (var i = 0; i < textEl.childNodes.length; i++) {
        if (rangeEl === textEl.childNodes[i]) {
            break;
        }
        else {
            rangeIndex += ((_b = textEl.childNodes[i].textContent) === null || _b === void 0 ? void 0 : _b.length) || 0;
        }
    }
    var text = textEl.textContent || "";
    // 清除所有的占位符和换行符
    for (var i = 0; i < text.length; i++) {
        if (i > rangeIndex)
            break;
        var t = text[i];
        if (t === const_1.PLACEHOLDER_TEXT || t === "\n") {
            rangeIndex -= 1;
        }
    }
    rangeIndex = Math.max(rangeIndex, 0);
    text = text.replace(new RegExp(const_1.PLACEHOLDER_TEXT, "g"), "");
    text = text.replace(/\n/g, "");
    if (!text) {
        text = const_1.PLACEHOLDER_TEXT;
        rangeIndex = 1;
    }
    textEl.innerHTML = "";
    var textNode = (0, _1.createTextNode)(text);
    textEl.appendChild(textNode);
    range.setStart(textNode, rangeIndex <= text.length ? rangeIndex : text.length);
    range.collapse(true);
}
