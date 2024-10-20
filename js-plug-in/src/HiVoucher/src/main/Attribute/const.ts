export interface FormItemOption<T> {
  label: string;
  key: T;
  type: string;
  placeholder?: string;
  options?: { label: string, value: string | number }[]
  element?: any
}

export const voucherTypes = [
  { label: "原始凭证", value: 0 },
  { label: "记账凭证", value: 1 },
  { label: "账簿", value: 2 },
  { label: "报表", value: 3 },
]



export const voucherOptionForm: FormItemOption<keyof VoucherTemplate>[] = [
  { label: "上传背景", key: "bg", type: "upload" },
  { label: "背景Url", key: "bgUrl", type: "text", placeholder: "网络图片地址" },
  { label: "类型", key: "type", type: "select", options: voucherTypes, placeholder: "选择单据类型" },
  { label: "名称", key: "name", type: "text", placeholder: "单据名称" },
  { label: "宽度", key: "width", type: "number", placeholder: "单据宽度（数值）" },
  { label: "高度", key: "height", type: "number", placeholder: "单据高度（数值）" },
  { label: "印章", key: "seal", type: "switch" },
  { label: "封顶线", key: "topLine", type: "switch" },
  { label: "更正线", key: "correctLine", type: "switch" },
  { label: "红笔", key: "redPen", type: "switch" },
  { label: "签署批准", key: "sign", type: "switch" },
];


export const inputTypes = [
  { label: "文本", value: "text" },
  { label: "数字", value: "number" },
  { label: "金额", value: "money" },
  { label: "日期", value: "date" },
  { label: "年份", value: "year" },
  { label: "月份", value: "month" },
  { label: "日期", value: "day" },
]

export const alignTypes = [
  { label: "左对齐", value: "left" },
  { label: "右对齐", value: "right" },
  { label: "居中对齐", value: "center" },
]


export const inputOptionForm: FormItemOption<keyof VoucherInputTemplate>[] = [
  { label: "输入类型", key: "type", type: "select", options: inputTypes, placeholder: "请选择输入类型" },
  { label: "标记", key: "mark", type: "text", placeholder: "输入框标记" },
  { label: "名称", key: "name", type: "text", placeholder: "输入框名称" },
  { label: "权重", key: "weight", type: "number", placeholder: "输入框权重（数值）" },
  { label: "宽度", key: "width", type: "number", placeholder: "输入框宽度（数值）" },
  { label: "高度", key: "height", type: "number", placeholder: "输入框高度（数值）" },
  { label: "坐标(X)", key: "x", type: "number", placeholder: "输入框X坐标（数值）" },
  { label: "坐标(Y)", key: "y", type: "number", placeholder: "输入框Y坐标（数值）" },
  { label: "最大长度", key: "maxlength", type: "number", placeholder: "输入框最大长度（数值）" },
  { label: "文字间距", key: "letterSpacing", type: "number", placeholder: "输入框文字间距（数值）" },
  { label: "提示文本", key: "placeholder", type: "text", placeholder: "输入框提示文本" },
  { label: "对其方式", key: "align", type: "select", options: alignTypes, placeholder: "请选择对其方式" },
  { label: "字体大小", key: "fontSize", type: "number", placeholder: "输入框字体大小（数值）" },
  { label: "加粗", key: "bold", type: "switch" },
]


export const tableOptionForm: FormItemOption<keyof VoucherTableTemplate>[] = [
  { label: "名称", key: "name", type: "text", placeholder: "表格名称" },
  { label: "宽度", key: "width", type: "number", placeholder: "表格宽度（数值）" },
  { label: "高度", key: "height", type: "number", placeholder: "表格高度（数值）" },
  { label: "对其方式", key: "align", type: "select", options: alignTypes, placeholder: "请选择对其方式" },
  { label: "坐标(X)", key: "x", type: "number", placeholder: "表格X坐标（数值）" },
  { label: "坐标(Y)", key: "y", type: "number", placeholder: "表格Y坐标（数值）" },
  { label: "显示边框", key: "border", type: "switch" },
]

export const textOptionForm: FormItemOption<keyof VoucherTextTemplate>[] = [
  { label: "名称", key: "name", type: "text", placeholder: "文本名称" },
  { label: "文本内容", key: "content", type: "text", placeholder: "文本内容" },
  { label: "字体", key: "fontFamily", type: "text", placeholder: "文字字体" },
  { label: "字体大小", key: "fontSize", type: "number", placeholder: "字体大小" },
  { label: "坐标(X)", key: "x", type: "number", placeholder: "文本X坐标（数值）" },
  { label: "坐标(Y)", key: "y", type: "number", placeholder: "文本Y坐标（数值）" },
  { label: "文字间距", key: "letterSpacing", type: "number", placeholder: "文本文字间距（数值）" },
  { label: "行高", key: "lineHeight", type: "text", placeholder: "文本行高（数值）" },
  { label: "加粗", key: "bold", type: "switch" },
]