const express = require('express');
const router = express.Router();
const urlController = require('../controller/urlController');
const protectedRoute = require('../helper/middleware').protectedRoute;

/* GET users listing. */

router.post('/test', function (req, res, next) {
    console.log('headers');
    console.log(req.header('Authorization'));
    console.log(req.header('Content-type'));
    console.log('body');
    console.log(req.body);
    res.json({t:'request received'});
});

router.get('/', (req, res, next)=>{
    res.render('index');
});

router.post('/', urlController.add);
router.delete('/', protectedRoute, urlController.delete);
router.patch('/', protectedRoute, urlController.update);
router.post('/check', urlController.check);
router.get('/urllist', protectedRoute, urlController.gerAllUrl);


module.exports = router;
