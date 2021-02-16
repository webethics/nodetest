var express = require('express');
//var userRoutes = express.Router();
var userRoutes = express();
var UserController = require('../controllers/user.controller.js');

var VerifyToken = require('../middleware/auth');
// Create new user
userRoutes.post("/", UserController.createUser);

// post to generate reset password url
userRoutes.post("/reset_password/:email", UserController.resetPasswordUrl);

// post to verify reset password url
userRoutes.post("/receive_new_password/:id/:token", UserController.resetPassword);

userRoutes.get("/", VerifyToken,UserController.findAll);

module.exports = userRoutes;