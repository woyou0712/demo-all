from utils import img, adb
import time

from utils.read_json import get_account


class Login:
    deviceid = None
    page_img = None

    def __init__(self, deviceid, page_img):
        self.deviceid = deviceid
        self.page_img = page_img

    def _is_login_page(self):
        return img.find_img(self.page_img, "./static/login/login_page.png")

    def _click_login(self):
        adb.tap(self.deviceid, 1210, 750)

    def _is_login_form(self):
        return img.find_img(self.page_img, "./static/login/login_form.png")

    # 同意
    def _click_agree(self):
        while True:
            t = img.find_img(self.page_img, "./static/login/agree.png")
            if t:
                adb.tap(self.deviceid, t[0][0] + 20, t[0][1] + 20)
                adb.get_device_screenshot(self.deviceid)
                time.sleep(0.2)
            else:
                return

    # 角色选择
    def _click_role(self):
        return img.find_img(self.page_img, "./static/login/role.png")

    def run(self):
        if self._is_login_page():
            self._click_login()
            time.sleep(3)
            adb.get_device_screenshot(self.deviceid)
            if self._is_login_form():
                self._click_agree()
                account = get_account()
                adb.tap(self.deviceid, 950, 300)
                time.sleep(0.2)
                adb.input_device(self.deviceid, account["account"])
                adb.enter(self.deviceid)
                time.sleep(0.2)
                adb.input_device(self.deviceid, account["password"])
                return False
        if self._click_role():
            adb.tap(self.deviceid,2000,1000)
        return True