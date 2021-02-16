const jwt = require("jsonwebtoken");

module.exports = function(req, res, next) {
  //const token = req.header("x-auth-token");
  const token =  req.body.token || req.query.token || req.headers['token'] || req.headers['admin_token'] || req.header("x-auth-token");
  if (!token) return res.status(200).send({success:false,message:"Access denied. No token provided."});

  try {
    const decoded = jwt.verify(token, process.env.jwtPrivateKey);
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(200).send({success:false,message:"Invalid token."});
  }
};
