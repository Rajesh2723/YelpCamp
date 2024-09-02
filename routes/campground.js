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
const {isLoggedIn}=require('../middleware');
const multer = require('multer');
// console.log(__dirname);
const {storage}=require('../cloudinary');
const upload=multer({ storage});
const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;
const app = express();

app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs'); // or 'pug', 'hbs' etc.

router.get('/',catchAsync(async (req,res)=>{ //show all data
    const camp=await Campground.find({});
    // res.send("router is working!!");
    res.render('campground/index',{camp});
}))

const isAuthor= async(req,res,next)=>{
    const {id}=req.params;
    const campground=await Campground.findById(id);
    if(!campground.author.equals(req.user._id)){
        req.flash('error','you dont have permission ');
       return  res.redirect(`/campgrounds/${id}`);
    }
    next();
}


router.get('/new',isLoggedIn,(req,res)=>{ //order matters here (this must be first)
    
    res.render('campground/new');  
})
router.get('/:id',isLoggedIn,catchAsync(async (req,res)=>{ //set data for each one.
    const campground=await Campground.findById(req.params.id).populate('reviews').populate('author');
    console.log(campground);
    res.render('campground/show',{campground});
}))
router.post('/',isLoggedIn,upload.array('image'), catchAsync(async(req,res,next)=>{ //handled form of new.ejs
    //  if(!req.body.campground)throw new ExpressError('Invalid Campground Data',400);
    const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.features[0].geometry;
    // res.send(geoData.features[0].geometry ); 
        const { id } = req.params;
        campground.images=req.files.map(f=>({url:f.path,filename:f.filename}));
        campground.author=req.user._id;
        console.log("User id:",req.user._id);
        req.flash('success','Successfully made a new campground!!');
        await campground.save();
        console.log(campground);
         res.redirect(`/campgrounds/${campground._id}`); //    
    // console.log(req.file);
    // console.log(req.body,req.files);
    // res.send("It worked!!");
                                       
}))
router.get('/:id/edit',isLoggedIn,isAuthor,catchAsync(async (req,res)=>{
    
    const campground=await Campground.findById(req.params.id);
    res.render('campground/edit',{campground});
}))
router.put('/:id',isLoggedIn,isAuthor,upload.array('image'),catchAsync(async (req,res)=>{//updating the campground

    const { id } = req.params;
    const campground=await Campground.findByIdAndUpdate(id,{...req.body.campground});
    const imgs=req.files.map(f=>({url:f.path,filename:f.filename}));
    campground.images.push(...imgs);
     await campground.save();
     if(req.body.deleteImages){
       await campground.updateOne({$pull:{images:{filename:{$in:req.body.deleteImages}}}});
       console.log(campground);
     }
    // res.redirect('/campground/show',{campground});
    req.flash('success','Successfully Updated campground');
    res.redirect(`/campgrounds/${campground._id}`);
}))
router.delete('/:id',isLoggedIn,catchAsync(async (req,res)=>{ //for deleting request
    
    const {id}=req.params;
    
    console.log("this is 2coming!!",id);
    await Campground.findByIdAndDelete(id);
    
    res.redirect('/campgrounds');
}))
app.use((err,req,res,next)=>{
    const{statusCode=500 }=err;
    if(!err.message)err.message='Oh No,Something went Wrong!!'
    res.status(statusCode).render('error',{err});
})
module.exports=router;
