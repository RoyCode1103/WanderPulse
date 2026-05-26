const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

let PORT = 8080;

//setting up database
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/WanderPulse');
}

main()
.then((res)=>{
    console.log("Connected to DB");
})
.catch((err)=>{
    console.log(err);
});

const initDB = async () =>{
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj)=> ({...obj, owner: "6a106838487b74771f9cc40c"}));
    await Listing.insertMany(initData.data);
    console.log("Data was initilized");
}

initDB();