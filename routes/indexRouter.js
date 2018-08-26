const express = require('express');
const router = express.Router();
const urlController = require('../controller/urlController');
const userController = require('../controller/userController');

router.post('/test', function (req, res, next) {
    console.log('headers');
    console.log(req.header('Authorization'));
    console.log(req.header('Content-type'));
    console.log(req.header('X-CSRF-TOKEN'));
    console.log('body');
    console.log(req.body);
    res.json({t:'request received'});
});

router.get('/', (req, res, next)=>{
    res.render('index');
});
router.get('/signup', (req, res, next)=>{
    if(req.user){
        res.redirect('/');
    }else {
        res.render('index');
    }
});
router.get('/login', (req, res, next)=>{
    if(req.user){
        res.redirect('/');
    }else {
        res.render('index');
    }
});
router.get('/logout', userController.logout);
router.get('/:shortUrl', urlController.redirect);
router.get('*', (req, res, next)=>{
    res.render('error');
});



module.exports = router;
