const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const User = new Schema({
    first_name: { type: String, required: true, minlength: 1 },
    last_name: { type: String, required: true, minLength: 1 },
    username: { type: String, required: true, minlength: 1 },
    password: { type: String, required: true, minlength: 1 },
    posts: [{ type: Schema.Types.ObjectId, ref: "Post" }],
    innerCircle: { type: Boolean, default: false },
    admin: {type:Boolean,default:false},
    
});

module.exports = mongoose.model("User", User);

