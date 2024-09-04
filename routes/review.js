
const express=require('express');
const router=express.Router({mergeParams:true});//for id merging in router
const catchAsync=require('../utils/catchAsync');
const Campground=require('../models/campground');
const Review=require('../models/review');
const ExpressError=require('../utils/ExpressError');


router.post('/',catchAsync (async(req,res)=>{ //for review for a perticular(id) campground 
    const campground=await Campground.findById(req.params.id);
    const review=new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
   //  console.log("review data",review);
    await campground.save();
    req.flash('success','Created a new Review');
//     res.send(campground);
   //  console.log("camground data",campground);
   res.redirect(`/campgrounds/${campground._id}`);
}))
router.delete('/:reviewId',catchAsync (async(req,res)=>{  
       const {id,reviewId}=req.params;
       console.log("this is coming",reviewId);
       await Campground.findByIdAndUpdate(id,{$pull:{reviews:reviewId}}); //[ref:review array,ref:review],array of review ids
       await Review.findByIdAndDelete(req.params.reviewId);
       req.flash('success','Successfully deleted a Review!!');
       res.redirect(`/campgrounds/${id}`);
}))

module.exports=router;
