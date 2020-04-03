const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Post = new Schema({
    user: {type: Schema.Types.ObjectId, ref:'User'}, 
    date: {type:Date, default: Date.now},
    title: {type:String,minlength:1,maxlength:20},
    post: {type:String,minlength:1,maxlength:144}
    
});

module.exports = mongoose.model("Post", Post);

