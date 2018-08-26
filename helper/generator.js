let CounterModel = require('../model/counterModel');
let UrlModel = require('../model/urlModel');
const init = require('../config/init').init;

let defaultCounter = require('../config/credentials').default.counter;

function seqgen(inseq){
    if(typeof inseq !== 'number'){
        inseq = parseInt(inseq);
    }
    if(isNaN(inseq)){
        throw 'Invalid Input Sequence';
    }
    const key = "abcdefghijklmnopqrstuvwxyABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let outseq = inseq === 0? key[0]:"";

    while (inseq > 0) {
        let temp = inseq % 61;
        //inseq = inseq/52>>0;
        inseq = ~~(inseq / 61);
        outseq += key[temp];
    }

    return outseq;
}

async function checkKey(key) {
    return !!(await UrlModel.findOne({shortUrl: key}));
}

async function shortKeyGen(){
    try{
        //fetch counter
        let counter = await CounterModel.findOneAndUpdate({name:defaultCounter.name},{ $inc: { value: 1 } });
        let key = seqgen(counter.value);
        let temp = counter.value;

        // iterate through all available counter

        while((await checkKey(key) ) ){
            temp++;
            key = seqgen(temp);
        }

        if(temp !== counter.value){
            await Counter.findOneAndUpdate({name:defaultCounter.name},{value:temp});
        }

        return Promise.resolve(key)

    }catch(err){

        if(err.node){
            err.node += "\ngenerato:ShortKeyGen";
        }else{
            err.node = "generato:ShortKeyGen";
        }

        return Promise.reject(err);
    }
}

// init().then(()=>{shortKeyGen().then((data)=>{console.log(data)})});
//

module.exports = shortKeyGen;