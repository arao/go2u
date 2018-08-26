const mongoose =require('mongoose');
const Schema = mongoose.Schema;
const verifySchema = new Schema({
    key: {type: String, required:true, unique: true},
    user: {type: Schema.Types.ObjectId, required:true, ref:'user'},
}, {timestamps: true});
module.exports = mongoose.model('verify', verifySchema);