enum VoucherType {
  "原始凭证",
  "记账凭证",
  "账簿",
  "报表",
}

type VoucherInputType = "text" | "number" | "date" | "year" | "month" | "day" | "money";

/**
 * 输入元素属性（包括输入框，选择框等等可输入的元素）
 */
interface VoucherInputTemplate {
  type: VoucherInputType; // 输入框类型
  mark: string; // 标记
  name: string; // 输入框名称
  weight: number; // 输入框权重

  fontSize: number; // 字体大小
  bold: boolean; // 是否加粗
  width: number; // 输入框宽度
  height: number; // 输入框高度
  align: "left" | "center" | "right"; // 输入框对齐方式

  x: number; // 输入框x坐标
  y: number; // 输入框y坐标

  maxlength: number; // 输入框最大长度
  letterSpacing: number; // 文字间距
  placeholder: string; // 占位符
}

/**
 * 表格元素数据结构
 */
interface VoucherTableTemplate {
  name: string; // 表格名称
  width: number; // 表格宽度
  height: number; // 表格高度
  align: "left" | "center" | "right"; // 表格对齐方式
  border: boolean; // 是否有边框
  x: number; // 表格x坐标
  y: number; // 表格y坐标
  // 列宽
  colWidths: number[];
  // 列对齐方式
  colAligns: ("left" | "center" | "right")[];
  // 行高
  rowHeights: number[];
  // 表格内容
  content: (VoucherTextTemplate | VoucherInputTemplate)[][];
}

/**
 * 文本元素数据结构
 */
interface VoucherTextTemplate {
  name: string; // 文本名称
  content: string; // 文本内容
  fontFamily: string; // 字体
  fontSize: number; // 字体大小
  bold: boolean; // 是否加粗
  x: number; // 文本x坐标
  y: number; // 文本y坐标
  letterSpacing: number; // 文字间距
  lineHeight: number; // 行高
}

/**
 * 单据数据结构
 */
interface VoucherTemplate {
  bg: string; // 背景图片
  bgUrl: string; // 背景图片url
  type: VoucherType; // 单据类型
  name: string; // 单据名称
  width: number; // 单据宽度
  height: number; // 单据高度
  seal: boolean; // 是否可盖章
  topLine: boolean; // 是否有封顶线
  correctLine: boolean; // 是否有更正线
  redPen: boolean; // 是否红字展示负数
  sign: boolean; // 是否可签字
  content: {
    inputs?: VoucherInputTemplate[];
    tables?: VoucherTableTemplate[];
    texts?: VoucherTextTemplate[];
  };
}

interface AttributeOptions {
  input: VoucherInputTemplate;
  table: VoucherTableTemplate;
  text: VoucherTextTemplate;
  voucher: VoucherTemplate;
}

type VoucherAttributeKeys = keyof AttributeOptions;