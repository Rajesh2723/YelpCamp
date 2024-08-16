const mongoose=require('mongoose');
const Schema=mongoose.Schema;   // so that we can use Schema.Type.something

const CampgroundSchema=new Schema({ //here no need to call mongoose.Schema 
    title:String,
    price:String,
    description:String,
    location:String
});


module.exports=mongoose.model('Campground',CampgroundSchema); //exporting Campground model(only model not a file)
