export function createElement<K extends keyof HTMLElementTagNameMap>(
  type: K,
  { className, style, content }: { className?: string; style?: { [key: string]: string }; content?: string | HTMLElement | Text | Node | Element } = {}
): HTMLElementTagNameMap[K] {
  const element = document.createElement(type);
  if (className) element.className = className;
  if (style) {
    Object.keys(style).forEach((key) => (element.style[key as any] = style[key]));
  }
  if (content) {
    if (typeof content === "string") element.innerHTML = content;
    else element.appendChild(content);
  }
  return element;
}

export const createUUID = (): string => {
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += Math.floor(Math.random() * 32).toString(32);
  }
  result += `-${Date.now().toString(32)}-`;
  for (let i = 0; i < 8; i++) {
    result += Math.floor(Math.random() * 32).toString(32);
  }
  return result;
};

export const voucherTemplateData = (): VoucherTemplate => ({
  // bg: "http://bills.bauble.vip/billBg/demo.png", // 背景图片
  // bgUrl: "http://bills.bauble.vip/billBg/demo.png", // 背景图片url
  bg: "",
  bgUrl: "", // 背景图片url
  type: 0, // 单据类型
  name: "", // 单据名称
  width: 820, // 单据宽度
  height: 400, // 单据高度
  seal: false, // 是否可盖章
  topLine: false, // 是否有封顶线
  correctLine: false, // 是否有更正线
  redPen: false, // 是否红字展示负数
  sign: false, // 是否可签字
  // 单据内容
  content: {
    texts: [textTemplateData()], // 文字
    inputs: [inputTemplateData()], // 输入框
  },
});

export const inputTemplateData = (): VoucherInputTemplate => ({
  type: "text", // 输入框类型
  mark: "", // 标记
  name: "", // 输入框名称
  weight: 1, // 输入框权重

  fontSize: 14, // 字体大小
  bold: false, // 是否加粗
  width: 120, // 输入框宽度
  height: 32, // 输入框高度
  align: "left", // 输入框对齐方式

  x: 0, // 输入框x坐标
  y: 0, // 输入框y坐标

  maxlength: 0, // 输入框最大长度
  letterSpacing: 0, // 文字间距
  placeholder: "", // 占位符
});

export const tableTemplateData = (): VoucherTableTemplate => ({
  name: "", // 表格名称
  width: 600, // 表格宽度
  height: 96, // 表格高度
  align: "left", // 表格对齐方式
  border: false, // 是否有边框
  x: 0, // 表格x坐标
  y: 0, // 表格y坐标
  // 表格内容
  content: [
    [inputTemplateData(), inputTemplateData(), inputTemplateData()],
    [inputTemplateData(), inputTemplateData(), inputTemplateData()],
    [inputTemplateData(), inputTemplateData(), inputTemplateData()],
  ],
  colWidths: [100, 100, 100], // 列宽
  colAligns: ["left", "left", "left"], // 列对齐方式
  rowHeights: [32, 32, 32], // 行高
});

export const textTemplateData = (): VoucherTextTemplate => ({
  name: "", // 文本名称
  fontFamily: "'Microsoft YaHei', '微软雅黑', 'Apple SD Gothic Neo', 'Arial', sans-serif;", // 字体
  fontSize: 14, // 字体大小
  x: 0, // 文本x坐标
  y: 0, // 文本y坐标
  letterSpacing: 0, // 文字间距
  lineHeight: 14,
  content: "", // 文本内容
  bold: false, // 是否加粗
});
