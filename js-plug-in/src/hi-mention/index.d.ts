export interface UserInfo {
  id?: string | number;
  name?: string;
  avatar?: string;
  pingyin?: string;
  element?: HTMLElement;
  [key: string]: any;
}

export type MediaType = "H5" | "PC";

export interface MentionOption {
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

export interface MentionUser extends UserInfo {
  element: HTMLElement;
}

export interface EventsType {
  blur?: (e?: Event) => void;
  focus?: (e?: Event) => void;
  change?: (data?: { text: string; html: string }) => void;
  input?: (e?: Event) => void;
  keydown?: (e?: Event) => void;
  keyup?: (e?: Event) => void;
  "mention-user"?: (user?: UserInfo) => void;
}

class Mention {
  constructor(el: Element | HTMLElement | string, option: MentionOption = {}): void;

  /**
   * 创建用户选项元素
   * @param user 用户信息
   * @returns 用户列表中的选项元素
   */
  protected createUserElement(user: UserInfo): HTMLElement;

  /**
   * 打开用户列表
   * @param query 查询字符串
   * @returns
   */
  protected openUserList(query: string): void;

  /**
   * 事件监听器
   * @param key 监听的事件名称
   * @param fn 事件回调函数
   * @returns 返回当前实例
   */
  on<T extends keyof EventsType>(key: T, fn: EventsType[T]): this;

  /**
   * 提及用户
   * @param user 用户信息
   * @returns
   */
  mentionUser(user: UserInfo): this;

  /**
   * 更新用户列表
   * @param list 用户列表
   * @returns 返回当前实例
   */
  updateUsers(list: UserInfo[]): this;

  /**
   * 跟新媒体类型
   * @param type 媒体类型
   * @returns 返回当前实例
   */
  updateMedia(type: MediaType): this;

  /**
   * 清空输入框内容
   * @returns 返回当前实例
   */
  clear(): this;

  /**
   * 在当前位置插入文本内容
   * @param text 文本内容
   * @returns 返回当前实例
   */
  insertText(text: string): this;

  /**
   * 在当前位置插入html内容
   * @param html html内容
   * @returns 返回当前实例
   */
  insertHtml(html: Element): this;

  /**
   * 获取焦点
   * @returns 返回当前实例
   */
  focus(): this;
  /**
   * 获取输入框内容
   * @returns 输入框内容
   */
  getData(): { text: string; html: string };

  /**
   * 获取@提及的用户列表
   * @returns 用户列表
   */
  getMentions(): UserInfo[];
}

export default Mention;
