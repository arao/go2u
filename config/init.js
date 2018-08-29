const UserModel = require('../model/userModel');
const CounterModel = require('../model/counterModel');
const mongoose = require('mongoose');
const credentials = require('./credentials');
const debug = require('debug')('mixdown:init');
const urlModel = require('../model/urlModel');
const counterDefault = credentials.default.counter;
const userDefault = credentials.default.user;
const secretRoutePath = credentials.default.specialRoutes;



async function mongooseInIt(){
    try {
        let db = await mongoose.connect(process.env.DB_URI, {useNewUrlParser: true})
        debug('connected to db');
        return Promise.resolve(db);
    }catch(err){
        err.node = err.node?err.node+='\n':"";
        err.node += "config:mongooseInit";
        return Promise.reject(err);
    }
    finally {
        mongoose.connection.on('disconnected', () => {
            debug(`db connection disconnected `);
        });
        process.on('SIGINT', ()=>{
            console.log('System shutdown command received');
            console.log('Terminating db connection');
            mongoose.connection.close();
            console.log('db connection terminated');
            console.log('Server Shutdown');
            process.exit(0);
        });
    }

}
async function counterInit(){
    try {
        let counter = await CounterModel.findOne({'name': counterDefault.name});
        if(!counter){
            let counter = new CounterModel(counterDefault);
            await counter.save();
        }
        return Promise.resolve(counter)
    }catch(err){
        err.node = err.node?err.node+='\n':"";
        err.node += "config:CounterInit";

        return Promise.reject(err);
    }
}
async function userInit(){
    try {
        let user = await UserModel.findOne({'username': userDefault.username});
        if(!user){
            user = new UserModel(userDefault);
            await user.save();
        }
        return Promise.resolve(user);
    }catch(err){
        err.node = err.node?(err.node+='\n'):'';
        err.node += "config:UserInit";
        return Promise.reject(err);
    }
}
async function secredRoutes(){
    try{
        for(let secredPath of secretRoutePath){
            if(! await urlModel.findOne(secredPath)){
                let secredWay = new urlModel();
                secredWay.longUrl = secredPath.longUrl;
                secredWay.shortUrl = secredPath.shortUrl;
                secredWay.user = process.env.Anonymous;
                await secredWay.save();
            }
        }
    }catch(err){
        debug(err.message);
        debug("Secred Routes Failed to Initialise");
    }
}

module.exports = {
    async init() {
        try {
            debug('System Initialising');
            await mongooseInIt();
            // debug('mongooseInit Done');
            // debug('counterInit');
            await counterInit();
            // debug('userInit');
            process.env.Anonymous = mongoose.Types.ObjectId((await userInit()).toObject()._id);
            await secredRoutes();
            // debug('secredRoutes init Done');
            debug('initialisation complete');
        }catch(err){
            err.node = err.node?err.node+='\n':"";
            err.node += "config:Init";
            console.log(err);
            process.exit(1);
        }finally {
            // debug(process.env.Anonymous);
            // debug(typeof process.env.Anonymous);
        }
    }
};