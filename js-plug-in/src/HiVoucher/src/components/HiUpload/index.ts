export interface HiUploadProps {
  value?: string;
  width?: number;
  height?: number;
  accept?: string;
  border?: string | boolean;
  borderRadius?: number;
  onChange?: (url: string | File) => void;
}

const CLASS_NAME = 'hi-voucher-upload';

export class HiUpload {
  public element = document.createElement('div');
  private _inputEl = document.createElement('input');
  private _imgEl = document.createElement('img');

  private _value: string | File | null = null;
  public get value() {
    return this._value;
  }
  public set value(value: string | File | null) {
    this._value = value;
    this._imgEl.src = value ? (value instanceof File ? URL.createObjectURL(value) : value) : '';
    if (value && this.element.className.indexOf('none') !== -1) {
      this.element.classList.remove('none');
    } else if (!value) {
      this.element.classList.add('none');
    }
    this._inputEl.value = '';
  }

  private _width = 120;
  public get width() {
    return this._width;
  }
  public set width(value: number) {
    this._width = value;
    this.element.style.width = `${value}px`;
  }

  private _height = 120;
  public get height() {
    return this._height;
  }
  public set height(value: number) {
    this._height = value;
    this.element.style.height = `${value}px`;
  }

  private _accept = '';
  public get accept() {
    return this._accept;
  }

  public set accept(value: string) {
    this._accept = value;
    this._inputEl.accept = value;
  }


  private _border: string | boolean = true;
  public get border() {
    return this._border;
  }

  public set border(value: string | boolean) {
    this._border = value;
    if (value && typeof value === 'string') this.element.style.border = value
    else if (value && this.element.className.indexOf('border') === -1) this.element.classList.add('border');
    else if (!value && this.element.className.indexOf('border') !== -1) this.element.classList.remove('border');
  }

  private _borderRadius = 0;
  public get borderRadius() {
    return this._borderRadius;
  }

  public set borderRadius(value: number) {
    this._borderRadius = value;
    this.element.style.borderRadius = `${value}px`;
  }



  private changes: ((url: string | File) => void)[] = []

  constructor({ value, width, height, accept, border, borderRadius, onChange }: HiUploadProps = {}) {
    this.value = value || null;
    this.width = width || 120;
    this.height = height || 120;
    this.accept = accept || '';
    this.border = border || true;
    this.borderRadius = borderRadius || 0;

    if (onChange) this.changes.push(onChange);

    this.render();
  }

  private render() {
    this._inputEl.type = 'file';
    this._inputEl.className = CLASS_NAME + '-input';
    this._inputEl.onchange = (e) => {
      const file = this._inputEl.files?.[0];
      if (file) {
        this.value = file;
        this.changes.forEach(fn => fn(file));
      } else {
        this.value = null;
      }
    }

    this._imgEl.className = CLASS_NAME + '-img';

    this.element.classList.add(CLASS_NAME)
    this.element.appendChild(this._inputEl);
    this.element.appendChild(this._imgEl);
  }

  public onChange(fn: (url: string | File) => void) {
    this.changes.push(fn);
  }
}


export function HiUploadEl(props?: HiUploadProps): HiUpload {
  return new HiUpload(props);
}