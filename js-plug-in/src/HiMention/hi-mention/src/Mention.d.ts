import UserSelector from "./UserSelector";
import { MentionOptions, UserInfo, EventsType } from "./types";
declare class Mention {
    protected blurtimeout?: any;
    protected options: MentionOptions;
    userSelector?: UserSelector;
    constructor(el: Element | HTMLElement | string, option?: Partial<MentionOptions>);
    protected onUndoHistory(e: KeyboardEvent): boolean;
    protected selectAll(): void;
    protected onSelectAll(e: KeyboardEvent): boolean;
    protected shearContent(): true | undefined;
    protected onShearContent(e: KeyboardEvent): boolean;
    protected moveCursor(direction: "ArrowLeft" | "ArrowRight"): void;
    protected onMoveCursor(e: KeyboardEvent): boolean;
    protected wordDelete(e: KeyboardEvent): boolean;
    protected onWordDelete(e: KeyboardEvent): boolean;
    protected wordWrap(): void;
    protected onWordWrap(e: KeyboardEvent): boolean;
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
    insertHtml(html: HTMLElement): this;
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
