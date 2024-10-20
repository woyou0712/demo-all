import os


# 使用ADB命令获取设备列表
def get_devices():
    '''
    获取设备列表
    :return:
    '''
    devices = os.popen('adb devices').readlines()
    device_list = []
    for device in devices[1:]:
        if device.strip() != '':
            device_list.append(device.strip().split('\t')[0])
    return device_list

# 使用ADB命令获取设备信息
def get_device_info(device):
    '''
    获取设备信息
    :param device:
    :return:
    '''
    info = os.popen(f'adb -s {device} shell getprop').readlines()
    return info

# 使用ADB命令获取设备屏幕分辨率
def get_device_size(device):
    '''
    获取设备屏幕分辨率
    :param device:
    :return:
    '''
    resolution = os.popen(f'adb -s {device} shell wm size').readlines()
    return resolution

# 使用ADB命令截取设备屏幕
def get_device_screenshot(device):
    '''
    截取设备屏幕
    :param device:
    :return:
    '''
    os.system(f'adb -s {device} shell screencap -p /sdcard/screenshot.png')
    os.system(f'adb -s {device} pull /sdcard/screenshot.png')
    os.system(f'adb -s {device} shell rm /sdcard/screenshot.png')
    return 'screenshot.png'

# 使用ADB命令点击设备
def tap(device, x, y):
    '''
    点击设备
    :param device:
    :param x:
    :param y:
    :return:
    '''
    os.system(f'adb -s {device} shell input tap {x} {y}')

# 使用ADB命令长按设备
def long_click_device(device, x, y, duration):
    '''
    长按设备
    :param device:
    :param x:
    :param y:
    :param duration:
    :return:
    '''
    os.system(f'adb -s {device} shell input swipe {x} {y} {x} {y} {duration}')

# 使用ADB命令滑动设备
def swipe_device(device, x1, y1, x2, y2, duration):
    '''
    滑动设备
    :param device:
    :param x1:
    :param y1:
    :param x2:
    :param y2:
    :param duration:
    :return:
    '''
    os.system(f'adb -s {device} shell input swipe {x1} {y1} {x2} {y2} {duration}')

# 使用ADB命令输入设备
def input_device(device, text):
    '''
    输入设备
    :param device:
    :param text:
    :return:
    '''
    os.system(f'adb -s {device} shell input text {text}')

# 回车
def enter(device):
    os.system(f'adb -s {device} shell input keyevent 66')
