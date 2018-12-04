require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const csrf = require('csurf');
// const cors = require('cors');
const hbs = require('hbs');

//Config Modules
const middleware = require('./helper/middleware');

let init = require('./config/init').init;

//Routes
const urlRouter = require('./routes/urlRouter');
const userRouter = require('./routes/userRouter');
const indexRouter = require('./routes/indexRouter');

//App instance
const app = express();

// Initialize system
init();

// CORS
// app.use(cors());
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', hbs.__express );

//logger
app.use(logger('dev'));

//req parser for body and json
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

//static file serving
app.use(express.static(path.join(__dirname, 'public')));


// Middleware
app.use(middleware.jwtSetup);

//csrf protection
// app.use(csrf({cookie: false}));

//Routes
app.use('/api/url', urlRouter);
app.use('/api/user', userRouter);
app.use('/', indexRouter);


// catch 404 and forward to error handler

app.use(middleware["404"]);

// error handler
app.use(middleware.errorHandlerJson);

module.exports = app;