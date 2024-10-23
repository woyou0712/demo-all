interface UserInfo {
  id?: string | number;
  name?: string;
  avatar?: string;
  pingyin?: string;
  element?: HTMLElement;
  [key: string]: any;
}

type MediaType = "H5" | "PC";

interface MentionOption {
  idKey?: string; // id字段
  nameKey?: string; // 名称字段
  avatarKey?: string; // 头像字段
  pingyinKey?: string; // 拼音字段

  trigger?: string; // 触发字符
  media?: MediaType; // 媒体类型
  placeholder?: string;
  placeholderColor?: string;
  usersWdith?: string;
  usersHeight?: string;

  users?: UserInfo[];
}

interface MentionUser extends UserInfo {
  element: HTMLElement;
}

interface EventsType {
  click?: (e?: MouseEvent) => void;
  focus?: (e?: FocusEvent) => void;
  blur?: (e?: FocusEvent) => void;
  keydown?: (e?: KeyboardEvent) => void;
  keyup?: (e?: KeyboardEvent) => void;
  input?: (e?: Event) => void;
  change?: (data?: { text: string; html: string }) => void;
  "mention-user"?: (user?: UserInfo) => void;
}

interface OnEvents {
  clicks: ((e?: MouseEvent) => void)[];
  inputs: ((e?: Event) => void)[];
  focuses: ((e?: FocusEvent) => void)[];
  blurs: ((e?: FocusEvent) => void)[];
  keydowns: ((e?: KeyboardEvent) => void)[];
  keyups: ((e?: KeyboardEvent) => void)[];
  changes: ((data?: { text: string; html: string }) => void)[];
  "mention-users": ((user?: UserInfo) => void)[];
}