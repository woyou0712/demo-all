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
Object.defineProperty(exports, "__esModule", { value: true });
var Mention = /** @class */ (function () {
    function Mention(el, option) {
        if (option === void 0) { option = {}; }
        this._editorBody = document.createElement("section");
        this._editorEl = document.createElement("div");
        this._userList = document.createElement("div");
        this._placeholderEl = document.createElement("div");
        this._events = {
            blurs: [],
            focuses: [],
            changes: [],
            inputs: [],
            keydowns: [],
            keyups: [],
            "mention-users": [],
        };
        this._idKey = "id";
        this._nameKey = "name";
        this._avatarKey = "avatar";
        this._pingyinKey = "pingyin";
        this._placeholder = "请输入";
        this._placeholderColor = "#aaa";
        this._trigger = "@";
        this._media = "PC";
        this._usersWdith = "200px";
        this._usersHeight = "200px";
        this._mentionColor = "#0080FF";
        this._mentionUsers = [];
        this._users = [];
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
        this._initOption(option);
        this._initElement();
        this._initEvent();
    }
    Mention.prototype._initOption = function (option) {
        var _a = option.users, users = _a === void 0 ? [] : _a, _b = option.placeholder, placeholder = _b === void 0 ? "请输入" : _b, _c = option.placeholderColor, placeholderColor = _c === void 0 ? "#aaa" : _c, _d = option.usersWdith, usersWdith = _d === void 0 ? "200px" : _d, _e = option.usersHeight, usersHeight = _e === void 0 ? "200px" : _e, _f = option.idKey, idKey = _f === void 0 ? "id" : _f, _g = option.nameKey, nameKey = _g === void 0 ? "name" : _g, _h = option.avatarKey, avatarKey = _h === void 0 ? "avatar" : _h, _j = option.pingyinKey, pingyinKey = _j === void 0 ? "pingyin" : _j, _k = option.trigger, trigger = _k === void 0 ? "@" : _k, _l = option.media, media = _l === void 0 ? "PC" : _l;
        this._placeholder = placeholder;
        this._placeholderColor = placeholderColor;
        this._usersWdith = usersWdith;
        this._usersHeight = usersHeight;
        this._idKey = idKey;
        this._nameKey = nameKey;
        this._avatarKey = avatarKey;
        this._pingyinKey = pingyinKey;
        this._trigger = trigger;
        this._media = media;
        this.updateUsers(users);
    };
    Mention.prototype._initElement = function () {
        this._rootEl.setAttribute("style", "--hi-mention-user-list-width:".concat(this._usersWdith, ";--hi-mention-user-list-height:").concat(this._usersHeight, ";"));
        var body = this._editorBody;
        body.classList.add("hi-mention-body");
        var editor = this._editorEl;
        editor.classList.add("hi-mention-editor");
        editor.setAttribute("contenteditable", "true");
        var placeholderEl = this._placeholderEl;
        placeholderEl.classList.add("hi-mention-placeholder");
        placeholderEl.innerText = this._placeholder;
        placeholderEl.style.color = this._placeholderColor;
        body.appendChild(editor);
        body.appendChild(placeholderEl);
        this._rootEl.appendChild(body);
        this.updateMedia(this._media);
    };
    Mention.prototype._initEvent = function () {
        var _this = this;
        this._editorEl.onblur = function (e) { return _this._onblur(e); };
        this._editorEl.onfocus = function (e) { return _this._onfocus(e); };
        this._editorEl.onkeydown = function (e) { return _this._onkeydown(e); };
        this._editorEl.onkeyup = function (e) { return _this._onkeyup(e); };
        this._editorEl.oninput = function (e) { return _this._oninput(e); };
        // 监听鼠标在用户列表中按下事件，防止鼠标点击用户列表时，触发编辑器失去焦点事件
        this._userList.onmousedown = function () { return setTimeout(function () { return clearTimeout(_this._blurtimeout); }, 100); };
    };
    Mention.prototype._getSelection = function () {
        return window.getSelection();
    };
    Mention.prototype._onblur = function (e) {
        var _this = this;
        this._events["blurs"].forEach(function (fn) { return fn(e); });
        clearTimeout(this._blurtimeout);
        this._blurtimeout = setTimeout(function () {
            _this._hideUserList();
        }, 200);
    };
    Mention.prototype._onfocus = function (e) {
        this._events["focuses"].forEach(function (fn) { return fn(e); });
    };
    Mention.prototype._onkeydown = function (e) {
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
    Mention.prototype._onchange = function () {
        var _this = this;
        var text = this._editorEl.innerText;
        if (text) {
            this._placeholderEl.style.display = "none";
        }
        else {
            this._placeholderEl.style.display = "block";
        }
        clearTimeout(this._changetimeout);
        this._changetimeout = setTimeout(function () {
            _this._events["changes"].forEach(function (fn) { return fn({ text: _this._editorEl.innerText, html: _this._editorEl.innerHTML }); });
        }, 300);
    };
    Mention.prototype._inputEvent = function () {
        var _a, _b, _c;
        var selection = this._getSelection();
        if (!((_a = selection === null || selection === void 0 ? void 0 : selection.anchorNode) === null || _a === void 0 ? void 0 : _a.textContent))
            return this._hideUserList();
        var text = selection.anchorNode.textContent.slice(0, selection.anchorOffset);
        var reg = new RegExp("\\".concat(this._trigger, "[^\\s\\").concat(this._trigger, "]*$"));
        if (!reg.test(text))
            return this._hideUserList();
        var t = reg.exec(text);
        if (!t)
            return this._hideUserList();
        this._inputSelection = selection;
        this._inputRange = selection.getRangeAt(0);
        if (((_b = this._inputRange.endContainer) === null || _b === void 0 ? void 0 : _b.nodeName) !== "#text")
            return this._hideUserList();
        var query = (_c = t[0]) === null || _c === void 0 ? void 0 : _c.slice(1);
        this._queryStr = query;
        this.openUserList(query);
    };
    Mention.prototype._hideUserList = function () {
        this._userList.style.display = "none";
    };
    Mention.prototype._getCursorPosition = function () {
        var selection = this._getSelection();
        if (!selection)
            return null;
        if (selection.rangeCount > 0) {
            var range = selection.getRangeAt(0);
            var rect = range.getBoundingClientRect();
            var _a = this._editorBody.getBoundingClientRect(), left = _a.left, top_1 = _a.top, right = _a.right, bottom = _a.bottom;
            // 根据光标在屏幕上的位置
            var positionY = window.innerHeight - bottom > top_1 ? "top" : "bottom";
            var positionX = right - rect.right > rect.left - left ? "left" : "right";
            // 返回坐标
            var l = rect.left - left;
            var t = rect.top - top_1;
            var r = right - rect.right;
            var b = bottom - rect.bottom;
            return { left: l, top: t + 22, bottom: b + 22, right: r, positionY: positionY, positionX: positionX };
        }
        return null;
    };
    Mention.prototype._getH5Position = function () {
        var selection = this._getSelection();
        if (!selection)
            return null;
        var _a = this._rootEl.getBoundingClientRect(), top = _a.top, bottom = _a.bottom;
        var positionY = window.innerHeight - bottom > top ? "top" : "bottom";
        return positionY;
    };
    Mention.prototype._isCursorInEditor = function () {
        var selection = this._getSelection();
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
        var element = document.createElement("div");
        element.classList.add("hi-mention-user-item");
        var _a = [user[this._nameKey], user[this._avatarKey]], _b = _a[0], name = _b === void 0 ? "" : _b, _c = _a[1], avatar = _c === void 0 ? "" : _c;
        var left = document.createElement("div");
        left.classList.add("hi-mention-user-item-left");
        if (avatar) {
            var img = document.createElement("img");
            img.src = avatar;
            left.appendChild(img);
        }
        var right = document.createElement("div");
        right.classList.add("hi-mention-user-item-right");
        right.innerText = name;
        element.appendChild(left);
        element.appendChild(right);
        return element;
    };
    /**
     * 打开用户列表
     * @param query 查询字符串
     * @returns
     */
    Mention.prototype.openUserList = function (query) {
        var _this = this;
        var userList = this._userList;
        userList.innerHTML = "";
        var box = document.createDocumentFragment();
        this._mentionUsers.forEach(function (user) {
            var _a = [user[_this._idKey], user[_this._nameKey], user[_this._avatarKey], user[_this._pingyinKey]], _b = _a[0], id = _b === void 0 ? 0 : _b, _c = _a[1], name = _c === void 0 ? "" : _c, _d = _a[2], pingyin = _d === void 0 ? "" : _d;
            var text = "".concat(id).concat(name).concat(pingyin);
            if (!query)
                box.appendChild(user.element);
            else if (text.includes(query))
                box.appendChild(user.element);
        });
        if (!box.hasChildNodes())
            return this._hideUserList();
        userList.appendChild(box);
        if (this._media === "H5") {
            var positionY = this._getH5Position();
            if (positionY) {
                userList.style[positionY] = "100%";
                if (positionY === "top") {
                    userList.style.bottom = "initial";
                }
                else {
                    userList.style.top = "initial";
                }
            }
        }
        else {
            var cursorPosition = this._getCursorPosition();
            if (cursorPosition) {
                userList.style[cursorPosition.positionY] = "".concat(cursorPosition[cursorPosition.positionY], "px");
                userList.style[cursorPosition.positionX] = "".concat(cursorPosition[cursorPosition.positionX], "px");
                if (cursorPosition.positionY === "bottom")
                    userList.style.top = "initial";
                if (cursorPosition.positionY === "top")
                    userList.style.bottom = "initial";
                if (cursorPosition.positionX === "right")
                    userList.style.left = "initial";
                if (cursorPosition.positionX === "left")
                    userList.style.right = "initial";
            }
        }
        this._userList.style.display = "block";
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
        // 创建一个span元素来表示用户
        var span = document.createElement("span");
        span.setAttribute("data-id", user[this._idKey]);
        span.setAttribute("contenteditable", "false");
        span.setAttribute("style", "color:".concat(this._mentionColor, "; cursor: pointer;"));
        span.classList.add("hi-mention-at-user");
        span.innerHTML = "&nbsp;@".concat(user[this._nameKey], "&nbsp;");
        // 设置光标选中范围
        this._inputRange.setStart(this._inputRange.endContainer, this._inputRange.endOffset - (this._queryStr.length + 1));
        this._inputRange.setEnd(this._inputRange.endContainer, this._inputRange.endOffset);
        // 删除选中范围的内容
        this._inputRange.deleteContents();
        // 将span元素插入到光标位置
        this._inputRange.insertNode(span);
        this._events["mention-users"].forEach(function (fn) { return fn(user); });
        this._onchange();
        this._hideUserList();
        var selection = this._inputSelection;
        if (!selection)
            return this;
        this._inputRange.collapse(false);
        selection.removeAllRanges();
        selection.addRange(this._inputRange);
        return this;
    };
    /**
     * 更新用户列表
     * @param list 用户列表
     * @returns 返回当前实例
     */
    Mention.prototype.updateUsers = function (list) {
        var _this = this;
        this._users = list;
        this._mentionUsers = list.map(function (user) {
            var element = user.element;
            if (!element) {
                element = _this.createUserElement(user);
            }
            element.addEventListener("click", function () {
                _this.mentionUser(user);
            });
            return __assign(__assign({}, user), { element: element });
        });
        return this;
    };
    /**
     * 跟新媒体类型
     * @param type 媒体类型
     * @returns 返回当前实例
     */
    Mention.prototype.updateMedia = function (type) {
        this._media = type;
        var users = this._userList;
        if (users.parentNode)
            users.parentNode.removeChild(users);
        if (this._media === "H5") {
            users.className = "hi-mention-user-list h5";
            users.style.left = "0";
            this._rootEl.appendChild(users);
            this._rootEl.style.position = "relative";
        }
        else {
            users.className = "hi-mention-user-list";
            this._editorBody.appendChild(users);
        }
        return this;
    };
    /**
     * 清空输入框内容
     * @returns 返回当前实例
     */
    Mention.prototype.clear = function () {
        this._editorEl.innerHTML = "";
        this._events["changes"].forEach(function (fn) { return fn({ text: "", html: "" }); });
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
        var selection = this._getSelection();
        if (!selection)
            return this;
        var range = selection.getRangeAt(0);
        range.insertNode(document.createTextNode(text));
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
        var selection = this._getSelection();
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
        // 将光标移动到编辑器末尾
        this._editorEl.focus();
        var range = document.createRange();
        range.selectNodeContents(this._editorEl);
        range.collapse(false);
        var selection = window.getSelection();
        if (selection) {
            selection.removeAllRanges();
            selection.addRange(range);
        }
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
        var _this = this;
        var nodes = this._editorEl.querySelectorAll(".hi-mention-at-user");
        return Array.from(nodes)
            .map(function (node) {
            var id = node.getAttribute("data-id");
            return _this._users.find(function (user) { return String(user[_this._idKey]) === String(id); });
        })
            .filter(Boolean);
    };
    return Mention;
}());
exports.default = Mention;
