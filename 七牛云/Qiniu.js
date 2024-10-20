const qiniu = require("qiniu");
const config = {
  ACCESS_KEY: "ACCESS_KEY",
  SECRET_KEY: "SECRET_KEY",
  bucket: "qimeng-cloud",
  basepath: "static/jx3/user",
};

const mac = new qiniu.auth.digest.Mac(config.ACCESS_KEY, config.SECRET_KEY);

//构建上传策略函数
exports.getUptoken = function (name) {
  const path = `${config.basepath}/${name}`;
  var putPolicy = new qiniu.rs.PutPolicy({ scope: `${config.bucket}:${path}` });
  return { token: putPolicy.uploadToken(mac), path };
};
