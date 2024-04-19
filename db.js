const mongoose = require('mongoose');
mongoose.connect("mongodb+srv://ak2498315:omlVj4L5V9W7H5ny@cluster0.qeunvkq.mongodb.net/email")

const userSchema = new mongoose.Schema({
    username: {
       type: String,
        index:true,
        required: true,
        unique:true,
        sparse:true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        trim: true
    },
    location: String,
    age: String,
    workDetails: String,
    otp:String
});


const User= mongoose.model('User', userSchema);
module.exports ={
    User,
}
