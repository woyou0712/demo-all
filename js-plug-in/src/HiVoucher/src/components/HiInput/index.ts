import { createElement } from "@/HiVoucher/utils";

type InputEventType = (value: string | number) => void;

export interface HiInputProps {
  value?: string | number;
  placeholder?: string;
  className?: string;
  type?: "text" | "textarea" | "number" | "password";
  border?: string | boolean;
  disabled?: boolean;
  required?: boolean;
  readonly?: boolean;
  maxlength?: number;
  pattern?: string;
  letterSpacing?: number;
  fontSize?: number;
  color?: string;
}

const CLASS_NAME = "hi-voucher-input";

function _createElement(type: "input" | "textarea") {
  return createElement(type, {
    className: CLASS_NAME, style: {
      "width": "100%",
      "height": "32px",
      "border": "1px solid transparent",
      "-webkit-appearance": "none",
      "-moz-appearance": "none",
      "appearance": "none",
      "outline": "none",
      "border-radius": "4px",
      "padding": "0 12px",
      "font-size": "14px",
      "line-height": "32px",
      "color": "#333",
      "background-color": "transparent",
    }
  }) as HTMLInputElement
}

export class HiInput {
  public element: HTMLInputElement = _createElement("input")

  private _value: string | number = "";

  public get value() {
    return this._value;
  }

  public set value(value: string | number) {
    let v = value;
    if (v || v === 0) {
      v = String(v);
    } else {
      v = "";
    }
    this._value = v;
    if (this.element.value !== v) {
      this.element.value = v;
    }
  }

  private _placeholder = "";
  public get placeholder() {
    return this._placeholder;
  }

  public set placeholder(value: string) {
    this._placeholder = value;
    this.element.placeholder = value;
  }
  private _className = "";
  public get className() {
    return this._className;
  }
  public set className(value: string) {
    this._className = value;
    const _c = this.element.className;
    if (!_c) this.element.className = value;
    const cs = _c.split(" ");
    const vs = value.split(" ");
    const newCs = cs.filter((c) => vs.indexOf(c) === -1);
    this.element.className = newCs.join(" ");
  }
  private _type: "text" | "textarea" | "number" | "password" = "text";

  public get type() {
    return this._type;
  }

  public set type(value: "text" | "textarea" | "number" | "password") {
    this._type = value;
    this.element.type = value;
  }

  private _border: string | boolean = true;

  public get border() {
    return this._border;
  }

  public set border(value: string | boolean) {
    this._border = value;
    if (value && typeof value === "string") this.element.style.border = value;
    else if (value && this.element.className.indexOf("border") === -1) this.element.style.borderColor = "#ddd";
    else if (!value && this.element.className.indexOf("border") !== -1) this.element.style.borderColor = "transparent"
  }

  private _disabled = false;

  public get disabled() {
    return this._disabled;
  }

  public set disabled(value: boolean) {
    this._disabled = value;
    this.element.disabled = value;
  }

  private _required = false;

  public get required() {
    return this._required;
  }

  public set required(value: boolean) {
    this._required = value;
    this.element.required = value;
  }

  private _readonly = false;

  public get readonly() {
    return this._readonly;
  }

  public set readonly(value: boolean) {
    this._readonly = value;
    this.element.readOnly = value;
  }

  private _maxlength = 0;

  public get maxlength() {
    return this._maxlength;
  }

  public set maxlength(value: number) {
    this._maxlength = value;
    if (value === 0) {
      this.element.removeAttribute("maxlength");
    } else {
      this.element.setAttribute("maxlength", String(value));
    }
  }

  private _pattern = "";

  public get pattern() {
    return this._pattern;
  }

  public set pattern(value: string) {
    this._pattern = value;
    this.element.pattern = value;
  }

  private _letterSpacing = 0;

  public get letterSpacing() {
    return this._letterSpacing;
  }

  public set letterSpacing(value: number) {
    this._letterSpacing = value;
    if (value === 0) {
      this.element.removeAttribute("letterSpacing");
    } else {
      this.element.style.letterSpacing = `${value}px`;
    }
  }

  private _fontSize = 14;
  public get fontSize() {
    return this._fontSize;
  }

  public set fontSize(value: number) {
    if (!value) return;
    this._fontSize = value;
    this.element.style.fontSize = `${value}px`;
  }

  private _color = "#333";
  public get color() {
    return this._color;
  }

  public set color(value: string) {
    if (!value) return;
    this._color = value;
    this.element.style.color = value;
  }

  private changes: InputEventType[] = [];
  private blurs: InputEventType[] = [];
  private focus: InputEventType[] = [];
  private inputs: InputEventType[] = [];

  constructor({ value = "", placeholder, className, type = "text", border, disabled, required, readonly, maxlength, pattern, letterSpacing, fontSize }: HiInputProps = {}) {
    if (type === "textarea") {
      this.element = _createElement("textarea");
    }
    this.value = value;
    this.placeholder = placeholder || "";
    this.type = type;
    this.border = border || false;
    this.className = className || "";
    this.disabled = disabled || false;
    this.required = required || false;
    this.readonly = readonly || false;
    this.maxlength = maxlength || 0;
    this.pattern = pattern || "";
    this.letterSpacing = letterSpacing || 0;
    this.fontSize = fontSize || 14;
    this.onEvent();
  }

  private onEvent() {
    const input = this.element;
    input.oninput = (e) => {
      const v = (e.target as HTMLInputElement).value;
      this.value = v;
      this.inputs.forEach((fn) => fn((e.target as HTMLInputElement).value));
    };
    input.onchange = (e) => {
      const v = (e.target as HTMLInputElement).value;
      this.value = v;
      this.changes.forEach((fn) => fn((e.target as HTMLInputElement).value));
    };
    input.onblur = (e) => {
      this.blurs.forEach((fn) => fn((e.target as HTMLInputElement).value));
    };
    input.onfocus = (e) => {
      this.focus.forEach((fn) => fn((e.target as HTMLInputElement).value));
    };
  }

  onChange(fn: InputEventType) {
    this.changes.push(fn);
  }
  onBlur(fn: InputEventType) {
    this.blurs.push(fn);
  }
  onFocus(fn: InputEventType) {
    this.focus.push(fn);
  }
  onInput(fn: InputEventType) {
    this.inputs.push(fn);
  }
}
