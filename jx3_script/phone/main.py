from phone.login import Login
from utils import adb

class Run:
    deviceid = None
    _login:Login = None

    def __init__(self):
        devices = adb.get_devices()
        if len(devices) == 0:
            return
        self.deviceid = devices[0]

        size = adb.get_device_size(self.deviceid)
        print(size)
        page_img = adb.get_device_screenshot(self.deviceid)
        self._login = Login(self.deviceid, page_img)


    def start(self):
        if not self.deviceid:
            print("没有设备连接")
            return
        self._login.run()
