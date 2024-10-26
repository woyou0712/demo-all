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
exports.fixTextContent = fixTextContent;
exports.removeRangeContent = removeRangeContent;
exports.insertText = insertText;
exports.insertElement = insertElement;
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
    var _a;
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
    var lastTextLength = (textNode ? (_a = textNode.textContent) === null || _a === void 0 ? void 0 : _a.length : lastText.childNodes.length) || 0;
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
    var _a, _b;
    if (which === void 0) { which = "common"; }
    // 光标所在的编辑器
    var editorEl = null;
    // 光标所在的行
    var rowEl = null;
    // 光标所在的文本
    var textEl = null;
    var rangeEl;
    var rangeIndex = which === "start" ? range.startOffset : range.endOffset;
    if (which === "end") {
        rangeEl = range.endContainer;
    }
    else if (which === "start") {
        rangeEl = range.startContainer;
    }
    else {
        rangeEl = range.commonAncestorContainer;
    }
    if (!rangeEl)
        return null;
    // 向上找节点，最多找10层
    for (var i = 0, el = rangeEl; i < 10 && !editorEl; i++) {
        if (el.className === const_1.TEXT_TAG_CLASS || ((_a = el.parentElement) === null || _a === void 0 ? void 0 : _a.className) === const_1.ROW_TAG_CLASS) {
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
    if (!rowEl) {
        var index_1 = rangeIndex > editorEl.childNodes.length - 1 ? editorEl.childNodes.length - 1 : rangeIndex;
        rowEl = editorEl.childNodes[index_1];
        if (!rowEl || rowEl.className !== const_1.ROW_TAG_CLASS) {
            textEl = (0, _1.createTextTag)(const_1.NEW_LINE);
            rowEl = (0, _1.createElement)("p", { className: const_1.ROW_TAG_CLASS });
            editorEl.appendChild(rowEl);
        }
        if (!textEl) {
            textEl = rowEl.children[rowEl.children.length - 1];
            if (textEl.className !== const_1.TEXT_TAG_CLASS) {
                textEl = (0, _1.createTextTag)(const_1.NEW_LINE);
                rowEl.appendChild(textEl);
            }
        }
        rangeIndex = which === "start" ? 0 : rowEl.childNodes.length;
    }
    if (!textEl || textEl.className !== const_1.TEXT_TAG_CLASS) {
        textEl = (0, _1.createTextTag)(rowEl.children.length > 0 ? const_1.PLACEHOLDER_TEXT : const_1.NEW_LINE);
        rowEl.appendChild(textEl);
        rangeIndex = which === "start" ? 0 : rowEl.childNodes.length;
    }
    // 查找当前光标，如果光标不在文本标签中，修正光标位置
    var textNode = null;
    var index = 0;
    if (rangeEl === rowEl) {
        var _textEl = (which === "start" ? rowEl.childNodes[0] : rowEl.childNodes[rangeIndex - 1]);
        if ((_textEl === null || _textEl === void 0 ? void 0 : _textEl.className) !== const_1.TEXT_TAG_CLASS) {
            _textEl = (which === "start" ? rowEl.firstElementChild : rowEl.lastElementChild);
        }
        textNode = (which === "start" ? _textEl.firstElementChild : _textEl.lastElementChild);
    }
    else if (rangeEl === textEl) {
        textNode = (which === "start" ? textEl.firstElementChild : textEl.lastElementChild);
    }
    if (textNode) {
        index = which === "start" ? 0 : ((_b = textNode.textContent) === null || _b === void 0 ? void 0 : _b.length) || 0;
        if (which === "start") {
            range.setStart(textNode, index);
        }
        else {
            range.setEnd(textNode, index);
        }
        if (which === "common")
            range.collapse(false);
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
 * 修正文本标签内容
 */
function fixTextContent(range, els) {
    var _a, _b;
    var _els = els || rangeEls(range);
    if (!_els)
        return;
    var textEl = _els.textEl;
    if (!(0, _1.isNeedFix)(textEl.textContent || ""))
        return;
    if (textEl.className !== const_1.TEXT_TAG_CLASS)
        return;
    if (range.startContainer.nodeName === "BR") {
        var br = range.startContainer;
        var text = (0, _1.createTextNode)();
        textEl.appendChild(text);
        range.setStart(text, 0);
        range.collapse(true);
        var content = textEl.textContent || "";
        if (content && content !== "\n") {
            (_a = br.parentElement) === null || _a === void 0 ? void 0 : _a.removeChild(br);
        }
        return;
    }
    if (Number((_b = textEl.textContent) === null || _b === void 0 ? void 0 : _b.length) <= 1)
        return;
    var rangeEl = range.startContainer;
    var rangeIndex = range.startOffset;
    var nodeIndex = 0;
    if (rangeEl === textEl) {
        nodeIndex = rangeIndex - 1;
        rangeIndex = 0;
    }
    else if (rangeEl.nodeName === "#text") {
        nodeIndex = Array.from(textEl.childNodes).indexOf(rangeEl);
    }
    // 获取光标两边的内容
    var prevText = "";
    var nextText = "";
    textEl.childNodes.forEach(function (node, index) {
        var _a, _b;
        if (index < nodeIndex) {
            prevText += node.textContent || "";
        }
        else if (index > nodeIndex) {
            nextText += node.textContent || "";
        }
        else {
            prevText += ((_a = node.textContent) === null || _a === void 0 ? void 0 : _a.slice(0, rangeIndex)) || "";
            nextText += ((_b = node.textContent) === null || _b === void 0 ? void 0 : _b.slice(rangeIndex)) || "";
        }
    });
    prevText = (0, _1.formatString)(prevText);
    nextText = (0, _1.formatString)(nextText);
    var textNode = (0, _1.createTextNode)(prevText + nextText);
    textEl.innerHTML = "";
    textEl.appendChild(textNode);
    range.setStart(textNode, prevText.length);
    range.collapse(true);
}
/**
 * 删除选中区域内的所有元素
 */
function removeRangeContent(range, _a) {
    var _b, _c;
    var _d = _a === void 0 ? {} : _a, startEls = _d.startEls, endEls = _d.endEls, mergeRow = _d.mergeRow;
    var sEls = startEls ? startEls : rangeEls(range);
    var eEls = endEls ? endEls : rangeEls(range);
    if (!sEls || !eEls)
        return;
    // 不在同一个编辑器内
    if (sEls.editorEl !== eEls.editorEl)
        return;
    // 如果是同一个文本标签
    if (sEls.textEl === eEls.textEl) {
        // 是标准文本标签
        if (sEls.textEl.className === const_1.TEXT_TAG_CLASS) {
            var rangeEl = range.startContainer;
            var rangeIndex = range.startOffset;
            // 删除选中内容
            range.deleteContents();
            range.setStart(rangeEl, rangeIndex);
            range.collapse(true);
            return;
        }
        // 删除标签
        sEls.textEl.remove();
        return;
    }
    var setMergeRow = function (startRow, endRow, _mergeRow) {
        if (!_mergeRow)
            return;
        // 将光标移动到开始标签的末尾
        moveRangeAtRowEnd(range, sEls.rowEl);
        // 将结束行的所有内容添加到开始行的末尾
        (0, _1.transferElement)(eEls.rowEl, sEls.rowEl);
        // 删除结束标签
        eEls.rowEl.remove();
    };
    // 如果不是同一个文本标签
    // 都是标准文本标签的情况下使用默认删除
    if (sEls.textEl.className === const_1.TEXT_TAG_CLASS && eEls.textEl.className === const_1.TEXT_TAG_CLASS) {
        // 删除选中内容
        range.deleteContents();
        setMergeRow(sEls.rowEl, eEls.rowEl, mergeRow);
        return;
    }
    // 获取开始标签下标
    var sIndex = Array.from(sEls.rowEl.children).indexOf(sEls.textEl);
    // 如果开始标签是标准文本标签
    if (sEls.textEl.className === const_1.TEXT_TAG_CLASS) {
        // 删除开始光标之后的内容
        var context = (_b = sEls.textEl.textContent) === null || _b === void 0 ? void 0 : _b.slice(range.startOffset);
        context = (0, _1.formatString)(context);
        if (context) {
            sEls.textEl.textContent = context;
            sIndex += 1; // 如果还有内容，开始标签往后移一位
        }
    }
    // 获取结束标签下标
    var eIndex = Array.from(eEls.rowEl.children).indexOf(eEls.textEl);
    // 如果结束标签是标准文本标签
    if (eEls.textEl.className === const_1.TEXT_TAG_CLASS) {
        // 删除结束光标之前的内容
        var context = (_c = eEls.textEl.textContent) === null || _c === void 0 ? void 0 : _c.slice(0, range.endOffset);
        context = (0, _1.formatString)(context);
        if (context) {
            eEls.textEl.textContent = context;
            eIndex -= 1; // 如果还有内容，结束标签往前移一位
        }
    }
    // 如果是同一行
    if (sEls.rowEl === eEls.rowEl) {
        // 删除开始标签和结束标签之间的所有标签（包括开始和结束标签）
        for (var i = eIndex; i >= sIndex; i++) {
            sEls.rowEl.children[i].remove();
        }
        return;
    }
    // 删除开始行和结束行之间的所有行
    var swIndex = Array.from(sEls.editorEl.children).indexOf(sEls.rowEl);
    var ewIndex = Array.from(eEls.editorEl.children).indexOf(eEls.rowEl);
    for (var i = ewIndex; i > swIndex; i--) {
        sEls.editorEl.children[i].remove();
    }
    // 从开始文本标签开始删除开始行的所有内容
    for (var i = sEls.rowEl.children.length - 1; i >= sIndex; i--) {
        sEls.rowEl.children[i].remove();
    }
    // 删除结束行的从头到结束标签之前的内容
    for (var i = eIndex; i >= 0; i--) {
        eEls.rowEl.children[i].remove();
    }
    return;
}
/**
 * 在光标位置插入文本
 * @param text 文本内容
 * @param range 光标位置
 * @returns
 */
function insertText(text, range) {
    var _a;
    var commonEl = range.commonAncestorContainer;
    if (!["BR", "#text"].includes(commonEl === null || commonEl === void 0 ? void 0 : commonEl.nodeName) && commonEl.className !== const_1.TEXT_TAG_CLASS)
        return false;
    if (commonEl.nodeName === "BR") {
        var els = rangeEls(range);
        if (!els)
            return false;
        (_a = commonEl.parentElement) === null || _a === void 0 ? void 0 : _a.removeChild(commonEl);
        els.textEl.innerHTML = text;
        fixTextContent(range, els);
        return true;
    }
    range.insertNode((0, _1.createTextNode)(text));
    return true;
}
/**
 * 在文本内容中插入元素
 * @param el 需要插入的元素
 * @param range 光标位置
 * @returns
 */
function insertElement(el, range) {
    var _a, _b, _c;
    var commonEl = range.commonAncestorContainer;
    if (!["BR", "#text"].includes(commonEl === null || commonEl === void 0 ? void 0 : commonEl.nodeName) && commonEl.className !== const_1.TEXT_TAG_CLASS)
        return false;
    var els = rangeEls(range);
    if (!els)
        return false;
    fixTextContent(range, els);
    // 如果当前文本元素是个空元素
    if (!els.textEl.textContent) {
        var t = (0, _1.createTextNode)(const_1.PLACEHOLDER_TEXT);
        els.textEl.appendChild(t);
        // 修正光标位置
        range.setStart(t, 0);
        range.collapse(true);
    }
    el.setAttribute("contenteditable", "false");
    // 如果当前光标在文本节点开头，则将元素插入到文本节点之前
    if (range.startOffset === 0) {
        // 获取当前textEL的前一个兄弟节点
        var prevEl = els.textEl.previousElementSibling;
        if (!prevEl || prevEl.className !== const_1.TEXT_TAG_CLASS) {
            els.textEl.insertAdjacentElement("beforebegin", (0, _1.createTextTag)());
        }
        els.textEl.insertAdjacentElement("beforebegin", el);
        return true;
    }
    else if (range.endOffset === ((_a = range.endContainer.textContent) === null || _a === void 0 ? void 0 : _a.length)) {
        // 获取当前textEL的下一个兄弟节点
        var nextEl = els.textEl.nextElementSibling;
        if (!nextEl || nextEl.className !== const_1.TEXT_TAG_CLASS) {
            nextEl = (0, _1.createTextTag)();
            els.textEl.insertAdjacentElement("afterend", nextEl);
        }
        els.textEl.insertAdjacentElement("afterend", el);
        // 更新光标位置
        range.setStart(nextEl, 0);
        range.collapse(true);
        return true;
    }
    // 如果当前光标在文本节点中间，则将文本节点分割为两个，并将元素插入到中间
    var text1 = ((_b = range.endContainer.textContent) === null || _b === void 0 ? void 0 : _b.slice(0, range.endOffset)) || const_1.PLACEHOLDER_TEXT;
    var text2 = ((_c = range.endContainer.textContent) === null || _c === void 0 ? void 0 : _c.slice(range.endOffset)) || const_1.PLACEHOLDER_TEXT;
    range.endContainer.textContent = text1;
    var textEl2 = (0, _1.createTextTag)(text2);
    els.textEl.insertAdjacentElement("afterend", textEl2);
    els.textEl.insertAdjacentElement("afterend", el);
    // 更新光标位置
    range.setStart(textEl2.childNodes[0], 0);
    range.collapse(true);
    return true;
}
