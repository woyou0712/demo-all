import { MentionOptions, UserSelectorOptions } from "./types";

// 编辑器类名
export const EDITOR_CLASS = "hi-mention-editor";
// p标签类名
export const P_TAG_CLASS = "hi-mention-row";
// 空的输入框内容
export const EMPTY_INPUT_CONTENT = `<p class="${P_TAG_CLASS}"><br></p>`;


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

