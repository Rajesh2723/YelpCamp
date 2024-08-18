const express=require('express');
const app=express();
const path=require('path');
const mongoose=require('mongoose');
const methodOverride=require('method-override');//to make post,patch request
const Campground=require('./models/campground');
const joi=require('joi');
const ejsMate=require('ejs-mate');
const catchAsync=require('./utils/catchAsync');
const ExpressError=require('./utils/ExpressError');
app.set('view engine','ejs');

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
app.get('/makecampground',async (req,res)=>{
    const camp=new Campground(
        {title:'My Backyard'}
    );
     await camp.save();
    res.send(camp);
})
app.get('/campgrounds/new',(req,res)=>{ //order matters here (this must be first)
    res.render('campground/new');  
})
app.get('/campgrounds',catchAsync(async (req,res)=>{ //show all data
    const camp=await Campground.find({});
    res.render('campground/index',{camp});
}))

app.get('/campgrounds/:id',catchAsync(async (req,res)=>{ //set data for each one.
    const campground=await Campground.findById(req.params.id);
    res.render('campground/show',{campground});
}))
app.post('/campgrounds', catchAsync(async(req,res,next)=>{ //handled form of new.ejs
    //  if(!req.body.campground)throw new ExpressError('Invalid Campground Data',400);
    const campgroundSchema=Joi.object({
        campground:Joi.object({
            title:Joi.string.required(),
            price:Joi.number().required().min(0),
            image:Joi.string.required(),
            location:Joi.string.required(),
            description:Joi.string.required()
        }).required()
    })
    const result=campgroundSchema.validate(req.body);
    console.log(result);
        const campground=new Campground(req.body.campground);
        await campground.save();
         res.redirect(`/campgrounds/${campground._id}`); //     
    
                                                 
}))
app.get('/campgrounds/:id/edit',catchAsync(async (req,res)=>{
    const campground=await Campground.findById(req.params.id);
    res.render('campground/edit',{campground});
}))
app.put('/campgrounds/:id',catchAsync(async (req,res)=>{

    const {id}=req.params;
    const campground=await Campground.findByIdAndUpdate(id,{...req.body.campground});
    // res.redirect('/campground/show',{campground});
    res.redirect(`/campgrounds/${campground._id}`);
}))
app.delete('/campground/:id',catchAsync(async (req,res)=>{ //for deleting request
    const {id}=req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))
app.get('/',(req,res)=>{
    res.render('home');
    
})
app.all('*',(req,res,next)=>{
    next(new ExpressError('Page not Found!!',404))
    // res.send("404 !!!");
})
app.use((err,req,res,next)=>{
    const{statusCode=500 }=err;
    if(!err.message)err.message='Oh No,Something went Wrong!!'
    res.status(statusCode).render('error',{err});
})
app.listen(3000,()=>{
    console.log("Serving on port 3000");
})
