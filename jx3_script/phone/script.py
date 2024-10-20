from utils import adb, img
import time


class Script:
    # 连接的设备ID
    device_id = None

    def __init__(self):
        d = adb.get_devices()
        if len(d) == 0:
            print("未检测到设备")
            return
        self.device_id = d[0]
        print("已连接设备: %s" % self.device_id)

    def start(self):
        # while True:
        self._run()

    # 执行脚本
    def _run(self):
        img_path = self._get_screenshot()
        time.sleep(0.1)  # 延迟100毫秒
        b = self._unlock(img_path)  # 解锁
        if b:
            print("解锁")
            return
        b = self._close_push(img_path)  # 关闭推送
        if b:
            print("关闭推送")
            return
        b = self._get_function(img_path)  # 点击功能键
        if b:
            print("点击功能键")
            return
        b = self._click_secret(img_path)
        if b:
            print("点击秘境")
            return
        b = self._select_five(img_path)
        if b:
            print("选择5人秘境")
            return
        b = self._select_active(img_path)
        if b:
            print("选中大战")
            return

    # 获取当前设备分辨率
    def _get_resolution(self):
        return adb.get_device_resolution(self.device_id)

    # 获取当前设备屏幕截图
    def _get_screenshot(self):
        return adb.get_device_screenshot(self.device_id)

    # 解除锁屏
    def _unlock(self, img_path):
        e = img.find_img(img_path, "static/lock.png")
        if e is not None:
            print(e)
            adb.tap(self.device_id, 200, 200)
            return True
        return False

    # 关闭推送
    def _close_push(self, img_path):
        e = img.find_img(img_path, "static/push.png", 0.7)
        if e is not None:
            print(e)
            adb.tap(self.device_id, 200, 200)
            return True
        return False

    # 截取当前小地图
    def _get_map(self, img_path):
        # 切割屏幕
        img.img_cut(img_path, "maps/map.png", 2000, 20, 2250, 250)

    # 获取功能按键
    def _get_function(self, img_path):
        # 切割功能图标
        img.img_cut(img_path, f"maps/function.png", 2200, 20, 2350, 100)
        # 在区域内查找功能图标
        d = img.find_img("maps/function.png", "static/function.png", 0.7)
        if d is not None:
            adb.tap(self.device_id, 2250, 50)
            time.sleep(0.1)

            return True
        return False

    # 点击秘境
    def _click_secret(self, img_path):
        # 切割功能区域
        img.img_cut(img_path, "maps/methods.png", 1590, 20, 2250, 1000)
        e = img.find_img("maps/methods.png", "static/secret.png")
        if e is not None:
            adb.tap(self.device_id, 2100, 600)
            return True
        return False

    # 选择5人秘境
    def _select_five(self, img_path):
        img.img_cut(img_path, "maps/secret.png", 500, 850, 700, 1000)
        e = img.find_img("maps/secret.png", "static/secrte_page.png")
        if e is not None:
            adb.tap(self.device_id, 600, 500)
            return True
        return False

    # 大战
    def _select_active(self, img_path):
        img.img_cut(img_path, "maps/secrets.png", 0, 0, 700, 1000)
        e = img.find_img("maps/secrets.png", "static/active.png")
        if e is not None:
            adb.tap(self.device_id, 250, 300)
            return True
        return False
