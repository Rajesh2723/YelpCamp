const express=require('express');
const router=express.Router();
const User=require('../models/user');
const catchAsync=require('../utils/catchAsync');
const passport=require('passport');
router.get('/register',(req,res)=>{
    res.render('users/register');
})
router.post('/register',catchAsync(async (req,res)=>{
    // res.send(req.body);
    try{
        const {email,username,password}=req.body;
    const user=new User({email,username});
    const registeredUser=await User.register(user,password);
    // if user registers then it should again go for login process
    req.login(registeredUser,err=>{
        if(err)return next(err);
        req.flash('success','Welcome to Yelp-camp');
        res.redirect('/campgrounds');
    })
    // console.log(registeredUser);
   
    }catch(e){
        req.flash('error', e.message);
        console.log("error flash message",e.message);
        res.redirect('register');
        
    }
    
}))
router.get('/login',(req,res)=>{
    res.render('users/login');
})
router.post('/login',passport.authenticate('local',{failureFlash:true,failureRedirect:'/login'}), (req,res)=>{
        req.flash('success','Welcome Back');
        res.redirect('/campgrounds');
})
router.get('/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
}); 
module.exports=router;
