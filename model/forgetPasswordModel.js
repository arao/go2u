const mongoose =require('mongoose');
const Scheme = mongoose.Schema;
const sha256 = require('crypto-js/sha256');

const forgetPassword = new Scheme({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    hash:{type: String, required:true, unique: true},
    expiredAt: {type: Date}
},{timestamp: true});


function forgetHash() {
    let forget = this;
    // let currentDate = (new Date()).getTime();
    // forget.hash =  sha256.digest(user+process.env.SECRET+currentDate).toString();
    let t = new Date();
    forget.expiredAt = new Date( new Date(t.getFullYear(), t.getMonth(), t.getDate()+1));
}


forgetPassword.pre('save', forgetHash);


module.exports = mongoose.model('forgetPassword', forgetPassword);
