import json

def get_account():
    # 打开文件
    with open("./account.json", 'r', encoding='utf-8') as file:
        # 读取JSON数据
        data = json.load(file)
    return data
