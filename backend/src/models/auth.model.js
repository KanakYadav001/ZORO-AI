const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    fullName : {
        firstName : {
            type: String, required: true
        },
        lastName : {
            type: String,
            required: true
        }
    },
    password: { type: String, required: true },
},{timestamps:true});



const UserModel = mongoose.model('Users', UserSchema);

module.exports = UserModel;