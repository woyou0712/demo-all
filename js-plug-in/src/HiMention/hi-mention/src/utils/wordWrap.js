"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = wordWrap;
var const_1 = require("../const");
var _1 = require(".");
var range_1 = require("./range");
function wordWrap() {
    var selection = (0, range_1.getSelection)();
    var range = (0, range_1.getRangeAt)(0, selection);
    if (!range)
        return;
    if (!range.collapsed) {
        // 删除选中的内容
        range.deleteContents();
        // 获取开始位置所在的P标签
        var sEls = (0, range_1.rangeEls)(range, "start");
        var eEls = (0, range_1.rangeEls)(range, "end");
        if (!(sEls === null || sEls === void 0 ? void 0 : sEls.rowEl) || !(eEls === null || eEls === void 0 ? void 0 : eEls.rowEl))
            return;
        // 修正开始行标签
        (0, _1.fixRowContent)(sEls.rowEl);
        // 如果开始位置和结束位置不在同一行
        if (sEls.rowEl !== eEls.rowEl) {
            // 修正结束行标签
            (0, _1.fixRowContent)(eEls.rowEl);
            // 将光标移动到结束P标签的开头
            (0, range_1.moveRangeAtRowStart)(range, eEls.rowEl);
            return;
        }
    }
    // 获取当前所在的标签
    var els = (0, range_1.rangeEls)(range);
    if (!els)
        return;
    // 如果光标在当前行末尾
    if ((0, range_1.isRangeAtRowEnd)(range, els.rowEl)) {
        // 在当前行后创建一个新行
        var newRow_1 = (0, _1.createRowTag)();
        els.rowEl.insertAdjacentElement("afterend", newRow_1);
        // 将光标设置到新创建的p标签中
        (0, range_1.moveRangeAtRowStart)(range, newRow_1);
        return;
    }
    // 选中当前行光标之前的内容
    // 获取当前行的第一个元素
    var firstChild = els.rowEl.firstChild;
    if ((firstChild === null || firstChild === void 0 ? void 0 : firstChild.className) === const_1.TEXT_TAG_CLASS) {
        firstChild = firstChild.firstChild;
    }
    range.setStart(firstChild ? firstChild : els.rowEl, 0);
    range.setEnd(range.endContainer, range.endOffset);
    // 获取光标选中的内容
    var selectedContent = range.extractContents();
    // 清除当前行开头的空标签
    var emptyEls = [];
    for (var i = 0; i < els.rowEl.childNodes.length; i++) {
        var child = els.rowEl.childNodes[i];
        if (!child.textContent) {
            emptyEls.push(child);
        }
        else {
            break;
        }
    }
    emptyEls.forEach(function (el) { var _a; return (_a = el.parentElement) === null || _a === void 0 ? void 0 : _a.removeChild(el); });
    // 将内容插入到新创建的行中
    var newRow = (0, _1.createElement)("p", { className: const_1.ROW_TAG_CLASS });
    var fr = (0, _1.createDocumentFragment)();
    selectedContent.childNodes.forEach(function (node) {
        if (node.nodeName === "#text") {
            if (!node.textContent)
                return;
            fr.appendChild((0, _1.createTextTag)(node.textContent));
        }
        else {
            fr.appendChild(node.cloneNode(true));
        }
    });
    newRow.appendChild(fr);
    // 修正新的行
    (0, _1.fixRowContent)(newRow);
    // 修正当前行
    (0, _1.fixRowContent)(els.rowEl);
    // 插入创建的p标签在原P标签之前
    els.rowEl.insertAdjacentElement("beforebegin", newRow);
    // 将光标移动到原P标签开头
    (0, range_1.moveRangeAtRowStart)(range, els.rowEl);
}
