import { MentionOptions, UserSelectorOptions } from "./types";

// 编辑器类名
export const EDITOR_CLASS = "hi-mention-editor";
// 行标签类名
export const ROW_TAG_CLASS = "hi-mention-row";
// 文本标签类名
export const TEXT_TAG_CLASS = "hi-mention-text";
// 占位符
export const PLACEHOLDER_TEXT = "\uFEFF";
// 换行符
export const NEW_LINE = "<br/>";


export const defaultUserSelectorOptions = (): UserSelectorOptions => ({
  users: [],
  idKey: "id",
  nameKey: "name",
  avatarKey: "avatar",
  pingyinKey: "pingyin",
  media: "PC",
  usersWdith: "200px",
  usersHeight: "200px",
});


export const defaultMentionOptions = (): MentionOptions => Object.assign({
  trigger: "@",
  placeholder: "请输入",
  placeholderColor: "#aaa",
  mentionColor: "#0090FF",
}, defaultUserSelectorOptions())

