const express = require('express');
const router = express.Router()
const auth = require('../../middleware/auth')
const {check , validationResult} = require("express-validator")
const Profile = require('../../models/Profile')
const User = require("../../models/User")
const request = require('request');
const config = require('config');

//@route    GET api/profile/me
//@desc     Get currwnt users profile
//@access   private
router.get('/me',auth,async(req,res)=>{
    try {
        const profile = await Profile.findOne({user:req.user.id}).populate('user',['name','avatar']);
     if(!profile){
         return res.status(400).json({msg:"their is no profile for the user"})
     }
      res.json(profile);  
    } catch (err) {
       console.log(err.message);
       res.status(500).send("Server Error")
    }
})


//@route    post api/profile
//@desc     create or update  users profile
//@access   private

router.post('/',[auth,[
    check('status','Status is required').not().isEmpty(),
    check('skills','Skills is required').not().isEmpty()
]
],async(req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
     const {
        company,
        website,
        location,
        bio,
        skills,
         status,
         githubusername,
         youtube,
         twitter,
         facebook,
         linkedin,
         instagram
    } = req.body;
 
    const profileFields = {}; 
    profileFields.user = req.user.id;
    if(company) profileFields.company = company;
    if(website) profileFields.website = website;
    if(location) profileFields.location = location;
    if(bio) profileFields.bio = bio;
    if(status) profileFields.status = status;
    if(githubusername) profileFields.githubusername = githubusername;
     if(skills) {
         profileFields.skills = skills.split(',').map(skill => skill.trim());
     }

    //Build social object
    profileFields.social = {}
    if(youtube) profileFields.social.youtube = youtube;
    if(twitter) profileFields.social.twitter = twitter;
    if(facebook) profileFields.social.facebook = facebook;
    if(linkedin) profileFields.social.linkedin = linkedin;
    if(instagram) profileFields.social.instagram = instagram;
     
    try {
       let profile =await Profile.findOne({user:req.user.id})
       if(profile){
           profile = await Profile.findOneAndUpdate(
               {user:req.user.id},
               {$set:profileFields},
               {new:true}
               );
               return res.json(profile);
       } 

       //Create

       profile = new Profile(profileFields);
       
       await profile.save();
       res.json(profile);
       
    } catch (err) {
        console.error(err.message);
        res.status(500).send('server error');
    }
}
)

//@route    get api/profile/all
//@desc     get all profiles
//@access   public

router.get('/all',async(req,res)=>{
    try {
         const allprofiles = await Profile.find().populate('user',['name','avatar']);
        res.json(allprofiles);
    }           
     catch (err) {
        console.error(err.message)
       res.status(500).send("server Error");
    }
})



//@route    get api/profile/user/:user_id
//@desc     get profile by user Id
//@access   public
router.get('/user/:user_id',async(req,res)=>{
    try {
         const profile= await Profile.findOne({user:req.params.user_id}).populate('user',['name','avatar']);
        if(!profile){
            return res.status(400).json({msg:"profile not found"})
        }
        res.json(profile);
    }           
     catch (err) {
        console.error(err.message)
        if(err.kind==="ObjectId"){
            return res.status(400).json({msg:"profile not found"}) 
        }
       res.status(500).send("server Error");
    }
})


//@route    Delete api/profile
//@desc     Delete profie,user& posts
//@access   private

router.delete('/',auth,async(req,res)=>{
    try {
    
    //remove profile
     await Profile.findOneAndRemove({user: req.user.id})

    //remove user
     await User.findOneAndRemove({_id: req.user.id})
        res.json({msg:"user deleted"});
    }           
     catch (err) {
        console.error(err.message)
       res.status(500).send("server Error");
    }
})


//@route    put api/profile/experience
//@desc     add profie experience
//@access   private
router.put('/experience',[auth,[
check('title','Title is required')
.not()
.isEmpty(),
check('company','company is required')
.not()
.isEmpty(),
check('from','From date is required')
.not()
.isEmpty()
]],async(req,res) =>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
   
 const {
     title,
     company,
     location,
     from,
     to,
     current,
     description
 } = req.body;

 const newExp = {
    title,
     company,
     location,
     from,
     to,
     current,
     description
 }
 
 try {     
   const profile = await Profile.findOne({user:req.user.id})
   profile.experience.unshift(newExp);

   await profile.save();

   res.json(profile);
 } catch (err) {
    console.error(err.message);
    res.status(500).send('server error');
 }
})


//@route    Delete api/profile/experience/exp_id
//@desc     Delete experience from profile
//@access   private
router.delete('/experience/:exp_id',auth,async(req,res)=>{
    try {     
        const profile = await Profile.findOne({user:req.user.id})
        
      //Get remove index
      const removeIndex = profile.experience
      .map(item => item.id)
      .indexOf(req.params.exp_id);
     
      profile.experience.splice(removeIndex,1);

      await profile.save();

      res.json(profile);
      } catch (err) {
         console.error(err.message);
         res.status(500).send('server error');
      }
     })




//@route    put api/profile/education
//@desc     add profie education
//@access   private
router.put('/education',[auth,[
    check('school','school is required')
    .not()
    .isEmpty(),
    check('degree','degree is required')
    .not()
    .isEmpty(),
    check('fieldofstudy','fieldofstudy  is required')
    .not()
    .isEmpty(),
    check('from','from  is required')
    .not()
    .isEmpty()
    ]],async(req,res) =>{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({errors:errors.array()})
        }
       
     const {
         school,
         degree,
         fieldofstudy,
         from,
         to,
         current,
         description
     } = req.body;
    
     const newEdu= {
        school,
         degree,
         fieldofstudy,
         from,
         to,
         current,
         description
     }
     
     try {     
       const profile = await Profile.findOne({user:req.user.id})
       profile.education.unshift(newEdu);
    
       await profile.save();
    
       res.json(profile);
     } catch (err) {
        console.error(err.message);
        res.status(500).send('server error');
     }
    })
    
    
    //@route    Delete api/profile/education/exp_id
    //@desc     Delete education from profile
    //@access   private
    router.delete('/education/:edu_id',auth,async(req,res)=>{
        try {     
            const profile = await Profile.findOne({user:req.user.id})
            
          //Get remove index
          const removeIndex = profile.education
          .map(item => item.id)
          .indexOf(req.params.edu_id);
         
          profile.education.splice(removeIndex,1);
    
          await profile.save();
    
          res.json(profile);
          } catch (err) {
             console.error(err.message);
             res.status(500).send('server error');
          }
         })
         

    //@route    Delete api/profile/github/:username
    //@desc     Get user repos from Github
    //@access   public
  router.get('/github/:username',(req,res)=>{
      try {
          const options ={
            uri:`https://api.github.com/users/${req.params.username}/repos?per_page=5&
            sort=created:asc&client_id=${config.get('githubClientId')}&client_secret=
            ${config.get('githubSecret')}`,
            method:'GET',
            headers:{'user-agent':'node.js'}
          };
          request(options,(error,response,body)=>{
            if(error) console.error(error);
          
             if(response.statusCode !== 200){
                 res.status(404).json({msg:"No Github profile found"});
             }
                
             res.json(JSON.parse(body));
          })
      } catch (err) {
        console.error(err.message);
             res.status(500).send('server error');
      }
  })

module.exports = router;

