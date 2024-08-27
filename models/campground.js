const mongoose=require('mongoose');
const Review=require('./review');
const Schema=mongoose.Schema;   // so that we can use Schema.Type.something

const CampgroundSchema=new Schema({ //here no need to call mongoose.Schema 
    title:String,
    image:String,
    price:Number,
    description:String,
    location:String,
    author:{
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref:'Review'     //exporting in review file
        }
    ]
});
//one to many relationship because one campground can have any number of reviews
CampgroundSchema.post('findOneAndDelete', async function(doc){ //middle ware to delete (if campground delete means review also gets deleted)
     if(doc){
        await Review.deleteMany({
            _id:{
                $in:doc.reviews
            }
        })
     }
})


module.exports=mongoose.model('Campground',CampgroundSchema); //exporting Campground model(only model not a file)
