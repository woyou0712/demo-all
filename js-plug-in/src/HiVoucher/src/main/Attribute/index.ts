import { voucherOptionDefault, inputOptionDefault, tableOptionDefault, textOptionDefault, createElement } from "../../../utils";
import { openIcon } from "../../../static/icons";
import { HiInput, HiSwitch, HiSelect, HiUpload } from "../../components";
import { FormItemOption, inputOptionForm, tableOptionForm, textOptionForm, voucherOptionForm } from "./const";

export type ChangeCallback = <T extends keyof AttributeOptions, K extends keyof AttributeOptions[T]>(type: T, key: K, value: AttributeOptions[T][K]) => void

export default class Attribute {
  private _rootEl: HTMLElement;
  private _bodyEl = createElement("section", { className: "hi-voucher-attribute" });
  private _openEl = createElement("div", { className: "hi-voucher-attribute-open" });
  private _openIcon = createElement("div", { className: "hi-voucher-attribute-open-icon" });
  private _titleEl = createElement("div", { className: "hi-voucher-attribute-title" });
  private _formEl = createElement("div", { className: "hi-voucher-attribute-form-body" });
  private _voucherFormEl = createElement("div", { className: "hi-voucher-attribute-form" });
  private _inputFormEl = createElement("div", { className: "hi-voucher-attribute-form" });
  private _tableFormEl = createElement("div", { className: "hi-voucher-attribute-form" });
  private _textFormEl = createElement("div", { className: "hi-voucher-attribute-form" });

  private _open = true;

  get open() {
    return this._open;
  }

  set open(open: boolean) {
    this._open = open;
    if (open) {
      this._bodyEl.classList.add("active");
    } else {
      this._bodyEl.classList.remove("active");
    }
  }
  // 当前属性类型 整体票据/输入框/表格
  private _type: VoucherAttributeKeys = "voucher";

  get type() {
    return this._type;
  }

  set type(type: VoucherAttributeKeys) {
    this._type = type;
  }

  private _options: AttributeOptions = {
    "voucher": voucherOptionDefault(),
    "input": inputOptionDefault(),
    "table": tableOptionDefault(),
    "text": textOptionDefault()
  };

  get options() {
    return this._options;
  }

  set options(options: AttributeOptions) {
    this._options = options;
  }

  private changes: ChangeCallback[] = [];


  constructor(rootEl: HTMLElement) {
    this._rootEl = rootEl;
    const e = document.querySelector("section.hi-voucher-attribute");
    if (e) {
      this._bodyEl = e as HTMLElement;
    }
    this.render();
    this.onEvent();
  }

  private render() {
    this._openIcon.innerHTML = openIcon;
    this._openEl.appendChild(this._openIcon);
    this._bodyEl.appendChild(this._openEl);
    this._bodyEl.appendChild(this._titleEl);
    if (!this._bodyEl.parentNode) {
      this._rootEl.appendChild(this._bodyEl);
      if (this.open) {
        this._bodyEl.classList.add("active");
      } else {
        this._bodyEl.classList.remove("active");
      }
    }
    this._bodyEl.appendChild(this._formEl);


    this._createFormItems("input");
    this._createFormItems("table");
    this._createFormItems("text");
    this._createFormItems("voucher");
    this._showForm();
  }

  private onEvent() {
    this._openIcon.onclick = () => {
      this.open = !this.open;
    };
  }

  private _createFormItems<T extends keyof AttributeOptions>(type: T) {
    // 更具type的值来创建对应的表单项
    let forms: FormItemOption<string>[] = [];
    let box: HTMLElement
    let data = this._options[type];
    if (type === "input") {
      forms = inputOptionForm;
      box = this._inputFormEl;
    } else if (type === "table") {
      forms = tableOptionForm;
      box = this._tableFormEl;
    } else if (type === "text") {
      forms = textOptionForm;
      box = this._textFormEl;
    } else {
      forms = voucherOptionForm;
      box = this._voucherFormEl;
    }
    const parentNode = document.createDocumentFragment();
    forms.forEach((item) => {
      const el = createElement("div", { className: "hi-voucher-attribute-form-item" });
      const left = createElement("div", { className: "hi-voucher-attribute-form-item-left" });
      left.innerHTML = item.label;
      el.appendChild(left);
      const right = createElement("div", { className: "hi-voucher-attribute-form-item-right" });

      let ipt;
      switch (item.type) {
        case "text":
        case "number":
          ipt = new HiInput({ type: item.type, border: true, placeholder: item.placeholder });
          break;
        case "upload":
          ipt = new HiUpload({ accept: "image/*" });
          break;
        case "switch":
          ipt = new HiSwitch();
          break;
        case "select":
          ipt = new HiSelect({ options: item.options, placeholder: item.placeholder });
          break;
      }
      if (ipt) {
        item.element = ipt;
        const option = data as any
        ipt.value = option[item.key];
        ipt.onChange((v) => {
          option[item.key] = v;
          if (item.key === "bg" && v) {
            option["bgUrl"] = v ? (v instanceof File ? URL.createObjectURL(v) : v) : ''
            const bgUrlFormItem = forms.find(m => m.key === "bgUrl")
            if (bgUrlFormItem) {
              bgUrlFormItem.element.value = option["bgUrl"]
            }
            this.changes.forEach(fn => fn(type, "bgUrl" as any, v));
          } else if (item.key === "bgUrl" && v) {
            option["bg"] = v
            const bgFormItem = forms.find(m => m.key === "bg")
            if (bgFormItem) {
              bgFormItem.element.value = v
            }
            this.changes.forEach(fn => fn(type, "bg" as any, v));
          }
          this.changes.forEach(fn => fn(type, item.key as any, v));
        });
        right.appendChild(ipt.element);
      }
      el.appendChild(right);
      parentNode.appendChild(el);
    })
    box.appendChild(parentNode);
  }

  private _showForm() {
    this._formEl.innerHTML = "";
    switch (this.type) {
      case "input":
        this._titleEl.innerHTML = "输入框";
        this._formEl.appendChild(this._inputFormEl);
        break;
      case "table":
        this._titleEl.innerHTML = "表格";
        this._formEl.appendChild(this._tableFormEl);
        break;
      case "text":
        this._titleEl.innerHTML = "文本";
        this._formEl.appendChild(this._textFormEl);
        break;
      default:
        this._titleEl.innerHTML = "单据";
        this._formEl.appendChild(this._voucherFormEl);
    }
  }

  setOptions<T extends keyof AttributeOptions>(type: T, attribute?: AttributeOptions[T]) {
    this.type = type;
    if (attribute) this.options[type] = attribute;
    this._showForm();
  }

  onChange(fn: ChangeCallback) {
    this.changes.push(fn);
  }
}
