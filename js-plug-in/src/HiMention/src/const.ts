import { MentionOptions, UserSelectorOptions } from "./types";

// 浏览器类型
export const BROWSER = () => {
  const ua = navigator.userAgent.toLowerCase();
  return {
    isIE: ua.indexOf("msie") > -1 || ua.indexOf("trident") > -1,
    isEdge: ua.indexOf("edge") > -1,
    isFirefox: ua.indexOf("firefox") > -1,
    isChrome: ua.indexOf("chrome") > -1,
    isSafari: ua.indexOf("safari") > -1,
    isOpera: ua.indexOf("opr") > -1,
  };
};

// 编辑器类名
export const EDITOR_CLASS = "hi-mention-editor";
// 行标签类名
export const ROW_TAG_CLASS = "hi-mention-row";
// 文本标签类名
export const TEXT_TAG_CLASS = "hi-mention-text";
// 占位符
export const PLACEHOLDER_TEXT = "\uFEFF";
// 换行符
export const NEW_LINE = BROWSER().isFirefox ? "<br/>" : PLACEHOLDER_TEXT;

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

export const defaultMentionOptions = (): MentionOptions =>
  Object.assign(
    {
      trigger: "@",
      placeholder: "请输入",
      placeholderColor: "#aaa",
      mentionColor: "#0090FF",
    },
    defaultUserSelectorOptions()
  );
