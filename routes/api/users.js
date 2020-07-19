const express = require('express');
const router = express.Router();
const gravatar = require("gravatar")
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')


const config = require('config')
const User = require('../../models/User')

const {check , validationResult} = require("express-validator")

//@route    POST api/users
//@desc     Register user
//@access   Public
router.post("/",[
    check('name','Name is required').not().notEmpty(),
    check('email','please enter a email').isEmail(),
    check('password','Please enter a password with 6 0r mmore than 6 characters').isLength({min:5})
],

async(req,res) => {  
     try {

        const errors = validationResult(req)
    
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
     
    const {name,email,password} = req.body;


    //see if user exists
    let user = await User.findOne({email})
    if(user){
      return  res.status(500).json({errors:[{msg:"user already exists"}]})
    }
    
    //Get users gravatar
    const avatar =gravatar.url(email,{
        s:'200',
        r:'pg',
        d:'mm'
    })  

    user = new User({
        name,email,password,avatar
    })

    //password Hashing 
       const salt = await bcrypt.genSalt(10);
       user.password = await bcrypt.hash(password,salt);

      await user.save();
       
    //Return jsonwebtoken
    const payload ={
          user:{
              id:user.id
          }
    }
       
     jwt.sign(payload,config.get('jwtSecret'),
     {
         expiresIn:360000
     },
     (err,token)=>{
         if(err) throw err;
         res.json({token});
        }
     );

    
     } catch (err) {
         console.error(err.message);
         res.status(500).send('server error')
     }

});


module.exports = router;