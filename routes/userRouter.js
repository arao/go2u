const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const protectedRoute = require('../helper/middleware').protectedRoute;

/* GET users listing. */
router.post('/signup', userController.signUp );

router.post('/login',userController.login );

router.get('/checkemail', userController.checkEmail);

router.get('/logout', userController.logout);

router.get('/authenticateuser', userController.authenticate);

router.get('/csrfToken', (req, res, next)=>{
    res.json({token: req.csrfToken()});
});

module.exports = router;
