import win32gui
import time


class Window:
    hwnd = None

    def __init__(self):
        time.sleep(3)
        self.hwnd = win32gui.GetForegroundWindow()

    def get_active_window(self):
        # Get the handle of the active window
        hwnd = win32gui.GetForegroundWindow()
        t = win32gui.GetWindowText(hwnd)
        return {"title": t, "hwnd": hwnd}

    def find_window_by_title(self, partial_title: str):
        def _window_enum_callback(hwnd, titles):
            # 获取窗口标题
            title = win32gui.GetWindowText(hwnd)
            # 检查标题是否包含部分字符串
            if partial_title.lower() in title.lower():
                titles.append({"hwnd": hwnd, "title": title})

        # 创建空列表存储匹配的窗口句柄
        matching_handles = []
        # 枚举所有顶层窗口
        win32gui.EnumWindows(_window_enum_callback, matching_handles)
        return matching_handles

    def set_window_size(self, hwnd, width, height):
        win32gui.MoveWindow(hwnd, 0, 0, width, height, True)


if __name__ == "__main__":
    w = Window()
    arr =  w.find_window_by_title("Clash for Windows")
    time.sleep(2)
    if len(arr) > 0:
        w.set_window_size(arr[0]["hwnd"], 800, 600)
