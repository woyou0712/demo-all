"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = wordDelete;
var const_1 = require("../const");
var _1 = require(".");
var range_1 = require("./range");
function onDelete(range, _a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k;
    var rowEl = _a.rowEl, textEl = _a.textEl;
    var rangeNode = range.commonAncestorContainer;
    // 删除文本内容
    var isText = rangeNode.nodeName === "#text";
    var textLength = ((_b = rangeNode.textContent) === null || _b === void 0 ? void 0 : _b.length) || 0;
    var isEmpty = rangeNode.textContent === const_1.PLACEHOLDER_TEXT;
    if (isText && !isEmpty && range.endOffset < textLength) {
        // 如果只有一个字符，则将节点内容设置为0宽占位符
        if (textLength === 1) {
            rangeNode.textContent = const_1.PLACEHOLDER_TEXT;
            return true;
        }
        // 否则删除光标位置之后的第一个文本内容
        var index = range.endOffset;
        // 找到要删除的内容
        var text = (_c = rangeNode.textContent) === null || _c === void 0 ? void 0 : _c[index];
        var sIndex = index;
        var eIndex = index + 1;
        if (text === const_1.PLACEHOLDER_TEXT) {
            index += 1;
            sIndex = index;
            eIndex = index + 1;
            text = (_d = rangeNode.textContent) === null || _d === void 0 ? void 0 : _d[index + 1];
        }
        // 如果要删除的是\r，则将连续的\r都删除
        if (text === "\r" && index < Number((_e = rangeNode.textContent) === null || _e === void 0 ? void 0 : _e.length)) {
            for (var i = index; i < Number((_f = rangeNode.textContent) === null || _f === void 0 ? void 0 : _f.length); i++) {
                if (((_g = rangeNode.textContent) === null || _g === void 0 ? void 0 : _g[i]) === "\r") {
                    index += 1;
                    eIndex = index + 1;
                }
                else
                    break;
            }
        }
        var text1 = ((_h = rangeNode.textContent) === null || _h === void 0 ? void 0 : _h.slice(0, sIndex)) || "";
        var text2 = ((_j = rangeNode.textContent) === null || _j === void 0 ? void 0 : _j.slice(eIndex)) || "";
        rangeNode.textContent = text1 + text2;
        index = Math.min(index, rangeNode.textContent.length);
        range.setStart(rangeNode, index);
        range.collapse(true);
        return true;
    }
    // 获取当前所在行的下一个兄弟节点
    var nextRow = rowEl.nextElementSibling;
    // 如果当前节点是空标签
    if ((0, _1.isEmptyElement)(rowEl)) {
        // 如果存在下一个兄弟节点
        if (nextRow) {
            rowEl.remove();
            // 将光标移动到下一个兄弟的起点
            (0, range_1.moveRangeAtRowStart)(range, nextRow);
        }
        return true;
    }
    // 没有下一个节点并且在当前行的末尾
    if (!nextRow && (0, range_1.isRangeAtRowEnd)(range, rowEl)) {
        return true;
    }
    // 如果光标在当前行的末尾并且有下一个兄弟节点
    if ((0, range_1.isRangeAtRowEnd)(range, rowEl) && nextRow) {
        // 如果下一个节点是空标签
        if ((0, _1.isEmptyElement)(nextRow)) {
            nextRow.remove();
            return true;
        }
        // 将下一个兄弟节点的内容转移到当前节点
        (0, _1.transferElement)(nextRow, rowEl);
        return true;
    }
    var delEl = textEl; // 要删除的内容
    // 如果当前是空节点或者光标在当前文本的末尾
    if ((0, _1.isEmptyElement)(textEl) || (0, range_1.isRangeAtTextEnd)(range)) {
        var index = Array.from(rowEl.childNodes).indexOf(textEl);
        // 往后删除所有空节点
        var delIndexs = [];
        // 如果当前节点为空，则删除当前节点
        if ((0, _1.isEmptyElement)(delEl))
            delIndexs.push(delEl);
        for (var i = index + 1; i < rowEl.childNodes.length; i++) {
            var node = rowEl.childNodes[i];
            if ((0, _1.isEmptyElement)(node)) {
                delIndexs.push(node);
            }
            else {
                delEl = node;
                break;
            }
        }
        // 删除所有空节点
        delIndexs.forEach(function (node) {
            var _a;
            (_a = node.parentElement) === null || _a === void 0 ? void 0 : _a.removeChild(node);
        });
    }
    // 如果是文本节点，则删除第一个字符并将光标移动到节点开头
    if (delEl.className === const_1.TEXT_TAG_CLASS) {
        delEl.textContent = ((_k = delEl.textContent) === null || _k === void 0 ? void 0 : _k.slice(1)) || "";
        // 如果还有剩余内容，将光标移动到节点开头
        if (!(0, _1.isEmptyElement)(delEl)) {
            var textNode = delEl.lastChild;
            range.setStart(textNode ? textNode : delEl, 0);
            range.collapse(true);
            return true;
        }
    }
    // 获取下一个节点
    var nextNode = delEl.nextElementSibling;
    delEl.remove();
    if ((0, _1.isEmptyElement)(rowEl)) {
        rowEl.innerHTML = (0, _1.createTextTag)(const_1.NEW_LINE).outerHTML;
        (0, range_1.moveRangeAtRowEnd)(range, rowEl);
    }
    else if (nextNode) {
        // 下一个节点的第一个子节点
        var textNode = nextNode.firstChild;
        range.setStart(textNode ? textNode : nextNode, 0);
        range.collapse(true);
    }
    return true;
}
function onBackspace(range, _a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k;
    var rowEl = _a.rowEl, textEl = _a.textEl;
    var rangeNode = range.commonAncestorContainer;
    // 删除文本内容
    var isText = rangeNode.nodeName === "#text";
    var isEmpty = rangeNode.textContent === const_1.PLACEHOLDER_TEXT;
    if (isText && !isEmpty && range.startOffset > 0) {
        // 如果只有一个字符，则将节点内容设置为0宽占位符
        if (((_b = range.startContainer.textContent) === null || _b === void 0 ? void 0 : _b.length) === 1) {
            rangeNode.textContent = const_1.PLACEHOLDER_TEXT;
            return true;
        }
        // 否则删除光标位置之前的第一个文本内容
        var index = range.startOffset;
        // 找到要删除的内容
        var text = (_c = rangeNode.textContent) === null || _c === void 0 ? void 0 : _c[index - 1];
        var sIndex = index - 1;
        var eIndex = index;
        if (text === const_1.PLACEHOLDER_TEXT) {
            index -= 1;
            sIndex = index - 1;
            eIndex = index;
            text = (_d = rangeNode.textContent) === null || _d === void 0 ? void 0 : _d[index - 1];
        }
        // 如果要删除的是\r，则将连续的\r都删除
        if (text === "\r" && index > 1) {
            for (var i = index - 1; i >= 0; i--) {
                if (((_e = rangeNode.textContent) === null || _e === void 0 ? void 0 : _e[i]) === "\r") {
                    index -= 1;
                    sIndex = index - 1;
                }
                else
                    break;
            }
        }
        var text1 = ((_f = rangeNode.textContent) === null || _f === void 0 ? void 0 : _f.slice(0, sIndex)) || "";
        var text2 = ((_g = rangeNode.textContent) === null || _g === void 0 ? void 0 : _g.slice(eIndex)) || "";
        rangeNode.textContent = text1 + text2;
        index = Math.max(0, index - 1);
        index = Math.min(index, rangeNode.textContent.length);
        range.setStart(rangeNode, index);
        range.collapse(true);
        return true;
    }
    // 获取当前光标所在P标签的上一个兄弟节点
    var upRow = rowEl.previousElementSibling;
    // 如果当前节点是空标签
    if ((0, _1.isEmptyElement)(rowEl)) {
        // 如果有上一个兄弟节点
        if (upRow) {
            rowEl.remove();
            // 将光标移动到上一个P标签的末尾
            (0, range_1.moveRangeAtRowEnd)(range, upRow);
        }
        // 如果没有兄弟不执行操作
        return true;
    }
    // 如果没有上级兄弟，并且光标在当前行开头，不执行操作
    if (!upRow && (0, range_1.isRangeAtRowStart)(range, rowEl)) {
        return true;
    }
    // 如果光标在当前行开头，并且有上一个兄弟节点
    if ((0, range_1.isRangeAtRowStart)(range, rowEl) && upRow) {
        // 如果上一个标签是空节点，直接删除上一个标签
        if ((0, _1.isEmptyElement)(upRow)) {
            upRow.remove();
            return true;
        }
        // 将光标移动到上一个P标签的末尾
        (0, range_1.moveRangeAtRowEnd)(range, upRow);
        rowEl.remove();
        // 将当前行的内容添加到上一行中
        (0, _1.transferElement)(rowEl, upRow);
        return true;
    }
    var delEl = textEl; // 要删除的内容
    // 如果当前是空节点或者光标在当前文本的开头
    if ((0, _1.isEmptyElement)(textEl) || (0, range_1.isRangeAtTextStart)(range)) {
        var index = Array.from(rowEl.childNodes).indexOf(textEl);
        // 如果为空，删除当前节点
        if ((0, _1.isEmptyElement)(textEl))
            textEl.remove();
        // 往前删除所有空节点
        for (var i = index - 1; i >= 0; i--) {
            var node = rowEl.childNodes[i];
            if (!(0, _1.isEmptyElement)(node)) {
                delEl = node;
                break;
            }
            node.remove();
        }
    }
    // 如果是文本节点，则删除最后一个文字
    if (delEl.className === const_1.TEXT_TAG_CLASS) {
        delEl.textContent = ((_h = delEl.textContent) === null || _h === void 0 ? void 0 : _h.slice(0, -1)) || "";
        // 如果还有内容，将光标移动到文本末尾
        if (!(0, _1.isEmptyElement)(delEl)) {
            var textNode = delEl.lastChild;
            var textLength = ((_j = delEl.textContent) === null || _j === void 0 ? void 0 : _j.length) || 0;
            range.setStart(textNode ? textNode : delEl, textNode ? textLength : delEl.childNodes.length);
            range.collapse(true);
            return true;
        }
    }
    // 获取上一个节点
    var upNode = delEl.previousElementSibling;
    delEl.remove();
    // 修正光标位置
    if ((0, _1.isEmptyElement)(rowEl)) {
        rowEl.innerHTML = (0, _1.createTextTag)(const_1.NEW_LINE).outerHTML;
        (0, range_1.moveRangeAtRowEnd)(range, rowEl);
    }
    else if (upNode) {
        var childLength = upNode.childNodes.length;
        var nextChild = upNode.childNodes[childLength - 1];
        var index = (0, _1.isEmptyElement)(upNode) ? 0 : ((_k = nextChild.textContent) === null || _k === void 0 ? void 0 : _k.length) || 0;
        range.setStart(nextChild, index);
        range.collapse(true);
    }
    return true;
}
function wordDelete(e, editorEl) {
    var range = (0, range_1.getRangeAt)();
    if (!range)
        return false;
    if ((0, _1.fixEditorContent)(editorEl)) {
        // 将光标移动到编辑器末尾
        (0, range_1.moveRangeAtEditorEnd)(range, editorEl);
        return true;
    }
    // 如果有选中内容
    if (!range.collapsed) {
        // 获取光标开始和结束的P标签
        var sEls = (0, range_1.rangeEls)(range, "start");
        var eEls = (0, range_1.rangeEls)(range, "end");
        if (!(sEls === null || sEls === void 0 ? void 0 : sEls.rowEl) || !(eEls === null || eEls === void 0 ? void 0 : eEls.rowEl))
            return false;
        var _a = [sEls.rowEl, eEls.rowEl], startP = _a[0], endP = _a[1];
        var startContainer = range.startContainer;
        var startOffset = range.startOffset;
        // 如果存在选中内容,删除选中内容
        range.deleteContents();
        // 如果开始和结束P标签不一致，将结束标签中的剩余内容复制到开始标签中，并删除结束标签
        if (startP !== endP) {
            endP.remove();
            (0, _1.transferElement)(endP, startP);
        }
        // 修正光标位置
        range.setStart(startContainer, startOffset);
        range.collapse(true);
        return true;
    }
    // 获取当前光标所在的P标签
    var els = (0, range_1.rangeEls)(range);
    if (!els)
        return true;
    var bool = false;
    (0, range_1.fixTextRange)(range, els.textEl);
    if (e.code === "Backspace") {
        bool = onBackspace(range, els);
    }
    if (e.code === "Delete") {
        bool = onDelete(range, els);
    }
    if (bool) {
        // 修正当前行标签
        (0, _1.fixRowContent)(els.rowEl);
    }
    return bool;
}
