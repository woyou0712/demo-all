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
var index_1 = require("./utils/index");
var range_1 = require("./utils/range");
var wordWrap_1 = __importDefault(require("./utils/wordWrap"));
var wordDelete_1 = __importDefault(require("./utils/wordDelete"));
var Mention = /** @class */ (function () {
    function Mention(el, option) {
        if (option === void 0) { option = {}; }
        this._editorBody = (0, index_1.createElement)("section", { className: "hi-mention-body" });
        this._editorEl = (0, index_1.createElement)("div", { className: const_1.EDITOR_CLASS });
        this._placeholderEl = (0, index_1.createElement)("div", { className: "hi-mention-placeholder" });
        this._events = {
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
        (0, index_1.fixEditorContent)(editor);
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
            var range = (0, range_1.getRangeAt)();
            // 没有选中内容，并且光标不在_editorEl内
            if ((range === null || range === void 0 ? void 0 : range.collapsed) && range.commonAncestorContainer.nodeName !== "#text") {
                e.preventDefault();
                this.focus();
            }
        }
    };
    Mention.prototype._onblur = function (e) {
        var _this = this;
        this._events["blurs"].forEach(function (fn) { return fn(e); });
        clearTimeout(this.blurtimeout);
        this.blurtimeout = setTimeout(function () {
            _this.closeUserSelector();
        }, 200);
    };
    Mention.prototype._onfocus = function (e) {
        this._events["focuses"].forEach(function (fn) { return fn(e); });
    };
    Mention.prototype._onkeydown = function (e) {
        var bool = this.onWordWrap(e);
        if (bool) {
            e.preventDefault();
            this._inputEvent();
            this._onchange(); // 不触发默认行为，需要手动触发change事件
            return;
        }
        bool = this.onWordDelete(e);
        if (bool) {
            e.preventDefault();
            this._inputEvent();
            this._onchange(); // 不触发默认行为，需要手动触发change事件
            return;
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
        var range = (0, range_1.getRangeAt)();
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
        var reg = new RegExp("^".concat(const_1.PLACEHOLDER_TEXT, "*$"));
        if (!text || /^\n*$/.test(text) || reg.test(text)) {
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
        if ((0, index_1.fixEditorContent)(this._editorEl)) {
            this.focus();
        }
        var selection = (0, range_1.getSelection)();
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
        var range = (0, range_1.getRangeAt)(0, selection);
        if (!range)
            return;
        this._inputRange = range;
        if (((_b = this._inputRange.endContainer) === null || _b === void 0 ? void 0 : _b.nodeName) !== "#text")
            return this.closeUserSelector();
        var query = (_c = t[0]) === null || _c === void 0 ? void 0 : _c.slice(1);
        this._queryStr = query;
        this.openUserSelector(query);
    };
    Mention.prototype._isCursorInEditor = function () {
        var range = (0, range_1.getRangeAt)();
        if (!(range === null || range === void 0 ? void 0 : range.commonAncestorContainer))
            return false;
        return (range === null || range === void 0 ? void 0 : range.commonAncestorContainer) === this._editorEl || this._editorEl.contains(range.commonAncestorContainer);
    };
    Mention.prototype.wordDelete = function (e) {
        return (0, wordDelete_1.default)(e, this._editorEl);
    };
    Mention.prototype.onWordDelete = function (e) {
        if (["Backspace", "Delete"].includes(e.code)) {
            return this.wordDelete(e);
        }
        return false;
    };
    Mention.prototype.wordWrap = function () {
        return (0, wordWrap_1.default)();
    };
    Mention.prototype.onWordWrap = function (e) {
        if (["Enter", "NumpadEnter"].includes(e.code)) {
            this.wordWrap();
            return true;
        }
        return false;
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
        var _a, _b;
        if (!this._inputRange)
            return this;
        var _c = this.options, nameKey = _c.nameKey, idKey = _c.idKey;
        // 创建一个span元素来表示用户
        var span = (0, index_1.createElement)("span", {
            className: "hi-mention-at-user",
            content: "@".concat(user[nameKey]),
            style: {
                color: this.options.mentionColor,
                cursor: "pointer",
            },
        });
        span.setAttribute("data-user-id", user[idKey]);
        var range = this._inputRange;
        // 将光标重新设置到输入框中
        range.collapse(false);
        (_a = this._inputSelection) === null || _a === void 0 ? void 0 : _a.removeAllRanges();
        (_b = this._inputSelection) === null || _b === void 0 ? void 0 : _b.addRange(range);
        // 设置光标选中@符号之后的内容
        range.setStart(range.endContainer, range.endOffset - (this._queryStr.length + 1));
        range.setEnd(range.endContainer, range.endOffset);
        // 删除选中的内容
        range.deleteContents();
        // 插入span元素
        (0, index_1.insertElement)(span, range);
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
        this._editorEl.innerHTML = "";
        (0, index_1.fixEditorContent)(this._editorEl);
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
        var selection = (0, range_1.getSelection)();
        var range = (0, range_1.getRangeAt)(0, selection);
        if (!range)
            return this;
        (0, index_1.insertText)(text, range);
        this._onchange();
        range.collapse(false);
        selection === null || selection === void 0 ? void 0 : selection.removeAllRanges();
        selection === null || selection === void 0 ? void 0 : selection.addRange(range);
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
        var selection = (0, range_1.getSelection)();
        var range = (0, range_1.getRangeAt)(0, selection);
        if (!range)
            return this;
        (0, index_1.insertElement)(html, range);
        this._onchange();
        range.collapse(false);
        selection === null || selection === void 0 ? void 0 : selection.removeAllRanges();
        selection === null || selection === void 0 ? void 0 : selection.addRange(range);
        return this;
    };
    /**
     * 获取焦点
     * @returns 返回当前实例
     */
    Mention.prototype.focus = function () {
        // 获取焦点
        var selection = (0, range_1.getSelection)();
        if (!selection)
            return this;
        var range = document.createRange();
        range.selectNodeContents(this._editorEl);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
        (0, range_1.moveRangeAtEditorEnd)(range, this._editorEl);
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
        this.userSelector.element.onmousedown = function () { return setTimeout(function () { return clearTimeout(_this.blurtimeout); }, 100); };
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