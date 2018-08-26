const mongoose =require('mongoose');
const md5 = require('crypto-js/md5');
const Schema = mongoose.Schema;
const urlSchema = new Schema({
    shortUrl: {type: String, required:true, unique: true, index:true},
    longUrl: {type: String, required:true},
    hash :{type: String, index: true},
    user: { type: Schema.Types.ObjectId, ref: 'user' }
}, {timestamps: true});

async function hash(){
    url = this;
    url.hash = md5(url.longUrl).toString();
}

urlSchema.pre('save',hash);

module.exports = mongoose.model('url', urlSchema);