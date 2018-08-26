const userModel = require('../model/userModel');
const debug = require('debug')('mixdown:userController');
const jwt = require('jsonwebtoken');
const secret = require('../config/credentials').secret;
const bcrypt =require('bcrypt');


const User={
    signUp: async (req, res, next)=>{
        try {
            debug(req.body);
            let newUser = new userModel({
                name: req.body.name,
                password: req.body.password,
                email: req.body.email
            });
            newUser = await newUser.save();
            return res.json({name: newUser.name, email: newUser.email});
        }catch(err){
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
    }
};
module.exports = User;