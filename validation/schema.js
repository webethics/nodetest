const Joi = require('joi') 
const PasswordComplexity = require("joi-password-complexity");
const schemas = {
    //User registeration validation 
    userPost:
    Joi.object().keys({ 
            username: Joi.string().min(5).max(50).required(),
            email: Joi.string().min(5).max(255).email().required(),
            password: new PasswordComplexity().required()
      }), 

    //Userlogin validation 
     UserLogin: 
     Joi.object().keys({  
         email: Joi.string().min(5).max(255).required(),
         password: Joi.string().min(5) .max(255).required()
    }), 


  };
module.exports = schemas;