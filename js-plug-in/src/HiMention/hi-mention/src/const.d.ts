import { MentionOptions, UserSelectorOptions } from "./types";
export declare const BROWSER: () => {
    isIE: boolean;
    isEdge: boolean;
    isFirefox: boolean;
    isChrome: boolean;
    isSafari: boolean;
    isOpera: boolean;
};
export declare const EDITOR_CLASS = "hi-mention-editor";
export declare const ROW_TAG_CLASS = "hi-mention-row";
export declare const TEXT_TAG_CLASS = "hi-mention-text";
export declare const PLACEHOLDER_TEXT = "\uFEFF";
export declare const NEW_LINE: string;
export declare const defaultUserSelectorOptions: () => UserSelectorOptions;
export declare const defaultMentionOptions: () => MentionOptions;
