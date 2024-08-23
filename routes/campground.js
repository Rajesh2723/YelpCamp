const express=require('express');
const router=express.Router( );
const path=require('path');
const mongoose=require('mongoose');
const methodOverride=require('method-override');//to make post,patch request
const Campground=require('../models/campground');
const catchAsync=require('../utils/catchAsync');
const ExpressError=require('../utils/ExpressError');
const review = require('../models/review');
const Review=require('../models/review');
const ejsMate=require('ejs-mate');
 
const app = express();

app.set('view engine', 'ejs'); // or 'pug', 'hbs' etc.

router.get('/',catchAsync(async (req,res)=>{ //show all data
    const camp=await Campground.find({});
    // res.send("router is working!!");
    res.render('campground/index',{camp});
}))
router.get('/new',(req,res)=>{ //order matters here (this must be first)
    res.render('campground/new');  
})
router.get('/:id',catchAsync(async (req,res)=>{ //set data for each one.
    const campground=await Campground.findById(req.params.id).populate('reviews');
    // console.log(campground);
    res.render('campground/show',{campground});
}))
router.post('/', catchAsync(async(req,res,next)=>{ //handled form of new.ejs
    //  if(!req.body.campground)throw new ExpressError('Invalid Campground Data',400);
   
        const campground=new Campground(req.body.campground);
        await campground.save();
         res.redirect(`/campgrounds/${campground._id}`); //                                       
}))
router.get('/:id/edit',catchAsync(async (req,res)=>{
    const campground=await Campground.findById(req.params.id);
    res.render('campground/edit',{campground});
}))
router.put('/:id',catchAsync(async (req,res)=>{

    const {id}=req.params;
    const campground=await Campground.findByIdAndUpdate(id,{...req.body.campground});
    // res.redirect('/campground/show',{campground});
    res.redirect(`/campgrounds/${campground._id}`);
}))
router.delete('/:id',catchAsync(async (req,res)=>{ //for deleting request
    
    const {id}=req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))
app.use((err,req,res,next)=>{
    const{statusCode=500 }=err;
    if(!err.message)err.message='Oh No,Something went Wrong!!'
    res.status(statusCode).render('error',{err});
})
module.exports=router;
