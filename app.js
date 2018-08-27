const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const fs = require("fs");
const rfs = require("rotating-file-stream");

const heatmapRouter = require("./routes/api/heatmapGenerator");
const indexRouter = require("./routes/index");
const app = express();
app.set("env", "production");

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

var logDirectory = path.join(__dirname, "logs");

// ensure log directory exists
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

// create a rotating write stream
var accessLogStream = rfs("access.log", {
  interval: "1d", // rotate daily
  path: logDirectory
});

var errorLogStream = rfs("error.log", {
  interval: "1d", // rotate daily
  path: logDirectory
});

// setup the access logger
if (app.settings.env == "production") {
  app.use(morgan("common", { stream: accessLogStream }));
  app.use(
    morgan("common", {
      stream: errorLogStream,
      skip: function(req, res) {
        return res.statusCode < 400;
      } //Only the errors will be logged.
    })
  );
} else {
  app.use(morgan("dev"));
}
// setup the error logger

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/", indexRouter);
app.use("/heatmap", heatmapRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("NODE_ENV") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
