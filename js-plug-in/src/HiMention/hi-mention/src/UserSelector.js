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
var const_1 = require("./const");
var index_1 = require("./utils/index");
var range_1 = require("./utils/range");
var UserSelector = /** @class */ (function () {
    function UserSelector(el, options) {
        this.element = (0, index_1.createElement)("div", { className: "hi-mention-user-selector" });
        this._status = "close";
        this.options = (0, const_1.defaultUserSelectorOptions)();
        this._viewUsers = [];
        this.onselecteds = [];
        this._rootEl = el;
        this.setOptions(options);
        this._rootEl.appendChild(this.element);
    }
    Object.defineProperty(UserSelector.prototype, "status", {
        get: function () {
            return this._status;
        },
        set: function (status) {
            this._status = status;
            if (status === "open") {
                this.element.classList.add("open");
            }
            else {
                this.element.classList.remove("open");
            }
        },
        enumerable: false,
        configurable: true
    });
    UserSelector.prototype.initUsersEl = function () {
        var _this = this;
        this._viewUsers = this.options.users.map(function (user) {
            var element = user.element;
            if (!element) {
                element = _this.createUserItem(user);
            }
            element.addEventListener("click", function () {
                _this.onselecteds.forEach(function (fn) { return fn(user); });
            });
            return __assign(__assign({}, user), { element: element });
        });
    };
    /**
     * 创建用户选项元素
     * @param user 用户信息
     * @returns 用户列表中的选项元素
     */
    UserSelector.prototype.createUserItem = function (user) {
        if (user.element)
            return user.element;
        var element = (0, index_1.createElement)("div", { className: "hi-mention-user-item" });
        var _a = this.options, nameKey = _a.nameKey, avatarKey = _a.avatarKey;
        var _b = [user[nameKey], user[avatarKey]], _c = _b[0], name = _c === void 0 ? "" : _c, _d = _b[1], avatar = _d === void 0 ? "" : _d;
        var left = (0, index_1.createElement)("div", { className: "hi-mention-user-item-left" });
        if (avatar) {
            var img = (0, index_1.createElement)("img");
            img.src = avatar;
            left.appendChild(img);
        }
        var right = (0, index_1.createElement)("div", { className: "hi-mention-user-item-right" });
        right.innerText = name;
        element.appendChild(left);
        element.appendChild(right);
        return element;
    };
    UserSelector.prototype.getCursorPosition = function () {
        var selection = (0, range_1.getSelection)();
        if (!selection)
            return null;
        if (selection.rangeCount > 0) {
            var range = (0, range_1.getRangeAt)(0, selection);
            if (!range)
                return null;
            var rect = range.getBoundingClientRect();
            var _a = this._rootEl.getBoundingClientRect(), left = _a.left, top_1 = _a.top, right = _a.right, bottom = _a.bottom;
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
    UserSelector.prototype.getH5Position = function () {
        var _a = this._rootEl.getBoundingClientRect(), top = _a.top, bottom = _a.bottom;
        var positionY = window.innerHeight - bottom < top ? "bottom" : "top";
        return positionY;
    };
    /**
     * 根据查询字符串显示用户列表项
     * @param query
     * @returns
     */
    UserSelector.prototype.viewUserItems = function (query) {
        var element = this.element;
        element.innerHTML = "";
        var box = (0, index_1.createDocumentFragment)();
        var _a = this.options, idKey = _a.idKey, nameKey = _a.nameKey, avatarKey = _a.avatarKey, pingyinKey = _a.pingyinKey;
        this._viewUsers.forEach(function (user) {
            var _a = [user[idKey], user[nameKey], user[avatarKey], user[pingyinKey]], _b = _a[0], id = _b === void 0 ? 0 : _b, _c = _a[1], name = _c === void 0 ? "" : _c, _d = _a[2], pingyin = _d === void 0 ? "" : _d;
            var text = "".concat(id).concat(name).concat(pingyin);
            if (!query)
                box.appendChild(user.element);
            else if (text.includes(query))
                box.appendChild(user.element);
        });
        // 如果没有用户，则不显示
        if (!box.hasChildNodes()) {
            this.close();
            return false;
        }
        element.appendChild(box);
        return true;
    };
    /**
     * 设置用户选择器的位置
     */
    UserSelector.prototype.setPosition = function () {
        var element = this.element;
        if (this.options.media === "H5") {
            var positionY = this.getH5Position();
            if (positionY) {
                element.style[positionY] = "100%";
                if (positionY === "top") {
                    element.style.bottom = "initial";
                }
                else {
                    element.style.top = "initial";
                }
            }
        }
        else {
            var cursorPosition = this.getCursorPosition();
            if (cursorPosition) {
                element.style[cursorPosition.positionY] = "".concat(cursorPosition[cursorPosition.positionY], "px");
                element.style[cursorPosition.positionX] = "".concat(cursorPosition[cursorPosition.positionX], "px");
                if (cursorPosition.positionY === "bottom")
                    element.style.top = "initial";
                if (cursorPosition.positionY === "top")
                    element.style.bottom = "initial";
                if (cursorPosition.positionX === "right")
                    element.style.left = "initial";
                if (cursorPosition.positionX === "left")
                    element.style.right = "initial";
            }
        }
    };
    UserSelector.prototype.setOptions = function (options) {
        this.options = __assign(__assign({}, this.options), options);
        var users = options.users, idKey = options.idKey, nameKey = options.nameKey, avatarKey = options.avatarKey, pingyinKey = options.pingyinKey, media = options.media, usersWdith = options.usersWdith, usersHeight = options.usersHeight;
        if (users)
            this.initUsersEl();
        var element = this.element;
        if (media === "H5") {
            element.classList.add("h5");
            element.style.left = "0";
        }
        else if (media === "PC") {
            element.classList.remove("h5");
        }
        if (this.options.media === "PC") {
            element.style.width = usersWdith ? usersWdith : this.options.usersWdith;
        }
        else if (this.options.media === "H5") {
            element.style.width = "100%";
        }
        if (usersHeight)
            element.style.maxHeight = usersHeight;
        return this;
    };
    UserSelector.prototype.open = function (query) {
        var bool = this.viewUserItems(query);
        if (!bool)
            return;
        this.setPosition();
        if (this.status === "open")
            return;
        this.status = "open";
    };
    UserSelector.prototype.close = function () {
        if (this.status === "close")
            return;
        this.status = "close";
    };
    UserSelector.prototype.onSelectUser = function (fn) {
        this.onselecteds.push(fn);
    };
    return UserSelector;
}());
exports.default = UserSelector;
