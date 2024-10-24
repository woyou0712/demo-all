"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var const_1 = require("./const");
var UserSelector_1 = __importDefault(require("./UserSelector"));
var utils_1 = require("./utils");
var Mention = /** @class */ (function () {
    function Mention(el, option) {
        if (option === void 0) { option = {}; }
        this._editorBody = (0, utils_1.createElement)("section", { className: "hi-mention-body" });
        this._editorEl = (0, utils_1.createElement)("div", { className: const_1.EDITOR_CLASS });
        this._placeholderEl = (0, utils_1.createElement)("div", { className: "hi-mention-placeholder" });
        this._events = {
            clicks: [],
            blurs: [],
            focuses: [],
            changes: [],
            inputs: [],
            keydowns: [],
            keyups: [],
            "mention-users": [],
        };
        this.options = (0, const_1.defaultMentionOptions)();
        this._queryStr = "";
        if (!el) {
            throw new Error("Mention: no element provided");
        }
        if (typeof el === "string") {
            var e = document.querySelector(el);
            if (!e) {
                throw new Error("Mention: no element provided");
            }
            this._rootEl = e;
        }
        else {
            this._rootEl = el;
        }
        this.options = Object.assign(this.options, option);
        this._initElement();
        this._initEvent();
        this.initUserSelector();
    }
    Mention.prototype._initElement = function () {
        this._rootEl.style.position = "relative";
        var body = this._editorBody;
        var editor = this._editorEl;
        editor.setAttribute("contenteditable", "true");
        editor.innerHTML = const_1.EMPTY_INPUT_CONTENT;
        var placeholderEl = this._placeholderEl;
        placeholderEl.innerText = this.options.placeholder;
        placeholderEl.style.color = this.options.placeholderColor;
        body.appendChild(editor);
        body.appendChild(placeholderEl);
        this._rootEl.appendChild(body);
    };
    Mention.prototype._initEvent = function () {
        var _this = this;
        this._editorEl.onclick = function (e) { return _this._onclick(e); };
        this._editorEl.onblur = function (e) { return _this._onblur(e); };
        this._editorEl.onfocus = function (e) { return _this._onfocus(e); };
        this._editorEl.onkeydown = function (e) { return _this._onkeydown(e); };
        this._editorEl.onkeyup = function (e) { return _this._onkeyup(e); };
        this._editorEl.oninput = function (e) { return _this._oninput(e); };
        this._editorEl.oncut = function (e) { return _this._oncut(e); };
        this._editorEl.onpaste = function (e) { return _this._onpaste(e); };
    };
    Mention.prototype._onclick = function (e) {
        if (e.target === this._editorEl) {
            e.preventDefault();
            this._editorEl.focus();
        }
        this._events["clicks"].forEach(function (fn) { return fn(e); });
    };
    Mention.prototype._onblur = function (e) {
        var _this = this;
        this._events["blurs"].forEach(function (fn) { return fn(e); });
        clearTimeout(this._blurtimeout);
        this._blurtimeout = setTimeout(function () {
            _this.closeUserSelector();
        }, 200);
    };
    Mention.prototype._onfocus = function (e) {
        this._events["focuses"].forEach(function (fn) { return fn(e); });
    };
    Mention.prototype._onkeydown = function (e) {
        if (["Enter", "NumpadEnter"].includes(e.code)) {
            e.preventDefault();
            this._wordWrap();
            this._onchange(); // 不触发默认行为，需要手动触发change事件
            this._inputEvent();
        }
        else if (["Backspace", "Delete"].includes(e.code)) {
            var bool = this._wordDelete(e);
            if (bool) {
                e.preventDefault();
                this._onchange(); // 不触发默认行为，需要手动触发change事件
                this._inputEvent();
            }
        }
        this._events["keydowns"].forEach(function (fn) { return fn(e); });
    };
    Mention.prototype._onkeyup = function (e) {
        this._events["keyups"].forEach(function (fn) { return fn(e); });
    };
    Mention.prototype._oninput = function (e) {
        this._events["inputs"].forEach(function (fn) { return fn(e); });
        this._onchange();
        this._inputEvent();
    };
    Mention.prototype._oncut = function (e) {
        this._inputEvent();
        this._onchange();
    };
    Mention.prototype._onpaste = function (e) {
        var _a;
        e.preventDefault();
        var text = (_a = e.clipboardData) === null || _a === void 0 ? void 0 : _a.getData("text/plain");
        if (!text)
            return;
        var selection = (0, utils_1.getSelection)();
        if (!selection)
            return;
        var range = (0, utils_1.getRangeAt)(selection);
        if (!range)
            return;
        range.deleteContents();
        range.insertNode(document.createTextNode(text));
        // 修正光标位置
        range.setStart(range.endContainer, range.endOffset);
        range.setEnd(range.endContainer, range.endOffset);
        this._inputEvent();
        this._onchange();
    };
    Mention.prototype._onchange = function () {
        var _this = this;
        var text = this._editorEl.innerText;
        if (!text || /^\n*$/.test(text)) {
            this._placeholderEl.style.display = "block";
        }
        else {
            this._placeholderEl.style.display = "none";
        }
        clearTimeout(this._changetimeout);
        this._changetimeout = setTimeout(function () {
            _this._events["changes"].forEach(function (fn) { return fn({ text: _this._editorEl.innerText, html: _this._editorEl.innerHTML }); });
        }, 300);
    };
    Mention.prototype._inputEvent = function () {
        var _a, _b, _c;
        if ((0, utils_1.isEmptyElement)(this._editorEl)) {
            this._editorEl.innerHTML = const_1.EMPTY_INPUT_CONTENT;
        }
        var selection = (0, utils_1.getSelection)();
        if (!((_a = selection === null || selection === void 0 ? void 0 : selection.anchorNode) === null || _a === void 0 ? void 0 : _a.textContent))
            return this.closeUserSelector();
        var text = selection.anchorNode.textContent.slice(0, selection.anchorOffset);
        var trigger = this.options.trigger;
        var reg = new RegExp("\\".concat(trigger, "[^\\s\\").concat(trigger, "]*$"));
        if (!reg.test(text))
            return this.closeUserSelector();
        var t = reg.exec(text);
        if (!t)
            return this.closeUserSelector();
        this._inputSelection = selection;
        var range = (0, utils_1.getRangeAt)(selection);
        if (!range)
            return;
        this._inputRange = range;
        if (((_b = this._inputRange.endContainer) === null || _b === void 0 ? void 0 : _b.nodeName) !== "#text")
            return this.closeUserSelector();
        var query = (_c = t[0]) === null || _c === void 0 ? void 0 : _c.slice(1);
        this._queryStr = query;
        this.openUserSelector(query);
    };
    /**
     * 内容换行
     */
    Mention.prototype._wordWrap = function () {
        // 获取当前光标位置f
        var selection = (0, utils_1.getSelection)();
        var range = selection === null || selection === void 0 ? void 0 : selection.getRangeAt(0);
        if (!range)
            return;
        // 判断是否有选中内容
        var bool = range.startOffset !== range.endOffset || range.startContainer !== range.endContainer;
        if (bool) {
            // 删除选中的内容
            range.deleteContents();
            // 获取开始位置所在的P标签
            var currentP_1 = (0, utils_1.getCurrentP)(range, "start");
            // 获取结束位置所在P标签
            var nextP = (0, utils_1.getCurrentP)(range, "end");
            if (!currentP_1 || !nextP)
                return;
            // 如果开始位置和结束位置不在同一个P标签中
            if (currentP_1 !== nextP) {
                // 将光标移动到结束P标签的开头
                (0, utils_1.moveCursorToStart)(range, nextP);
                return;
            }
        }
        // 获取当前所在的p标签
        var currentP = (0, utils_1.getCurrentP)(range);
        if (!currentP)
            return;
        // 创建一个换行的P标签
        var p = (0, utils_1.createElement)("p", { className: const_1.P_TAG_CLASS });
        // 如果光标所在标签为编辑器根标签，则直接在编辑器标签中插入换行
        if (!currentP) {
            p.innerHTML = "<br/>";
            // 在光标位置插入新创建的p标签
            range.insertNode(p);
            // 将光标设置到新创建的p标签中
            (0, utils_1.moveCursorToStart)(range, p);
            return;
        }
        // 如果光标在当前行末尾
        if ((0, utils_1.isCursorAtEnd)(range, currentP)) {
            p.innerHTML = "<br/>";
            // 将p标签插入到当前P标签之后
            currentP === null || currentP === void 0 ? void 0 : currentP.insertAdjacentElement("afterend", p);
            // 将光标设置到新创建的p标签中
            (0, utils_1.moveCursorToStart)(range, p);
            return;
        }
        // 将光标设置到当前所在P标签中并选中光标之前的内容
        range.setStart(currentP, 0);
        range.setEnd(range.endContainer, range.endOffset);
        // // 获取光标选中的内容
        var selectedContent = range.extractContents();
        // // 将内容插入到新创建的p标签中
        p.appendChild(selectedContent);
        if (!p.innerText) {
            p.innerHTML = "<br/>";
        }
        if (!currentP.innerText) {
            currentP.innerHTML = "<br/>";
        }
        // 插入创建的p标签在原P标签之前
        currentP === null || currentP === void 0 ? void 0 : currentP.insertAdjacentElement("beforebegin", p);
        // 将光标移动到原P标签开头
        (0, utils_1.moveCursorToStart)(range, currentP);
    };
    /**
     * 删除键
     * @param range 当前光标位置
     * @param currentP 当前光标所在的P标签
     * @returns
     */
    Mention.prototype._onDelete = function (range, currentP) {
        var _a, _b, _c, _d, _e;
        // 如果光标所在为text节点，并且不在当前节点的末尾，则使用默认行为
        if (((_a = range.commonAncestorContainer) === null || _a === void 0 ? void 0 : _a.nodeName) === "#text" && range.endOffset < Number((_b = range.commonAncestorContainer.textContent) === null || _b === void 0 ? void 0 : _b.length)) {
            return false;
        }
        // 如果当前节点是个空标签，并且有后面还有兄弟节点
        if ((0, utils_1.isEmptyElement)(currentP) && currentP.nextElementSibling) {
            currentP.remove();
            return true;
        }
        // 如果光标在末尾，并且是最后一个P标签，不执行操作
        var isEnd = (0, utils_1.isCursorAtEnd)(range, currentP);
        // 如果光标在当前P标签的末尾，并且是最后一个P标签，不执行操作
        if (isEnd && !currentP.nextElementSibling) {
            return true;
        }
        // 如果光标在当前P标签的末尾，并且不是最后一个P标签，将下一个P标签的内容写入当前P标签中，并删除下一个P标签
        if (isEnd && currentP.nextElementSibling) {
            var nextP = currentP.nextElementSibling;
            // 如果下一个P标签为空标签，则直接删除
            if ((0, utils_1.isEmptyElement)(nextP)) {
                nextP.remove();
                return true;
            }
            // 选中下一个P标签的所有内容
            range.setStart(nextP, 0);
            range.setEnd(nextP, nextP.childNodes.length);
            // 获取选中内容
            var selectedContent_1 = range.extractContents();
            // 将光标移动到当前P标签的末尾
            (0, utils_1.moveCursorToEnd)(range, currentP);
            // 将下一个P标签的内容添加到当前P标签中
            currentP.appendChild(selectedContent_1);
            nextP.remove();
            return true;
        }
        // 记录光标开始位置
        var startContainer = range.startContainer;
        var startOffset = range.startOffset;
        // 选中当前P标签下光标开始之后的内容
        range.setStart(range.startContainer, range.startOffset);
        range.setEnd(currentP, currentP.childNodes.length);
        // 获取选中内容
        var selectedContent = range.extractContents();
        // 如果选中内容为空，则不执行操作
        if (!((_c = selectedContent === null || selectedContent === void 0 ? void 0 : selectedContent.childNodes) === null || _c === void 0 ? void 0 : _c.length)) {
            return true;
        }
        // 删除第一个有内容的子节点
        var count = 0; // 计算开头空的文本节点数量
        for (; count < selectedContent.childNodes.length;) {
            var node = selectedContent.childNodes[count];
            if (node.nodeName === "#text" && !node.textContent) {
                count++;
            }
            else {
                break;
            }
        }
        // 删除所有的空节点
        for (; count > 0; count--) {
            selectedContent.removeChild(selectedContent.childNodes[count - 1]);
        }
        // 再删除内容
        var firstNode = selectedContent.childNodes[0];
        if (firstNode) {
            // 如果是文本节点，删除文本节点第一个文本
            if (firstNode.nodeName === "#text" && firstNode.textContent) {
                firstNode.textContent = (_d = firstNode.textContent) === null || _d === void 0 ? void 0 : _d.substring(1);
            }
            else {
                selectedContent.removeChild(selectedContent.childNodes[0]);
            }
        }
        // 判断是否还有剩余内容
        var isContent = false;
        for (var i = 0; i < selectedContent.childNodes.length; i++) {
            var node = selectedContent.childNodes[i];
            if (node.nodeName !== "#text" || ((_e = node.textContent) === null || _e === void 0 ? void 0 : _e.length)) {
                isContent = true;
                break;
            }
        }
        // 如果没有内容，并且P标签中也没有剩余内容
        if (!isContent && (0, utils_1.isEmptyElement)(currentP)) {
            if (currentP.nextElementSibling) {
                var nextP = currentP.nextElementSibling;
                // 如果存在下一行则删除当前行
                currentP.remove();
                // 将光标移动到下一个P标签的开始位置
                (0, utils_1.moveCursorToStart)(range, nextP);
            }
            else if (currentP.innerText !== "\n") {
                // 如果不存在下一行 又没有换行符 添加一个换行符
                currentP.appendChild((0, utils_1.createElement)("br"));
            }
            return true;
        }
        // 将剩余内容添加到当前P标签中
        currentP.appendChild(isContent ? selectedContent : (0, utils_1.createElement)("br"));
        // 将光标移动到初始位置
        range.setStart(startContainer, startOffset);
        range.setEnd(startContainer, startOffset);
        return true;
    };
    /**
     * 退格键
     * @param range 当前光标位置
     * @param currentP 当前光标所在的P标签
     * @returns
     */
    Mention.prototype._onBackspace = function (range, currentP) {
        var _a, _b, _c, _d, _e;
        // 删除文本内容使用默认行为
        if (range.commonAncestorContainer.nodeName === "#text" && range.startOffset > 0) {
            return false;
        }
        // 如果光标在开头，并且是第一个P标签，不执行操作
        if ((0, utils_1.isCursorAtStart)(range, currentP) && !currentP.previousElementSibling) {
            return true;
        }
        // 获取当前光标所在P标签的上一个兄弟节点
        var previousP = currentP.previousElementSibling;
        // 如果当前节点是空标签
        if ((0, utils_1.isEmptyElement)(currentP)) {
            // 如果有上一个兄弟节点
            if (previousP) {
                currentP.remove();
                // 将光标移动到上一个P标签的末尾
                (0, utils_1.moveCursorToEnd)(range, previousP);
            }
            return true;
        }
        // 如果光标在当前行开头，并且有上一个兄弟节点
        if ((0, utils_1.isCursorAtStart)(range, currentP) && previousP) {
            // 选中当前p标签的所有内容
            range.setStart(currentP, 0);
            range.setEnd(currentP, currentP.childNodes.length);
            // 获取选中内容
            var selectedContent_2 = range.extractContents();
            var endIndex = previousP.childNodes.length;
            if ((0, utils_1.isEmptyElement)(previousP)) {
                endIndex = 0;
                previousP.innerHTML = "";
            }
            // 将光标移动到上一个P标签的末尾
            range.setStart(previousP, endIndex);
            range.setEnd(previousP, endIndex);
            // 将当前P标签的内容添加到上一个P标签中
            previousP.appendChild(selectedContent_2);
            currentP.remove();
            return true;
        }
        // 如果光标在当前行的末尾
        if ((0, utils_1.isCursorAtEnd)(range, currentP)) {
            // 获取当前标签的最后一个节点
            var lastIndex = currentP.childNodes.length - 1;
            var lastChild = currentP.childNodes[lastIndex];
            // 如果最后一个节点是文本节点
            if (lastChild.nodeName === "#text") {
                // 有内容，则使用默认行为
                if ((_a = lastChild.textContent) === null || _a === void 0 ? void 0 : _a.length)
                    return false;
                // 没有内容，则删除最后一个节点
                currentP.removeChild(lastChild);
                lastIndex--;
                // 继续向上查找，找到有内容的节点为止
                for (; lastIndex >= 0; lastIndex--) {
                    var node = currentP.childNodes[lastIndex];
                    if (node.nodeName === "#text" && !((_b = node.textContent) === null || _b === void 0 ? void 0 : _b.length)) {
                        currentP.removeChild(node);
                        continue;
                    }
                    lastChild = node;
                    break;
                }
            }
            currentP.removeChild(lastChild);
            if ((0, utils_1.isEmptyElement)(currentP)) {
                currentP.appendChild((0, utils_1.createElement)("br"));
            }
            return true;
        }
        // 选中光标之前的内容
        range.setStart(currentP, 0);
        range.setEnd(range.endContainer, range.endOffset);
        // 获取选中内容，不从文本中删除
        var selectedContent = range.extractContents();
        // 删除末尾的空标签
        while (selectedContent.lastChild && selectedContent.lastChild.nodeName === "#text" && !selectedContent.lastChild.textContent) {
            selectedContent.removeChild(selectedContent.lastChild);
        }
        // 如果已经没有内容了，不做操作
        if (!selectedContent.lastChild) {
            return true;
        }
        // 如果是文本节点,删除最后一个文字
        if (selectedContent.lastChild.nodeName === "#text" && ((_c = selectedContent.lastChild.textContent) === null || _c === void 0 ? void 0 : _c.length)) {
            selectedContent.lastChild.textContent = selectedContent.lastChild.textContent.slice(0, -1);
        }
        else {
            // 删除有内容的节点
            selectedContent.removeChild(selectedContent.lastChild);
        }
        var length = ((_d = selectedContent.childNodes) === null || _d === void 0 ? void 0 : _d.length) || 0;
        var isContent = false;
        for (var i = 0; i < length; i++) {
            var node = selectedContent.childNodes[i];
            if (node.nodeName !== "#text" || ((_e = node.textContent) === null || _e === void 0 ? void 0 : _e.length)) {
                isContent = true;
                break;
            }
        }
        if (!isContent && (0, utils_1.isEmptyElement)(currentP)) {
            if (currentP.previousElementSibling) {
                var previousP_1 = currentP.previousElementSibling;
                // 如果有前一个P标签，则删除当前标签
                currentP.remove();
                // 将光标移动到前一个P标签的末尾
                (0, utils_1.moveCursorToEnd)(range, previousP_1);
            }
            else if (currentP.innerText !== "\n") {
                // 没有前一个标签 又 没有换行符则添加换行符
                currentP.appendChild((0, utils_1.createElement)("br"));
            }
            return true;
        }
        if (!isContent) {
            return true;
        }
        range.insertNode(selectedContent);
        // 将光标移动到开始的位置
        range.setStart(currentP, length);
        range.setEnd(currentP, length);
        return true;
    };
    /**
     * 删除内容
     * @param e 键盘事件
     * @returns
     */
    Mention.prototype._wordDelete = function (e) {
        if ((0, utils_1.isEmptyElement)(this._editorEl)) {
            this._editorEl.innerHTML = const_1.EMPTY_INPUT_CONTENT;
            this.focus();
            return true;
        }
        var selection = (0, utils_1.getSelection)();
        if (!selection)
            return false;
        var range = selection.getRangeAt(0);
        if (!range)
            return false;
        // 如果开始光标和结束光标不一致，则删除选中内容
        if (range.startOffset !== range.endOffset || range.startContainer !== range.endContainer) {
            // 获取光标开始和结束的P标签
            var startP_1 = (0, utils_1.getCurrentP)(range, "start");
            var startContainer = range.startContainer;
            var startOffset = range.startOffset;
            var endP = (0, utils_1.getCurrentP)(range, "end");
            if (!startP_1 || !endP)
                return false;
            // 如果存在选中内容,删除选中内容
            range.deleteContents();
            // 如果开始和结束P标签不一致，将结束标签中的剩余内容移动到开始标签中，并删除开始到结束标签中的所有标签（包括结束标签）
            if (startP_1 !== endP) {
                endP.childNodes.forEach(function (node) {
                    startP_1.appendChild(node);
                });
                var startIndex = Array.from(this._editorEl.childNodes).indexOf(startP_1);
                var endIndex = Array.from(this._editorEl.childNodes).indexOf(endP);
                for (var i = endIndex; i > startIndex; i--) {
                    this._editorEl.removeChild(this._editorEl.childNodes[i]);
                }
            }
            // 修正光标位置
            range.setStart(startContainer, startOffset);
            range.setEnd(startContainer, startOffset);
            return true;
        }
        // 获取当前光标所在的P标签
        var currentP = (0, utils_1.getCurrentP)(range);
        if (!currentP) {
            this.focus(); // 恢复焦点
            return true;
        }
        if (e.code === "Backspace") {
            return this._onBackspace(range, currentP);
        }
        if (e.code === "Delete") {
            return this._onDelete(range, currentP);
        }
    };
    Mention.prototype._isCursorInEditor = function () {
        var selection = (0, utils_1.getSelection)();
        if (!(selection === null || selection === void 0 ? void 0 : selection.anchorNode))
            return false;
        var range = selection.getRangeAt(0);
        if (!range.commonAncestorContainer)
            return false;
        return range.commonAncestorContainer === this._editorEl || this._editorEl.contains(range.commonAncestorContainer);
    };
    /**
     * 创建用户选项元素
     * @param user 用户信息
     * @returns 用户列表中的选项元素
     */
    Mention.prototype.createUserElement = function (user) {
        if (user.element)
            return user.element;
        var element = (0, utils_1.createElement)("div", { className: "hi-mention-user-item" });
        var _a = this.options, nameKey = _a.nameKey, avatarKey = _a.avatarKey;
        var _b = [user[nameKey], user[avatarKey]], _c = _b[0], name = _c === void 0 ? "" : _c, _d = _b[1], avatar = _d === void 0 ? "" : _d;
        var left = (0, utils_1.createElement)("div", { className: "hi-mention-user-item-left" });
        if (avatar) {
            var img = (0, utils_1.createElement)("img");
            img.src = avatar;
            left.appendChild(img);
        }
        var right = (0, utils_1.createElement)("div", { className: "hi-mention-user-item-right" });
        right.innerText = name;
        element.appendChild(left);
        element.appendChild(right);
        return element;
    };
    Mention.prototype.setOptions = function (options) {
        this.options = __assign(__assign({}, this.options), options);
        var trigger = options.trigger, placeholder = options.placeholder, placeholderColor = options.placeholderColor, mentionColor = options.mentionColor, users = options.users, idKey = options.idKey, nameKey = options.nameKey, avatarKey = options.avatarKey, pingyinKey = options.pingyinKey, media = options.media, usersWdith = options.usersWdith, usersHeight = options.usersHeight;
        if (placeholder)
            this._placeholderEl.innerText = placeholder;
        if (placeholderColor)
            this._placeholderEl.style.color = placeholderColor;
        return this;
    };
    Mention.prototype.getOptions = function () {
        return __assign({}, this.options);
    };
    /**
     * 事件监听器
     * @param key 监听的事件名称
     * @param fn 事件回调函数
     * @returns 返回当前实例
     */
    Mention.prototype.on = function (key, fn) {
        switch (key) {
            case "blur":
                this._events["blurs"].push(fn);
                break;
            case "change":
                this._events["changes"].push(fn);
                break;
            case "focus":
                this._events["focuses"].push(fn);
                break;
            case "mention-user":
                this._events["mention-users"].push(fn);
                break;
            case "input":
                this._events["inputs"].push(fn);
                break;
            case "keydown":
                this._events["keydowns"].push(fn);
                break;
            case "keyup":
                this._events["keyups"].push(fn);
                break;
        }
        return this;
    };
    /**
     * 提及用户
     * @param user 用户信息
     * @returns
     */
    Mention.prototype.mentionUser = function (user) {
        if (!this._inputRange)
            return this;
        var _a = this.options, nameKey = _a.nameKey, idKey = _a.idKey;
        // 创建一个span元素来表示用户
        var span = (0, utils_1.createElement)("span", {
            className: "hi-mention-at-user",
            content: "@".concat(user[nameKey]),
            style: {
                color: this.options.mentionColor,
                cursor: "pointer",
            },
        });
        span.setAttribute("data-user-id", user[idKey]);
        span.setAttribute("contenteditable", "false");
        var range = this._inputRange;
        // 设置光标选中@符号之后的内容
        range.setStart(range.endContainer, range.endOffset - (this._queryStr.length + 1));
        range.setEnd(range.endContainer, range.endOffset);
        // 删除选中的内容
        range.deleteContents();
        // 如果输入框没有内容，则直接完整替换内容
        if ((0, utils_1.isEmptyElement)(this._editorEl)) {
            var div = (0, utils_1.createElement)("div");
            var p = (0, utils_1.createElement)("p", { className: const_1.P_TAG_CLASS });
            p.appendChild(span);
            div.appendChild(p);
            this._editorEl.innerHTML = div.innerHTML;
            this.focus(); // 将光标移动到末尾
        }
        else {
            // 否则将span元素插入到光标位置
            range.insertNode(span);
            var selection = this._inputSelection;
            if (selection) {
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }
        this._events["mention-users"].forEach(function (fn) { return fn(user); });
        this._onchange();
        this.closeUserSelector();
        return this;
    };
    /**
     * 清空输入框内容
     * @returns 返回当前实例
     */
    Mention.prototype.clear = function () {
        this._editorEl.innerHTML = const_1.EMPTY_INPUT_CONTENT;
        this._onchange();
        this.focus();
        return this;
    };
    /**
     * 在当前位置插入文本内容
     * @param text 文本内容
     * @returns 返回当前实例
     */
    Mention.prototype.insertText = function (text) {
        if (!this._isCursorInEditor())
            return this;
        var selection = (0, utils_1.getSelection)();
        if (!selection)
            return this;
        var range = selection.getRangeAt(0);
        range.insertNode((0, utils_1.createTextNode)(text));
        this._onchange();
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
        return this;
    };
    /**
     * 在当前位置插入html内容
     * @param html html内容
     * @returns 返回当前实例
     */
    Mention.prototype.insertHtml = function (html) {
        if (!this._isCursorInEditor())
            return this;
        var selection = (0, utils_1.getSelection)();
        if (!selection)
            return this;
        var range = selection.getRangeAt(0);
        html.setAttribute("contenteditable", "false");
        range.insertNode(html);
        this._onchange();
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
        return this;
    };
    /**
     * 获取焦点
     * @returns 返回当前实例
     */
    Mention.prototype.focus = function () {
        // 获取焦点
        var selection = (0, utils_1.getSelection)();
        if (!selection)
            return this;
        var range = document.createRange();
        range.selectNodeContents(this._editorEl);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
        // 找到最后一行P标签
        var lastP = this._editorEl.lastElementChild;
        if (!lastP) {
            lastP = (0, utils_1.createElement)("p", { className: const_1.P_TAG_CLASS, content: "<br/>" });
            this._editorEl.appendChild(lastP);
        }
        (0, utils_1.moveCursorToEnd)(range, lastP);
        return this;
    };
    /**
     * 获取输入框内容
     * @returns 输入框内容
     */
    Mention.prototype.getData = function () {
        return {
            text: this._editorEl.innerText,
            html: this._editorEl.innerHTML,
        };
    };
    /**
     * 获取@提及的用户列表
     * @returns 用户列表
     */
    Mention.prototype.getMentions = function () {
        var nodes = this._editorEl.querySelectorAll(".hi-mention-at-user");
        var _a = this.options, users = _a.users, idKey = _a.idKey;
        return Array.from(nodes)
            .map(function (node) {
            var id = node.getAttribute("data-user-id");
            return users.find(function (user) { return String(user[idKey]) === String(id); });
        })
            .filter(Boolean);
    };
    Mention.prototype.initUserSelector = function () {
        var _this = this;
        this.userSelector = new UserSelector_1.default(this._rootEl, this.options);
        // 监听鼠标在用户列表中按下事件，防止鼠标点击用户列表时，触发编辑器失去焦点事件
        this.userSelector.element.onmousedown = function () { return setTimeout(function () { return clearTimeout(_this._blurtimeout); }, 100); };
        this.userSelector.onSelectUser(function (user) {
            _this.mentionUser(user);
        });
    };
    Mention.prototype.closeUserSelector = function () {
        var _a;
        (_a = this.userSelector) === null || _a === void 0 ? void 0 : _a.close();
    };
    /**
   * 打开用户选择器
   * @param query 查询字符串
   * @returns
   */
    Mention.prototype.openUserSelector = function (query) {
        var _a;
        (_a = this.userSelector) === null || _a === void 0 ? void 0 : _a.open(query);
    };
    return Mention;
}());
exports.default = Mention;
