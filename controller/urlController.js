const UrlModel = require('../model/urlModel');
const UserModel = require('../model/userModel');
// const DefaultData = require('../model/default');
const debug = require('debug')('mixdown:controller:url');
const newKey = require('../helper/generator');
const md5 = require('crypto-js/md5');

function beautify(value) {
    let regex = /^http(s)?:\/\//gm;
    return value.match(regex)?value:`http://${value}`
}

function hash(text){
    return md5(text).toString();
}

function validateShortUrl(shortUrl) {
    let regex = /^[a-zA-Z0-9]+$/g;
    return regex.test(shortUrl);
}

async function checkShortUrlAvailability(shortUrl){
    try{
        if(validateShortUrl(shortUrl)) {
            let res = {};
            res.available = !(await UrlModel.findOne({"shortUrl": shortUrl}));
            return Promise.resolve(res)
        }else{
            return Promise.resolve({available:false});
        }
    }catch(err){
        if(err.node){
            err.node += "\ncontroller:url:CheckShortUrlAvailability";
        }else {
            err.node = "controller:url:CheckShortUrlAvailability";
        }
        return Promise.reject(err);
    }
}

async function addUrl(obj){
    let url = new UrlModel(obj);
    await url.save();
    return {shortUrl: url.shortUrl,
        longUrl: url.longUrl }
}


module.exports = {
    async add (req, res, next){
        debug(req.body);
        try {
            // beautify
            req.body.longUrl = beautify(req.body.longUrl);

            if(req.userId){
                if(req.body.shortUrl && req.body.shortUrl.length > 0){
                    // Add Url;
                    if((await checkShortUrlAvailability(req.body.shortUrl)).available) {
                        return res.json(await addUrl({
                            shortUrl: req.body.shortUrl,
                            longUrl: req.body.longUrl,
                            user: req.userId
                        }));
                    }
                    else{
                        res.status(409);
                        return res.json({error:"Key Conflict", message:"key already exist"});
                    }
                }
                else{
                    // calculate hash of long url
                    let longUrlHash = hash(req.body.longUrl);

                    //check long url Availability
                    let url = await UrlModel.findOne({hash: longUrlHash, user:req.userId});

                    if(url && req.body.longUrl === url.longUrl) {
                        return res.json({shortUrl: url.shortUrl, longUrl: url.longUrl,});
                    }else{
                        // Add Url;
                        return res.json(await addUrl({shortUrl:  await newKey(), longUrl: req.body.longUrl, user: req.userId}));
                    }
                }
            }
            else{
                if(req.body.shortUrl && req.body.shortUrl.length > 0) {
                    if((await checkShortUrlAvailability(req.body.shortUrl)).available) {
                        return res.json(await addUrl({
                            shortUrl: req.body.shortUrl,
                            longUrl: req.body.longUrl,
                            user: process.env.Anonymous
                        }));
                    }
                    else{
                        res.status(409);
                        return res.json({error:"Key Error", message:"Invalid Key"});
                    }
                }
                else{
                    let longUrlHash = hash(req.body.longUrl);
                    //check long url Availability
                    let url = await UrlModel.findOne({hash: longUrlHash});
                    if(url && req.body.longUrl === url.longUrl) {
                        return res.json({shortUrl: url.shortUrl, longUrl: url.longUrl,});
                    }else{
                        // Add Url;
                        return res.json(await addUrl({shortUrl:  await newKey(), longUrl: req.body.longUrl, user: process.env.Anonymous}));
                    }
                }
            }
            //
            // // calculate hash of long url
            // let longUrlHash = hash(req.body.longUrl);
            //
            // //check long url Availability
            // let url = await UrlModel.findOne({hash: longUrlHash, user:req.userId||process.env.Anonymous});
            //
            // // if there is the long url already available with same user account
            // if(url && req.body.longUrl === url.longUrl) {
            //     return res.json({shortUrl: url.shortUrl, longUrl: url.longUrl,});
            // }
            // //if short url is already provided with request
            // else if(req.body.shortUrl&& req.body.shortUrl.length > 0){
            //     if((await checkShortUrlAvailability(req.body.shortUrl)).available){
            //         let url = new UrlModel({
            //             shortUrl: req.body.shortUrl,
            //             longUrl: req.body.longUrl,
            //             user: req.userId || process.env.Anonymous // if login then login user else Anonymous user
            //         });
            //         await url.save();
            //         return res.json({shortUrl: url.shortUrl,
            //             longUrl: url.longUrl, })
            //     }else{
            //         res.status(409);
            //         return res.json({error:"Key Conflict", message:"key already exist"});
            //     }
            // }
            // // else add new url
            // else{
            //     let url = new UrlModel({
            //         shortUrl: await newKey(),
            //         longUrl: req.body.longUrl,
            //         user: req.userId || process.env.Anonymous
            //     });
            //     await url.save();
            //     return res.json({shortUrl: url.shortUrl,
            //         longUrl: url.longUrl })
            // }
        }catch(err){
            err.node = err.node?err.node+='\n':"";
            err.node += "controller:Url:AddUrl";
            debug(err);
            err.message = err.message || "failed to add url";
            return next(err);
        }
    },
    async delete (req, res, next){
        try {
            let document = await UrlModel.findOne({shortUrl: req.body.shortUrl, user: req.userId} );
            if (document) {
                await UrlModel.deleteOne({_id: document._id});
                res.status(200);
                return res.json({delete: true, longUrl: document.longUrl, shortUrl: document.shortUrl});
            } else {
                res.status(401);
                return res.json({message: "Unauthorised Action"})
            }
        }catch(err){
            err.node = err.node?err.node+='\n':"";
            err.node += "controller:Url:deleteUrl";

            debug(err);
            return next(err);
        }
    },
    async update (req, res, next){
        try {
            let document = await UrlModel.findOne({shortUrl: req.body.shortUrl});
            if (document && document.user.toString() === req.userId) {
                document.longUrl = beautify(req.body.longUrl);
                document = (await document.save()).toObject();
                delete document.hash;
                delete document.__v;
                return res.json(document);
            } else {
                res.sendStatus(401);
                return res.json({err: "Unauthorised"})
            }
        }catch(err){
            err.node = err.node?err.node+='\n':"";
            err.node += "controller:Url:UpdateUrl";

            debug(err);
            return req.app.get('env') === 'development'?res.json(err): next(err);
        }
    },
    async check (req, res,next) {
        try {
            return res.json({available:(await checkShortUrlAvailability(req.body.shortUrl)).available});
        } catch (err) {
            if (err.node) {
                err.node += "\ncontroller:url:Check";
            } else {
                err.node = "controller:url:Check";
            }
            debug(err);
            return req.app.get('env') === 'development' ? res.json(err) : next(err);
        }
    },
    async redirect(req, res, next){
        let shortUrl = req.params.shortUrl;
        try {
            let document = await UrlModel.findOne({shortUrl: shortUrl});
            if(document) {
                return res.redirect(document.longUrl );
            }else{
                return next();
            }
        }catch(err){
            if(err.node){
                err.node += "\ncontroller:Url:redirect";
            }else{
                err.node = "controller:Url:redirect";
            }
            return req.app.get('env') === 'development'?res.json(err): next(err);
        }
    },
    async gerAllUrl(req, res, next){
        try {
            let urls = await UrlModel.find({user:req.userId}, '-hash -__v -user -_id');
            return res.json(urls);
        }catch(err){
            err.node = err.node?err.node+='\n':"";
            err.node += "controller:Url:getAll";
            debug(err);
            err.status = 500;
            return next(err);
        }
    },
    async authenticate(req, res, next){
        if(req.user){
            let user = await UserModel.findOne({_id:req.userId}, "-password -__v -verified");
            if(req.user.email === user.email){
                return res.json(user);
            }else{
                return res.json({});
            }

        }else{
            return res.json();
        }
    }
};