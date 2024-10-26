"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = moveCursor;
var const_1 = require("../const");
var _1 = require(".");
var range_1 = require("./range");
function moveCursor(type) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    var range = (0, range_1.getRangeAt)();
    if (!range)
        return;
    var els = (0, range_1.rangeEls)(range);
    if (!els)
        return;
    (0, range_1.fixTextRange)(range, els.textEl);
    // 判断是否需要换行
    if (type === "ArrowLeft" && (0, range_1.isRangeAtRowStart)(range, els.rowEl)) {
        var newCol = els.rowEl.previousElementSibling;
        if (newCol)
            (0, range_1.moveRangeAtRowEnd)(range, newCol);
        return;
    }
    if (type === "ArrowRight" && (0, range_1.isRangeAtRowEnd)(range, els.rowEl)) {
        var newCol = els.rowEl.nextElementSibling;
        if (newCol)
            (0, range_1.moveRangeAtRowStart)(range, newCol);
        return;
    }
    if (type === "ArrowLeft") {
        // 如果当前是个空节点，则向前移动到一个有内容的节点
        if ((0, _1.isEmptyElement)(els.textEl) || range.startOffset === 0) {
            var preNode = els.textEl.previousElementSibling;
            while (preNode && (0, _1.isEmptyElement)(preNode)) {
                preNode = preNode.previousElementSibling;
            }
            while (preNode && preNode.className !== const_1.TEXT_TAG_CLASS) {
                preNode = preNode.previousElementSibling;
            }
            if (!preNode)
                return;
            var lastChild = preNode.lastChild;
            var index = lastChild ? Number((_a = lastChild.textContent) === null || _a === void 0 ? void 0 : _a.length) : preNode.childNodes.length;
            range.setStart(lastChild ? lastChild : preNode, index);
            range.collapse(true);
            return;
        }
        var upIndex = Math.max(0, range.startOffset - 1);
        var text = (_b = range.startContainer.textContent) === null || _b === void 0 ? void 0 : _b[upIndex];
        while (text === const_1.PLACEHOLDER_TEXT || text === "\n") {
            upIndex -= 1;
            text = (_c = range.startContainer.textContent) === null || _c === void 0 ? void 0 : _c[upIndex];
        }
        if (text === "\r") {
            var upText = (_d = range.startContainer.textContent) === null || _d === void 0 ? void 0 : _d[upIndex - 1];
            while (upText === "\r") {
                upIndex -= 1;
                upText = (_e = range.startContainer.textContent) === null || _e === void 0 ? void 0 : _e[upIndex - 1];
            }
        }
        range.setStart(range.startContainer, Math.max(0, upIndex));
        range.collapse(true);
        return;
    }
    if (type === "ArrowRight") {
        // 如果当前是个空节点，则向后移动到一个有内容的节点
        if ((0, _1.isEmptyElement)(els.textEl) || range.startOffset == Number((_f = range.startContainer.textContent) === null || _f === void 0 ? void 0 : _f.length)) {
            var nextNode = els.textEl.nextElementSibling;
            while (nextNode && (0, _1.isEmptyElement)(nextNode)) {
                nextNode = nextNode.nextElementSibling;
            }
            while (nextNode && nextNode.className !== const_1.TEXT_TAG_CLASS) {
                nextNode = nextNode.nextElementSibling;
            }
            if (!nextNode)
                return;
            var prev = nextNode.firstChild;
            range.setStart(prev ? prev : nextNode, 0);
            range.collapse(true);
            return;
        }
        var nextIndex = Math.min(((_g = range.startContainer.textContent) === null || _g === void 0 ? void 0 : _g.length) || 0, range.startOffset + 1);
        var text = (_h = range.startContainer.textContent) === null || _h === void 0 ? void 0 : _h[nextIndex];
        while (text === const_1.PLACEHOLDER_TEXT || text === "\n") {
            nextIndex += 1;
            text = (_j = range.startContainer.textContent) === null || _j === void 0 ? void 0 : _j[nextIndex];
        }
        if (text === "\r") {
            var nextText = (_k = range.startContainer.textContent) === null || _k === void 0 ? void 0 : _k[nextIndex + 1];
            while (nextText === "\r") {
                nextIndex += 1;
                nextText = (_l = range.startContainer.textContent) === null || _l === void 0 ? void 0 : _l[nextIndex + 1];
            }
        }
        nextIndex = Math.min(((_m = range.startContainer.textContent) === null || _m === void 0 ? void 0 : _m.length) || 0, nextIndex);
        range.setStart(range.startContainer, nextIndex);
        range.collapse(true);
        return;
    }
}
