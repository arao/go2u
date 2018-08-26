const Url = require('../model/urlModel');
const Counter  = require('../model/counterModel');
const generator = require('./generator');
const defaultCounter = require('../config/credentials').default.counter
module.exports = {
    async checkKey (key) {
        try {
            let result = await Url.findOne({shortUrl: key});
            return Promise.resolve(!result);
        } catch (err) {
            if(err.node){
                err.node += "\nkey:CheckKey";
            }else{
                err.node = "key:CheckKey";
            }
            return Promise.reject(err);
        }
    },

    //check malicious behaviour
    setKey : async (key)=>{
        try {
            let short = await generator(key);
            if (await this.checkKey(short)) {
                return Promise.resolve(key);
            }else{
                return Promise.resolve( this.setKey(key+1) );
            }
        }catch(err){
            if(err.node){
                err.node += "\nkeyGetKey";
            }else{
                err.node = "keyGetKey";
            }
            return Promise.reject(err);
        }
    },
    // getKey : async ()=>{
    //     try{
    //         let free = await  DefaultData.findOne({name: "free"});
    //         DefaultData.deleteOne({name: free.name, value: free.value});
    //         if(!free) {
    //             let key = await DefaultData.findOne({name: "defaultKey"});
    //             key.key = await this.setKey(parseInt(key.key));
    //             key.save();
    //             let short = generator(key.key);
    //             return Promise.resolve(short);
    //         }
    //         return Promise.resolve(free.value);
    //     }catch (err){
    //         return Promise.reject(err);
    //     }
    // }
    async getKey(){
        try{
            //fetch key fro counter
            let counter = await Counter.findOneAndUpdate({name:defaultCounter.name},{ $inc: { value: 1 } });
            let key = generator(counter.value);
            let temp = counter.value;
            while(!(await this.checkKey(key) ) ){
                temp++;
                key = generator(counter.value);
            }
            if(temp !== counter.value){
                await Counter.findOneAndUpdate({name:defaultCounter.name},{value:temp});
            }
            return Promise.resolve(key)
        }catch(err){
            if(err.node){
                err.node += "\nkey:GetKey";
            }else{
                err.node = "key:GetKey";
            }
            return Promise.reject(err);
        }
    }
};