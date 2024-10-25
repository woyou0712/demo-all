"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = wordDelete;
var const_1 = require("../const");
var _1 = require(".");
var range_1 = require("./range");
function onDelete(range, _a) {
    var _b, _c, _d, _e, _f;
    var rowEl = _a.rowEl, textEl = _a.textEl;
    var rangeNode = range.commonAncestorContainer;
    // 删除文本内容使用默认行为
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
        var text1 = ((_d = rangeNode.textContent) === null || _d === void 0 ? void 0 : _d.slice(0, text === const_1.PLACEHOLDER_TEXT ? index + 1 : index)) || "";
        var text2 = ((_e = rangeNode.textContent) === null || _e === void 0 ? void 0 : _e.slice(text === const_1.PLACEHOLDER_TEXT ? index + 2 : index + 1)) || "";
        rangeNode.textContent = text1 + text2;
        range.setStart(rangeNode, index);
        range.setEnd(rangeNode, index);
        return true;
    }
    // 获取当前所在行的下一个兄弟节点
    var nextRow = rowEl.nextElementSibling;
    // 没有下一个节点并且在当前行的末尾
    if (!nextRow && (0, range_1.isRangeAtRowEnd)(range, rowEl)) {
        return true;
    }
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
    // 如果光标在当前行的末尾并且有下一个兄弟节点
    if ((0, range_1.isRangeAtRowEnd)(range, rowEl) && nextRow) {
        // 如果下一个节点是空标签
        if ((0, _1.isEmptyElement)(nextRow)) {
            nextRow.remove();
            return true;
        }
        // 将下一个兄弟节点的内容复制到当前节点
        var fr_1 = (0, _1.createDocumentFragment)();
        nextRow.remove();
        nextRow.childNodes.forEach(function (node) {
            fr_1.appendChild(node.cloneNode(true));
        });
        rowEl.appendChild(fr_1);
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
        delEl.textContent = ((_f = delEl.textContent) === null || _f === void 0 ? void 0 : _f.slice(1)) || "";
        // 如果还有剩余内容，将光标移动到节点开头
        if (!(0, _1.isEmptyElement)(delEl)) {
            var textNode = delEl.lastChild;
            range.setStart(textNode ? textNode : delEl, 0);
            range.setEnd(textNode ? textNode : delEl, 0);
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
        range.setEnd(textNode ? textNode : nextNode, 0);
    }
    return true;
}
function onBackspace(range, _a) {
    var _b, _c, _d, _e, _f, _g;
    var rowEl = _a.rowEl, textEl = _a.textEl;
    var rangeNode = range.commonAncestorContainer;
    // 删除文本内容使用默认行为
    var isText = rangeNode.nodeName === "#text";
    var isEmpty = rangeNode.textContent === const_1.PLACEHOLDER_TEXT;
    if (isText && !isEmpty && range.startOffset > 0) {
        // 如果只有一个字符，则将节点内容设置为0宽占位符
        if (range.startOffset === 1) {
            rangeNode.textContent = const_1.PLACEHOLDER_TEXT;
            return true;
        }
        // 否则删除光标位置之后的第一个文本内容
        var index = range.startOffset;
        // 找到要删除的内容
        var text = (_b = rangeNode.textContent) === null || _b === void 0 ? void 0 : _b[index - 1];
        var text1 = ((_c = rangeNode.textContent) === null || _c === void 0 ? void 0 : _c.slice(0, text === const_1.PLACEHOLDER_TEXT ? index - 2 : index - 1)) || "";
        var text2 = ((_d = rangeNode.textContent) === null || _d === void 0 ? void 0 : _d.slice(text === const_1.PLACEHOLDER_TEXT ? index - 1 : index)) || "";
        rangeNode.textContent = text1 + text2;
        range.setStart(rangeNode, index - 1);
        range.setEnd(rangeNode, index - 1);
        return true;
    }
    // 获取当前光标所在P标签的上一个兄弟节点
    var upRow = rowEl.previousElementSibling;
    // 如果没有上级兄弟，并且光标在当前行开头，不执行操作
    if (!upRow && (0, range_1.isRangeAtRowStart)(range, rowEl)) {
        return true;
    }
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
    // 如果光标在当前行开头，并且有上一个兄弟节点
    if ((0, range_1.isRangeAtRowStart)(range, rowEl) && upRow) {
        // 如果上一个标签是空节点，直接删除上一个标签
        if ((0, _1.isEmptyElement)(upRow)) {
            upRow.remove();
            return true;
        }
        // 将当前行中的所有内容转入到上一行
        var fr_2 = (0, _1.createDocumentFragment)();
        rowEl.remove();
        // 将当前行中的所有内容复制到文档片段中
        rowEl.childNodes.forEach(function (node) {
            fr_2.appendChild(node.cloneNode(true));
        });
        // 将光标移动到上一个P标签的末尾
        (0, range_1.moveRangeAtRowEnd)(range, upRow);
        // 将当前P标签的内容添加到上一个P标签中
        upRow.appendChild(fr_2);
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
        delEl.textContent = ((_e = delEl.textContent) === null || _e === void 0 ? void 0 : _e.slice(0, -1)) || "";
        // 如果还有内容，将光标移动到文本末尾
        if (!(0, _1.isEmptyElement)(delEl)) {
            var textNode = delEl.lastChild;
            var textLength = ((_f = delEl.textContent) === null || _f === void 0 ? void 0 : _f.length) || 0;
            range.setStart(textNode ? textNode : delEl, textNode ? textLength : delEl.childNodes.length);
            range.setEnd(textNode ? textNode : delEl, textNode ? textLength : delEl.childNodes.length);
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
        var index = (0, _1.isEmptyElement)(upNode) ? 0 : ((_g = nextChild.textContent) === null || _g === void 0 ? void 0 : _g.length) || 0;
        range.setStart(nextChild, index);
        range.setEnd(nextChild, index);
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
            var fr_3 = (0, _1.createDocumentFragment)();
            endP.remove();
            endP.childNodes.forEach(function (node) {
                fr_3.appendChild(node.cloneNode(true));
            });
            startP.appendChild(fr_3);
        }
        // 修正光标位置
        range.setStart(startContainer, startOffset);
        range.setEnd(startContainer, startOffset);
        return true;
    }
    // 获取当前光标所在的P标签
    var els = (0, range_1.rangeEls)(range);
    if (!els)
        return true;
    if (e.code === "Backspace") {
        return onBackspace(range, els);
    }
    if (e.code === "Delete") {
        return onDelete(range, els);
    }
    return false;
}
