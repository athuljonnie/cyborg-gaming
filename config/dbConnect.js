const mongoose = require("mongoose")

const dbConnect =async () => {
    try{
    const conn = await mongoose.connect('mongodb+srv://admin:admin@cyborg.phk00tk.mongodb.net/cyborg?retryWrites=true&w=majority')
        console.log('database connected successfully');
}
 catch(error){
console.log('database error');
 }
};

module.exports = dbConnect;