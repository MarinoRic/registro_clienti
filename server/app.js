const createError = import('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");

const clientsRouter = require('./routes/API/clients');
const quotesRouter = require('./routes/API/quotes');

const app = express();
const port = process.env.port || 10000;

const db = require('./database/database');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(cors()); // permette tutte le origini

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/api/clients', clientsRouter);
app.use('/api/quotes', quotesRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📱 Frontend: http://localhost:${port}`);
  console.log(`🔧 API: http://localhost:${port}/api`);
});
module.exports = app;
