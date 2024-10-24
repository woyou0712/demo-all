"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultMentionOptions = exports.defaultUserSelectorOptions = exports.EMPTY_INPUT_CONTENT = exports.P_TAG_CLASS = exports.EDITOR_CLASS = void 0;
// 编辑器类名
exports.EDITOR_CLASS = "hi-mention-editor";
// p标签类名
exports.P_TAG_CLASS = "hi-mention-row";
// 空的输入框内容
exports.EMPTY_INPUT_CONTENT = "<p class=\"".concat(exports.P_TAG_CLASS, "\"><br></p>");
var defaultUserSelectorOptions = function () { return ({
    users: [],
    idKey: "id",
    nameKey: "name",
    avatarKey: "avatar",
    pingyinKey: "pingyin",
    media: "PC",
    usersWdith: "200px",
    usersHeight: "200px",
}); };
exports.defaultUserSelectorOptions = defaultUserSelectorOptions;
var defaultMentionOptions = function () { return Object.assign({
    trigger: "@",
    placeholder: "请输入",
    placeholderColor: "#aaa",
    mentionColor: "#0090FF",
}, (0, exports.defaultUserSelectorOptions)()); };
exports.defaultMentionOptions = defaultMentionOptions;
