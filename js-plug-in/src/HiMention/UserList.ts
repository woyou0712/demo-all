import { createElement } from "./utils";

export default class UserList {
  element = createElement("div", { className: "hi-mention-user-list" });


  private _idKey = "id";
  private _nameKey = "name";
  private _avatarKey = "avatar";


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

  setUsers(users: string[]) {

  }

  open() {
    this.element.style.display = "block";
  }

  close() {
    this.element.style.display = "none";
  }
}