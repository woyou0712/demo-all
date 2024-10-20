# Mention 提及

纯 JS 插件，无依任何赖，兼容原生 HTML 及各大前端框架，提供高自由度接口

- [查看 demo 示例](http://mention.bauble.vip)
- [QQ 群](https://qm.qq.com/q/LqSPY7LrGM)

## 安装

```bash
npm install hi-mention --save
```

## 引入

```js
import Mention from "hi-mention";
```

## VUE 使用示例

```html
<template>
  <div class="editor-content"></div>
</template>

<script lang="ts" setup>
  import { onMounted } from "vue";
  // 引入插件
  import Mention from "hi-mention";
  // 引入插件样式
  import "hi-mention/index.css";

  onMounted(() => {
    new Mention(".editor-content", {
      users: [
        { name: "张三", id: 1 },
        { name: "李四", id: 2 },
        { name: "王五", id: 3 },
        { name: "赵六", id: 4 },
        { name: "钱七", id: 5 },
        { name: "孙八", id: 6 },
        { name: "周九", id: 7 },
        { name: "吴十", id: 8 },
      ],
    })
      .on("focus", (e) => {
        console.log("focus", e);
      })
      .on("blur", (e) => {
        console.log("blur", e);
      })
      .on("change", (d) => {
        console.log("change", d?.html);
        msg.value = d?.html || "";
      });
  });
</script>

<style>
  .editor-content {
    width: 500px;
    height: 200px;
    border: 1px solid #ccc;
    padding: 5px 10px;
  }
</style>
```

## 参数

| 参数               | 说明                                          | 类型          | 默认值    |
| ------------------ | --------------------------------------------- | ------------- | --------- |
| `trigger`          | 触发字符                                      | `string`      | `@`       |
| `media`            | 媒体类型（`PC` 和 `H5` 的用户列表展示有差异） | `PC`/`H5`     | `PC`      |
| `placeholder`      | 占位符                                        | `string`      | `请输入`  |
| `placeholderColor` | 占位符颜色                                    | `string`      | `#aaa`    |
| `usersWdith`       | 用户列表宽度（`media`=`PC`时有效）            | `string`      | `200px`   |
| `usersHeight`      | 用户列表最大高度                              | `string`      | `200px`   |
| `users`            | 用户列表                                      | `Array<User>` | `[]`      |
| `idKey`            | `User`对象`id`字段(该字段支持`@搜索`)         | `string`      | `id`      |
| `nameKey`          | `User`对象`name`字段(该字段支持`@搜索`)       | `string`      | `name`    |
| `pingyinKey`       | `User`对象`pingyin`字段(该字段支持`@搜索`)    | `string`      | `pingyin` |
| `avatarKey`        | `User`对象`avatar`字段                        | `string`      | `avatar`  |

## API

| 方法          | 说明                             | 类型                                         | 备注 |
| ------------- | -------------------------------- | -------------------------------------------- | ---- |
| `on`          | 监听事件                         | `(key:EventType,fn:(data?:any)=>void)=>this` | -    |
| `updateUsers` | 更新用户列表                     | `(users:Array<User>)=>this`                  | -    |
| `updateMedia` | 更新媒体类型                     | `(media:"PC"/"H5")=>this`                    | -    |
| `clear`       | 清空输入框                       | `()=>this`                                   | -    |
| `insertText`  | 在光标位置插入文本内容           | `(text:string)=>this`                        | -    |
| `insertHtml`  | 在光标位置插入 HTML 内容         | `(html:Element)=>this`                       | -    |
| `focus`       | 获取焦点、将光标移动到输入框末尾 | `()=>this`                                   | -    |
| `getData`     | 获取输入框内容                   | `()=>{html:string,text:string}`              | -    |
| `getMentions` | 获取输入框内提及的用户对象列表   | `()=>Array<User>`                            | -    |
| `mentionUser` | 提及用户                         | `(user:User)=>this`                          | -    |

### EventType

| 类型           | 说明     | 备注 |
| -------------- | -------- | ---- |
| `input`        | 输入事件 | -    |
| `focus`        | 获取焦点 | -    |
| `blur`         | 失去焦点 | -    |
| `keydown`      | 键盘按下 | -    |
| `keyup`        | 键盘抬起 | -    |
| `change`       | 内容改变 | -    |
| `mention-user` | 提及用户 | -    |

### User 类型

- 以下字段为推荐字段，若字段不存在，请使用`idKey`、`nameKey`、`pingyinKey`、`avatarKey`字段进行配置

| 字段名    | 必须 | 说明                                                 | 类型      |
| --------- | ---- | ---------------------------------------------------- | --------- |
| `id`      | 否   | 键（该字段支持@查询）                                | `string`  |
| `name`    | 否   | 名字（该字段支持@查询）                              | `string`  |
| `pingyin` | 否   | 拼音（该字段支持@查询）                              | `string`  |
| `avatar`  | 否   | 头像                                                 | `string`  |
| `element` | 否   | 用户列表中展示的元素，若不提供该字段，则使用默认样式 | `Element` |

## 允许子类继承重写方法

| 接口名              | 说明                  | 类型                   | 备注                                      |
| ------------------- | --------------------- | ---------------------- | ----------------------------------------- |
| `createUserElement` | 创建用户选项`Element` | `(user:User)=>Element` | -                                         |
| `openUserList`      | 打开用户列表          | `(query:User)=>this`   | `query`:为用户输入`@`时后面跟的查询字符串 |

- 继承示例

```javascript
// 引入插件
import Mention from "hi-mention";
// 引入插件样式
import "hi-mention/index.css";

// 创建自定义的 Mention 组件
class MyMention extends Mention {
  constructor(props) {
    super(props);
  }

  // 打开用户列表，重写该方法会导致默认的用户列表被覆盖
  openUserList(query) {
    console.log("@后面的查询字符串", query);
  }

  // 该方法返回的元素将被展示在默认用户列表中
  createUserElement(user) {
    const { name, avatar } = user;
    const img = document.createElement("img");
    img.src = avatar;
    img.style.width = "20px";
    img.style.height = "20px";
    img.style.marginRight = "5px";
    const span = document.createElement("span");
    span.innerText = name;
    const div = document.createElement("div");
    div.appendChild(img);
    div.appendChild(span);
    // 该元素将被当成选项展示在用户列表中
    return div;
  }
}
```
