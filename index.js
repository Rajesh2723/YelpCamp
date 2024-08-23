const express=require('express');
const app=express();
const path=require('path');
const mongoose=require('mongoose');
const methodOverride=require('method-override');//to make post,patch request
const Campground=require('./models/campground');
const Joi=require('joi');
const Review=require('./models/review');
const ejsMate=require('ejs-mate');
const catchAsync=require('./utils/catchAsync');
const ExpressError=require('./utils/ExpressError');
const campground = require('./models/campground');
const review = require('./models/review');
const campgrounds=require('./routes/campground');
app.set('view engine','ejs');
const reviews=require('./routes/review');
app.use(methodOverride('_method'));

 
mongoose.connect('mongodb://localhost:27017/yelp-camp',{ //connecting mongoDb
    useNewUrlParser: true,
    useUnifiedTopology: true
});
app.engine('ejs',ejsMate)//ejs-mate 
app.use(express.urlencoded({extended:true}))  //  parsing data of json
const db=mongoose.connection;
db.on("error",console.error.bind(console,"connection error"));
db.once("open",()=>{
    console.log("DataBase is Connected!!");
})

app.set('views',path.join(__dirname,'views'));
// const validateCampground=(req,res,next)=>{
//     const campgroundSchema=Joi.object({
//         campground:Joi.object({
//             title:Joi.string.required(),
//             price:Joi.number().required().min(0),
//             image:Joi.string.required(),
//             location:Joi.string.required(),
//             description:Joi.string.required()
//         }).required()
//     })
//     const {error}=campgroundSchema.validate(req.body);
//     if(error){
//         const msg=error.details.map(el=>el.message).join(',');
//         throw new ExpressError(msg,400);
//     }else{
//         next();
//     }

// }
app.use('/campgrounds',campgrounds);
app.use('/campgrounds/:id/reviews',reviews);
app.get('/makecampground',async (req,res)=>{
    const camp=new Campground(
        {title:'My Backyard'}
    );
     await camp.save();
    res.send(camp);
})
app.get('/',(req,res)=>{
    res.render('home');
    
})
// app.all('*',(req,res,next)=>{
//     next(new ExpressError('Page not Found!!',404))
//     // res.send("404 !!!");
// })
app.use((err,req,res,next)=>{
    const{statusCode=500 }=err;
    if(!err.message)err.message='Oh No,Something went Wrong!!'
    res.status(statusCode).render('error',{err});
})
app.listen(3000,()=>{
    console.log("Serving on port 3000");
})
