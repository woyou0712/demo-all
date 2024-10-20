from PIL import Image
import pytesseract
import cv2
import numpy as np


# 识别文本
def img_to_text(img_path):
    # 打开图片
    image = cv2.imread(img_path)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)

    kernel = np.ones((2, 2), np.uint8)
    dilated = cv2.dilate(binary, kernel, iterations=1)
    pil_image = Image.fromarray(dilated)

    # 使用pytesseract识别图片中的文本,支持中英文
    text = pytesseract.image_to_string(pil_image, lang='chi_sim+eng')
    return text


# 从图片中查找文字并返回坐标
def find_text(img_path, text):
    # 打开图片
    image = Image.open(img_path)
    # 使用pytesseract识别图片中的文本,支持中英文
    data = pytesseract.image_to_data(image, lang='chi_sim+eng')
    # return data
    # 遍历识别结果
    for i, d in enumerate(data.splitlines()):
        if i == 0:
            continue
        d = d.split()
        if len(d) > 11 and d[11] == text:
            return (int(d[6]), int(d[7]), int(d[8]), int(d[9]))
    return None


# 从背景图片中查找小图片
def find_img(img_path, target_path, threshold=0.8):
    # 打开图片
    image = cv2.imread(img_path)
    target = cv2.imread(target_path)
    # 转换为灰度图
    image_gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    target_gray = cv2.cvtColor(target, cv2.COLOR_BGR2GRAY)
    # 使用模板匹配
    result = cv2.matchTemplate(image_gray, target_gray, cv2.TM_CCOEFF_NORMED)
    # 设置阈值
    loc = np.where(result >= threshold)
    # 如果没有匹配结果，则返回None
    if len(loc[0]) == 0:
        return None
    # 获取匹配结果
    min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(result)
    # 获取匹配位置
    top_left = max_loc
    bottom_right = (top_left[0] + target.shape[1], top_left[1] + target.shape[0])
    return top_left, bottom_right


# 识别图片中的二维码
def img_to_qr(img_path):
    # 打开图片
    image = Image.open(img_path)
    # 使用pytesseract识别图片中的二维码
    qr = pytesseract.image_to_data(image)
    return qr


# 截取图片指定区域
def img_cut(img_path, new_path, x1, y1, x2, y2):
    # 打开图片
    image = Image.open(img_path)
    # 截取指定区域
    image = image.crop((x1, y1, x2, y2))
    # 保存截取后的图片
    image.save(new_path, "PNG")
