const createError = require('http-errors');
const jwt = require('jsonwebtoken');
const secret  = require('../config/credentials').secret;
const debug = require('debug')('mixdown:middleware');
const mongoose = require('mongoose');
const userModel = require('../model/userModel');

module.exports={
    header(req, res, next){
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    },
    errorHandler(err, req, res, next) {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        // render the error page
        res.status(err.status || 500);
        res.render('error');
    },
    errorHandlerJson(err, req, res, next) {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {message: "Server Error occur"};
        // render the error page
        res.status(err.status || 500);
        res.json(err);
    },
    404(req, res, next) {
        next(createError(404));
    },
    setUser(req, res, next){
        if(req.session.user){
            req.user = req.session.user;
            req.logout = req.session.destroy;
        }
        next();
    },
    async jwtSetup(req, res, next){
        try {
            debug('cookies');
            debug(req.cookies);
            let token = req.cookies.token;
            if(token) {
                let decode = await jwt.verify(token, secret);
                req.userId = mongoose.Types.ObjectId(decode.user);
                delete decode.user;
                req.user = decode;
                debug(decode);
                debug('decode successful');
            }
            // for development check DON'T ENABLE IN PROD

            // else if(req.query.email && req.query.name) {
            //     req.user = {email: req.query.email, name: req.query.name};
            //     let doc = await userModel.findOne({email: req.user.email});
            //     req.userId = doc._id;
            //     debug(req.user);
            //     debug(req.userId);
            // }
            // else if(req.body.email&& req.body.name){
            //     req.user = {email: req.body.email, name: req.body.name};
            //     let doc = await userModel.findOne({email: req.user.email});
            //     req.userId = doc._id;
            //     debug(req.user);
            //     debug(req.userId);
            // }
            next()
        }catch(err){
            err.status = 403;
            err.message = "Authentication Failed ";
            res.clearCookie('token');
            debug(err);
            next(err)
        }
    },
    protectedRoute(req, res, next){
        if(req.user){
            next();
        } else {
            res.status(403);
            return res.json({error:"Forbidden" ,message:"Unauthorised Access"} )
        }
    }
};