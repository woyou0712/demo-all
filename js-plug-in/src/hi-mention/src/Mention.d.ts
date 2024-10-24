import UserSelector from "./UserSelector";
import { MentionOptions, UserInfo, EventsType } from "./types";
declare class Mention {
    private _rootEl;
    private _editorBody;
    private _editorEl;
    private _placeholderEl;
    private _events;
    private _changetimeout?;
    private _blurtimeout?;
    private _inputRange?;
    private _inputSelection?;
    protected options: MentionOptions;
    userSelector?: UserSelector;
    private _queryStr;
    constructor(el: Element | HTMLElement | string, option?: Partial<MentionOptions>);
    private _initElement;
    private _initEvent;
    private _onclick;
    private _onblur;
    private _onfocus;
    private _onkeydown;
    private _onkeyup;
    private _oninput;
    private _oncut;
    private _onpaste;
    private _onchange;
    private _inputEvent;
    /**
     * 内容换行
     */
    private _wordWrap;
    /**
     * 删除键
     * @param range 当前光标位置
     * @param currentP 当前光标所在的P标签
     * @returns
     */
    private _onDelete;
    /**
     * 退格键
     * @param range 当前光标位置
     * @param currentP 当前光标所在的P标签
     * @returns
     */
    private _onBackspace;
    /**
     * 删除内容
     * @param e 键盘事件
     * @returns
     */
    private _wordDelete;
    private _isCursorInEditor;
    /**
     * 创建用户选项元素
     * @param user 用户信息
     * @returns 用户列表中的选项元素
     */
    protected createUserElement(user: UserInfo): HTMLElement;
    setOptions(options: Partial<MentionOptions>): this;
    getOptions(): MentionOptions;
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
    getData(): {
        text: string;
        html: string;
    };
    /**
     * 获取@提及的用户列表
     * @returns 用户列表
     */
    getMentions(): UserInfo[];
    protected initUserSelector(): void;
    protected closeUserSelector(): void;
    /**
   * 打开用户选择器
   * @param query 查询字符串
   * @returns
   */
    protected openUserSelector(query: string): void;
}
export default Mention;
