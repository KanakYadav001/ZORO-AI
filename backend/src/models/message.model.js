const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chats', required: true },
    content : { type: String, required: true },
    role : {
        type: String,
        enum: ['user', 'model'],
        default: 'user'
    }
},{timestamps:true});



const MessageModel = mongoose.model('Messages', MessageSchema);

module.exports = MessageModel;  