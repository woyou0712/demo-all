import { createElement } from "./utils";

export default class UserList {
  element = createElement("div", { className: "hi-mention-user-list" });


  private _idKey = "id";
  private _nameKey = "name";
  private _avatarKey = "avatar";
  private _pingyinKey = "pingyin";

  private _users: UserInfo[] = [];
  get users() { return this._users }

  private _viewUsers: ViewUser[] = [];

  private onselecteds: ((user: UserInfo) => void)[] = [];

  constructor({ }: { users: UserInfo[], idKey: string, nameKey: string, avatarKey: string }) {
    // TODO:
  }

  /**
 * 创建用户选项元素
 * @param user 用户信息
 * @returns 用户列表中的选项元素
 */
  protected createUserItem(user: UserInfo): HTMLElement {
    if (user.element) return user.element;
    const element = createElement("div", { className: "hi-mention-user-item" });
    const [name = "", avatar = ""] = [user[this._nameKey], user[this._avatarKey]];
    const left = createElement("div", { className: "hi-mention-user-item-left" });
    if (avatar) {
      const img = createElement("img");
      img.src = avatar;
      left.appendChild(img);
    }
    const right = createElement("div", { className: "hi-mention-user-item-right" });
    right.innerText = name;
    element.appendChild(left);
    element.appendChild(right);
    return element;
  }

  /**
   * 更新用户列表
   * @param list 用户列表
   * @returns 返回当前实例
   */
  updateUsers(list: UserInfo[]): this {
    this._users = list;
    this._viewUsers = list.map((user) => {
      let element = user.element;
      if (!element) {
        element = this.createUserItem(user);
      }
      element.addEventListener("click", () => {
        this.onselecteds.forEach(fn => fn(user))
      });
      return { ...user, element };
    });
    return this;
  }


  open() {
    this.element.style.opacity = "1";
    this.element.style.pointerEvents = "auto";
  }

  close() {
    this.element.style.opacity = "0";
    this.element.style.pointerEvents = "none";
  }

  onSelectUser(fn: (user: UserInfo) => void) {
    this.onselecteds.push(fn);
  }
}