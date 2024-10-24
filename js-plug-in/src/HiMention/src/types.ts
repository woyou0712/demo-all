export interface UserInfo {
  id?: string | number;
  name?: string;
  avatar?: string;
  pingyin?: string;
  element?: HTMLElement;
  [key: string]: any;
}

export type MediaType = "H5" | "PC";

export interface UserSelectorOptions {
  users: UserInfo[];
  idKey: string;
  nameKey: string;
  avatarKey: string;
  pingyinKey: string;
  media: MediaType;
  usersWdith: string;
  usersHeight: string;
}

export interface MentionOptions extends UserSelectorOptions {
  trigger: string;
  placeholder: string;
  placeholderColor: string;
  mentionColor: string;
}

export interface ViewUser extends UserInfo {
  element: HTMLElement;
}

export interface EventsType {
  click?: (e?: MouseEvent) => void;
  focus?: (e?: FocusEvent) => void;
  blur?: (e?: FocusEvent) => void;
  keydown?: (e?: KeyboardEvent) => void;
  keyup?: (e?: KeyboardEvent) => void;
  input?: (e?: Event) => void;
  change?: (data?: { text: string; html: string }) => void;
  "mention-user"?: (user?: UserInfo) => void;
}

export interface OnEvents {
  clicks: ((e?: MouseEvent) => void)[];
  inputs: ((e?: Event) => void)[];
  focuses: ((e?: FocusEvent) => void)[];
  blurs: ((e?: FocusEvent) => void)[];
  keydowns: ((e?: KeyboardEvent) => void)[];
  keyups: ((e?: KeyboardEvent) => void)[];
  changes: ((data?: { text: string; html: string }) => void)[];
  "mention-users": ((user?: UserInfo) => void)[];
}
