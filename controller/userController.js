const userModel = require('../model/userModel');
const debug = require('debug')('mixdown:userController');
const jwt = require('jsonwebtoken');
const secret = require('../config/credentials').secret;
const bcrypt =require('bcrypt');
const sha256 = require('crypto-js/sha256');
const sendMail = require('../helper/mail');
const forgetPasswordModel = require('../model/forgetPasswordModel');


function validatePassword(password){
    let reg = /[a-zA-Z0-9_\-@!#$%]{7,32}/gm;
    return reg.test(password);
}
function validateEmail(email) {
    return true;
}

function detailValidation(body) {
    if(body.name  ) {
        if( validateEmail(body.email)  ) {
            if(validatePassword(body.password)) {
                return {};
            }else{
                return {
                    err: "Invalid password ",
                    message:"Password can only conatain small case Upper case and _-@!#$% with length in range 7 to 32 characters"
                }
            }
        }else{
            return {
                err: "Invalid email",
                message:"Use a valid Email address"
            }
        }
    }else{
        return {
            err: "Invalid Name",
            message:"Name Required"
        }
    }
}


const User={
    signUp: async (req, res, next)=>{
        try {
            debug(req.body);
            let validation = detailValidation(req.body);
            if(validation.error){
                res.json(validation);
            }else {
                let newUser = new userModel({
                    name: req.body.name,
                    password: req.body.password,
                    email: req.body.email
                });
                newUser = await newUser.save();
                return res.json({name: newUser.name, email: newUser.email});
            }
        }
        catch(err){
            err.node = err.node?err.node+='\n':"";
            err.node += "controller:User:signUp";
            debug(err);

            return next(err);

        }
    },
    login : async (req, res, next)=>{
        try{
            let currUser = await userModel.findOne({email: req.body.email},);
            if(currUser && await bcrypt.compare(req.body.password, currUser.password) ) {
                jwt.sign(
                    {
                        user: currUser._id,
                        name: currUser.name,
                        email: currUser.email,
                        verified: currUser.verified,
                    },
                    secret,
                    { expiresIn: "2 days" },
                    (err, token)=>{
                        if (err) {
                            debug(err);
                            err.status = 500;
                            return next(err);
                        }
                        res.cookie('token', token, {expires: new Date(Date.now() + (1000 * 60 * 15) ) , httpOnly: true});
                        return res.json({
                            user:{
                                name: currUser.name,
                                email: currUser.email,
                                verified: currUser.verified,
                            },
                            token: token
                        });
                    }
                );
            }else{
                res.status(401);
                return res.json({message: "Invalid Credentials"});
            }
        }catch(err){
            err.node = err.node?err.node+='\n':"";
            err.node += "controller:User:login";
            debug(err);
            err.status = 500;
            return next(err);
        }
    },
    logout: async (req, res,next)=>{
        res.clearCookie('token', {path: "/"});
        return res.redirect('/');
    },
    async checkEmail(req,res, next){
        let user = await userModel.findOne({ email: req.query.email });
        if(user){
            res.json({available: false})
        }else{
            res.json({available: true})
        }
    },
    async authenticate(req, res, next){
        debug('authenticate user called');
        if(req.user){
            debug(req.user);
            // delete req.user.user;
            return res.json({user:req.user});
        }else{
            debug("failed");
            res.clearCookie('token', {path: "/"});
            return res.json({})
        }
    },
    async forgetPassword(req, res, next){
        if(! req.user){
            try {
                let user = await userModel.findOne({email: req.body.email});
                if(user) {
                    let forget = new forgetPasswordModel({user});
                    let currentDate = new Date();
                    forget.hash = sha256(user + process.env.SECRET + currentDate.getTime() ).toString();
                    forget = await forget.save();
                    let mail = await sendMail({email: user.email, text: forget.hash});
                    debug(mail);
                    return res.send({send: true , hash : forget.hash});
                }
            }catch (err) {
                debug(err);
                return res.json({send: false, error : "Error occur during reset Password" , message : err.message});
            }
        }else{
            res.send({error: "Authenticated", message: "User already authenticated"});
        }
    },
    async resetForgetPassword(req, res, next){
        if(! req.user ){
            if(validatePassword(req.body.password)) {
                let hash = req.body.hash;
                let forget = (await forgetPasswordModel.findOneAndRemove({hash: hash}));
                // debug(new Date - forget.expiredAt);
                if(forget && ( new Date ) - forget.expiredAt <= 0 ) {
                    let user = forget.user;
                    user = await userModel.findByIdAndUpdate(user, {password: req.body.password});
                    debug(user);
                    return res.json(user);
                }else{
                    res.status(410);
                    res.json({error:"Expired", message: "Link Expired"});
                }
            }else{
                    return res.json({
                        error:"Invalid Password" ,
                        message:"Password can only conatain small case Upper case and _-@!#$% with length in range 7 to 32 characters"});
            }
        }else{
            res.send({error: "Authenticated", message: "User already authenticated"});
        }

    }
};
module.exports = User;