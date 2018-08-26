const mongoose =require('mongoose');
const bcrypt = require('bcrypt');
const Scheme = mongoose.Schema;
const saltRound = require('../config/bcrypt').saltRound;
const userSchema = new Scheme({
    name:{type: String, },
    password:{type: String, required:true},
    email: {type:String, unique: true, required: true,  index:true},
    verified: {type: Boolean, default: false}
},{timestamp: true});


async function hashPassword() {
    let user = this;
    user.password = await bcrypt.hash(user.password, saltRound);
}


userSchema.pre('save', hashPassword);


module.exports = mongoose.model('user', userSchema);
