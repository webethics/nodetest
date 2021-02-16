const config = require("config");
const jwt = require("jsonwebtoken");
const express = require("express");
const Joi = require("joi");
const bcrypt = require("bcryptjs");
const _ = require("lodash");
const db = require("../models/index");
const schemas = require('../validation/schema'); 
const router = express.Router(); //api/users

// User Login
router.post("/", async (req, res) => {
  const { error } = Joi.validate(req.body, schemas.UserLogin);
  
  if (error) return res.status(200).send({success:false,message:error.details[0].message});

  // Replace below line with `await` database search for users
  const user = await db.User.findOne({
    where: {
      email: req.body.email
    }
  });

  if (!user) return res.status(200).send({success:false,message:"Invalid email or password"});

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(200).send({success:false,message:"Invalid email or password"});

  const token = user.generateAuthToken();

  res.send({success:true,token:token});
});

module.exports = router;
