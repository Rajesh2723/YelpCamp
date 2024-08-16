const mongoose=require('mongoose');
const Campground=require('../models/campground'); //go one level up from this localtion to find /models/campground
const cities=require('./cities');
const {places,descriptors}=require('./seedHelpers');

// app.set('view engine','ejs');

mongoose.connect('mongodb://localhost:27017/yelp-camp',{ //connecting mongoDb
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const db=mongoose.connection;
db.on("error",console.error.bind(console,"connection error"));
db.once("open",()=>{
    console.log("DataBase is Connected!!");
})

const sample=array=>array[Math.floor(Math.random()*array.length)];
//  console.log(sample);

const seedDB=async ()=>{    //async _>promises.
    await Campground.deleteMany({});
    for(let i=0;i<50;i++){
        const random1000=Math.floor(Math.random()*1000);
        const price=Math.floor(Math.random()*20)+10;
        const camp=new Campground({
            location:`${cities[random1000].city},${cities[random1000].state}`,//string literal

            title:`${sample(descriptors)}, ${sample(places)}`,
            image: `https://picsum.photos/400?random=${Math.random()}`,
            description:'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Modi quia fugit consequatur nulla vel laboriosam laborum quis quo explicabo recusandae. Quis saepe odio veritatis consectetur neque nam nesciunt totam doloribus!',
            price
            // console.log(sample(descriptors))
        })
        await camp.save();
    }
}
seedDB().then(()=>{   //promises  executed 
    mongoose.connection.close();
}); //execute seedDB
