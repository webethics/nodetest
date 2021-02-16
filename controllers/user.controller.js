const config = require("config");
const jwt = require("jsonwebtoken");
const express = require("express");
const Joi = require("joi");
const schemas = require('../validation/schema'); 
const bcrypt = require("bcryptjs");
const _ = require("lodash");
const db = require("../models/index");
const nodemailer = require("nodemailer");
const PasswordComplexity = require("joi-password-complexity");

const router = express.Router(); //api/users

// Init email config
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_LOGIN,
    pass: process.env.EMAIL_PASSWORD
  }
});

// User Registration
exports.createUser =  async (req, res, next) => {
    try {
      const { error } = Joi.validate(req.body, schemas.userPost);
      if (error) { 
        const { details } = error; 
        const message = details.map(i => i.message).join(',');
        //console.log("error", message); 
        res.status(422).json({ success:false,message: message,result:[] }) 
      }
       
     } catch (err) {
      return res.status(400).send({success:false,message:err.details[0].message,result:[]});
    }
   //Check user exist or not 
    const userFound = await db.User.findOne({
      where: {
        email: req.body.email
      }
    });
  
    if (userFound) return res.status(400).send({success:false,message:"User already registered",result:[]});
  
    // Create new user
    let user = await db.User.build({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password
    });
    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  
    user = await user.save();
  
    const token = user.generateAuthToken();
  
    res.header("x-auth-token", token).send({success:true,result:_.pick(user, ["username", "email"]),message:"Register Successfully."});
  };


  // post to generate reset password url
  exports.resetPasswordUrl = async (req, res,next) => {
    let user;
    console.log(req.params.email);
    try {
      user = await db.User.findOne({
        where: { email: req.params.email }
      });
    } catch (err) {
      return res.status(200).send({success:false,message:"Error reading from database"});
    }
    if (!user) {
      return res.status(200).send({success:false,message:"Email never registered."});
    }
    // Generate one-time use URL with jwt token
    const secret = `${user.password}-${user.createdAt}`;
    const token = jwt.sign({ id: user.id }, secret, {
      expiresIn: 3600 // expires in 1 hour
    });
    const url = `localhost:${process.env.PORT ||
      3000}/users/receive_new_password/${user.id}/${token}`;
  
    const emailTemplate = {
      subject: "Password Reset Node Auth Application",
      html: `
        <p>Hello ${user.username},</p>
        <p>You recently requested to reset your password.</p>
        <p>Click the following link to finish resetting your password.</p>
        <a href=${url}>${url}</a>`,
      from: process.env.EMAIL_LOGIN,
      to: user.email
    };

    const sendEmail = async () => {
      try {
        //const info = await transporter.sendMail(emailTemplate);
        //console.log("Email sent", info.response);
        return res.status(200).send({success:false,message:"Email sent SuccessFullybb",result:url});
      } catch (err) {
        console.log(err);
        return res.status(200).send({success:false,message:"Error sending email"});
      }
    };
  
    sendEmail();
  }
  // post to verify reset password url
   exports.resetPassword =  async (req, res, next) => {
    // First parse request object
    // Get id and token within params, and new password in body
    const { id, token } = req.params;
    const { password } = req.body;
    // Validate new password
    try {
      await Joi.validate(
        { password },
        {
          password: new PasswordComplexity().required()
        }
      );
    } catch (err) {
      return res.status(200).send({success:false,message:err.details[0].message});
    }
    // get user from database with id
    let user;
    try {
      user = await db.User.findOne({
        where: { id }
      });
    } catch (err) {
      return res.status(200).send({success:false,message:"Error reading database"});
    }
    if (!user) return res.status(200).send({success:false,message:"No user with that id"});
    // Generate secret token
    const secret = `${user.password}-${user.createdAt}`;
    // Verify that token is valid
    const payload = jwt.decode(token, secret);
    if (!payload) {
      return res.status(200).send({success:false,message:"Invalid id or token"});
    }
    if (payload.id != id) {
      return res.status(200).send({success:false,message:"Invalid id or token"});
    }
    // Hash new password and store in database
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user = await user.save();
    return res.status(200).send({success:true,message:"Password Reset Success!"});
  };


  exports.findAll = async(req, res,next) => {
    let users;
    users = await db.User.findAll({});

    return res.status(200).send(users);
    // db.User.findAll((err, data) => {
    //   if (err)
    //     res.status(500).send({
    //       message:
    //         err.message || "Some error occurred while retrieving customers."
    //     });
    //   else res.send(data);
    // });
  };