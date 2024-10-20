import { HiInput } from "../HiInput";

export interface HiSelectProps {
  value?: string | number | (string | number)[]; // 当前选中的值
  options?: { label: string; value: string | number }[]; // 选项列表
  className?: string; // 自定义类名
  placeholder?: string; // 占位符
  multiple?: boolean; // 是否多选
  disabled?: boolean; // 是否禁用
  clearable?: boolean; // 是否可清除
  onChange?: (value: string | number | (string | number)[]) => void; // 值改变时的回调函数
}

const CLASS_NAME = "hi-voucher-select";

export class HiSelect {
  public element: HTMLElement = document.createElement("div");

  private _inputEl = document.createElement("div");
  private _placeholderEl = document.createElement("div");
  private _optionsEl = document.createElement("div");
  private _optionEls: HTMLElement[] = []

  private _value: (string | number)[] = [];

  public get value() {
    return this._value;
  }

  public set value(value: string | number | (string | number)[]) {
    if (Array.isArray(value)) {
      this._value = value;
    } else if (value || value === 0) {
      this._value = [value];
    } else {
      this._value = [];
    }
    this._inputEl.innerText = this._value.map((v) => this._options.find((o) => o.value === v)?.label || "").join(",");
    this._optionEls.forEach((el) => {
      const value = el.dataset.value as string;
      const type = el.dataset.type as string;
      const option = this._options.find((o) => String(o.value) === value && typeof o.value === type);
      if (option && this._value.includes(option.value)) {
        el.classList.add("active");
      } else {
        el.classList.remove("active");
      }
    })
    this.changes.forEach((cb) => {
      if (this.multiple) cb(this._value)
      else cb(this._value[0])
    });
  }

  private _className = "";

  public get className() {
    return this._className;
  }

  public set className(className: string) {
    this._className = className;
    this.element.className = `${CLASS_NAME} ${className}`;
  }

  private _placeholder = "";
  public get placeholder() {
    return this._placeholder;
  }

  public set placeholder(placeholder: string) {
    this._placeholder = placeholder;
    this._placeholderEl.innerText = placeholder;
  }

  private _multiple = false;
  public get multiple() {
    return this._multiple;
  }

  public set multiple(multiple: boolean) {
    this._multiple = multiple;
  }

  private _disabled = false;
  public get disabled() {
    return this._disabled;
  }

  public set disabled(disabled: boolean) {
    this._disabled = disabled;
  }

  private _clearable = false;
  public get clearable() {
    return this._clearable;
  }

  public set clearable(clearable: boolean) {
    this._clearable = clearable;
  }


  private _options: { label: string; value: string | number }[] = [];

  public get options() {
    return this._options;
  }

  public set options(options: { label: string; value: string | number }[]) {
    this._options = options;
    this._createOptionsEl();
  }

  private changes: ((value: string | number | (string | number)[]) => void)[] = [];

  constructor({ value = "", options = [], className = "", placeholder = "", multiple = false, disabled = false, clearable = false, onChange }: HiSelectProps = {}) {
    this.className = className;
    this.value = value;
    this.options = options;
    this.placeholder = placeholder;
    this.multiple = multiple;
    this.disabled = disabled;
    this.clearable = clearable;
    if (onChange) this.changes.push(onChange);
    this.render();
    this.onEvent();
  }

  private render() {
    this._optionsEl.className = "hi-select-options";
    this._inputEl.className = "hi-select-input";
    this.element.appendChild(this._inputEl);
    this.element.appendChild(this._optionsEl);
    // 为element添加可获取焦点属性
    this.element.tabIndex = 0;
    this.element.addEventListener("click", () => {
      this._openOptions();
    })
  }

  private _createOptionsEl() {
    this._optionsEl.innerHTML = "";
    this._options.forEach((option) => {
      const optionEl = document.createElement("div");
      optionEl.className = "hi-select-option-item";
      optionEl.innerText = option.label;
      optionEl.dataset.value = String(option.value);
      optionEl.dataset.type = typeof option.value;
      optionEl.addEventListener("click", () => {
        if (this.multiple) {
          let values = [...this._value];
          if (values.includes(option.value)) {
            values = values.filter((v) => v !== option.value);
          } else {
            values.push(option.value);
          }
          this.value = values;
        } else {
          this.value = [option.value];
          setTimeout(() => {
            this._closeOptions();
          })
        }
      })
      this._optionEls.push(optionEl);
      this._optionsEl.appendChild(optionEl);
    });
  }

  private onEvent() {
    const vh = window.innerHeight;
    this.element.addEventListener("click", () => {
      const { top, bottom } = this.element.getBoundingClientRect();
      let position = "bottom";
      if (top > vh - bottom) {
        position = "top";
      }
      if (position === "bottom") {
        this._optionsEl.style.top = "calc(100% + 3px)";
        this._optionsEl.style.bottom = "initial"
      } else {
        this._optionsEl.style.top = "initial"
        this._optionsEl.style.bottom = "calc(100% + 3px)";
      }
      this._openOptions()
    })
    // 如果element失去焦点，则关闭options
    this.element.addEventListener("blur", () => {
      this._closeOptions();
    })
  }

  private _openOptions() {
    this._optionsEl.style.display = "block";
  }
  private _closeOptions() {
    this._optionsEl.style.display = "none";
  }

  public onChange(fn: (value: string | number | (string | number)[]) => void) {
    this.changes.push(fn);
  }
}
