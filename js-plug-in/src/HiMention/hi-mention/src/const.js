"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultMentionOptions = exports.defaultUserSelectorOptions = exports.NEW_LINE = exports.PLACEHOLDER_TEXT = exports.TEXT_TAG_CLASS = exports.ROW_TAG_CLASS = exports.EDITOR_CLASS = void 0;
// 编辑器类名
exports.EDITOR_CLASS = "hi-mention-editor";
// 行标签类名
exports.ROW_TAG_CLASS = "hi-mention-row";
// 文本标签类名
exports.TEXT_TAG_CLASS = "hi-mention-text";
// 占位符
exports.PLACEHOLDER_TEXT = "\uFEFF";
// 换行符
exports.NEW_LINE = "<br/>";
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
