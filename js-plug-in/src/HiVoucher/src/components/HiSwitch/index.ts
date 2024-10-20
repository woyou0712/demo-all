export interface HiSwitchProps {
  value?: boolean;
  disabled?: boolean;
  background?: string;
  activeBg?: string;
  btnBg?: string;
  width?: number;
  height?: number;

  onChange?: (value: boolean) => void;
}

const CLASS_NAME = "hi-voucher-switch";

export class HiSwitch {
  public element = document.createElement("div");

  private _btnEl = document.createElement("div");

  private _value: boolean = false;
  public get value(): boolean {
    return this._value;
  }
  public set value(value: boolean) {
    this._value = value;

    this.element.classList.toggle("active", value);
  }

  private _disabled: boolean = false;
  public get disabled(): boolean {
    return this._disabled;
  }
  public set disabled(value: boolean) {
    this._disabled = value;
    this.element.classList.toggle("disabled", value);
  }

  private _bg: string = "#ccc";
  public get background(): string {
    return this._bg;
  }

  public set background(value: string) {
    this._bg = value;
    this.element.style.setProperty("--default-bg", value);
  }

  private _activeBg: string = "#09f";
  public get activeBg(): string {
    return this._activeBg;
  }

  public set activeBg(value: string) {
    this._activeBg = value;
    this.element.style.setProperty("--active-bg", value);
  }

  private _btnBg: string = "#fff";
  public get btnBg(): string {
    return this._btnBg;
  }

  public set btnBg(value: string) {
    this._btnBg = value;
    this._btnEl.style.background = value;
  }

  private _width: number = 80;
  public get width(): number {
    return this._width;
  }

  public set width(value: number) {
    this._width = value;
    this.element.style.width = `${value}px`;
    this.element.style.setProperty("--translate-x", value - this._height + "px");
  }

  private _height: number = 32;
  public get height(): number {
    return this._height;
  }

  public set height(value: number) {
    this._height = value;
    if (!value) return;
    this.element.style.height = `${value}px`;
    this._btnEl.style.height = `${value - 4}px`;
    this._btnEl.style.width = `${value - 4}px`;
    const radius = `${Math.ceil(value / 2)}px`;
    this.element.style.borderRadius = radius;
    this.element.style.setProperty("--translate-x", this._width - value + "px");
  }

  private changes: ((value: boolean) => void)[] = [];

  constructor({ value = false, disabled = false, background = "#ccc", activeBg = "#0080ff", btnBg = "#fff", width = 70, height = 32, onChange }: HiSwitchProps = {}) {
    this.value = value;
    this.disabled = disabled;
    this.background = background;
    this.activeBg = activeBg;
    this.btnBg = btnBg;
    this.width = width;
    this.height = height;
    if (onChange) this.changes.push(onChange);
    this.render();
    this.onEvent();
  }

  private render() {
    this.element.classList.add(CLASS_NAME);
    this._btnEl.classList.add(`${CLASS_NAME}-btn`);
    this.element.appendChild(this._btnEl);
  }

  private onEvent() {
    this.element.addEventListener("click", () => {
      if (this.disabled) return;
      this.value = !this.value;
      this.changes.forEach((fn) => fn(this.value));
    });
  }

  public onChange(fn: (value: boolean) => void) {
    this.changes.push(fn);
  }
}
