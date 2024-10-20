// 导入http模块
const http = require("http");

// 创建HTTP服务器
const server = http.createServer((req, res) => {
  if (req.url === "/test" && req.method === "GET") {
    // 设置响应头
    res.writeHead(200, { "Content-Type": "text/plain" });
    // 返回
    res.end("Hello World");
  } else {
    // 如果请求不是/test，则返回404错误
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  }
});

// 监听3000端口
server.listen(5050, () => {
  console.log("runing test server on port 5050");
});
