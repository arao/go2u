const mongoose =require('mongoose');
const Schema = mongoose.Schema;
const counterSchema = new Schema({
    name:{type:String, unique:true, required:true, default:'counter'},
    value: {type: Number, required: true, default:1}
}, {timestamps: true});
module.exports = mongoose.model('counter', counterSchema);