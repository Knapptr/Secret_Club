const mongoose = require('mongoose');
const moment = require('moment');

const Schema = mongoose.Schema;

const Post = new Schema({
    user: {type: Schema.Types.ObjectId, ref:'User'}, 
    date: {type:Date, default: Date.now},
    title: {type:String,minlength:1,maxlength:20},
    post: {type:String,minlength:1,maxlength:144}
    
});

Post.virtual('relTime').get(function () {
    return moment(this.date).fromNow()
})

Post.virtual('formatDate').get(function () {
    return moment(this.date).format("MMM D, YYYY h:mm a")
})

module.exports = mongoose.model("Post", Post);


