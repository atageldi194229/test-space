const path = require("path");
const express = require("express");
const morgan = require("morgan");
// const colors = require('colors');
const fileupload = require("express-fileupload");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
// const mongoSanitize = require('express-mongo-sanitize');
// const helmet = require('helmet');
// const xss = require('xss-clean');
// const rateLimit = require('express-rate-limit');
// const hpp = require('hpp');
const cors = require("cors");
const errorHandler = require("./middleware/error");
// const connectDB = require('./config/db');
const http = require("http");
const https = require("https");
const fs = require("fs");

// Load env vars
require("dotenv").config({ path: "./config/config.env" });

// Connect to database
// connectDB();

// Route files
// const bootcamps = require('./routes/bootcamps');
// const courses = require('./routes/courses');
// const auth = require('./routes/auth');
// const users = require('./routes/users');
// const reviews = require('./routes/reviews');

const app = express();

// EJS engine
app.set("view engine", "ejs");

// Body parser
// app.use(express.json({ limit: "600mb" }));
// app.use(express.urlencoded({ limit: "600mb" }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// Dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// File uploading
app.use(
  fileupload({
    useTempFiles: true,
    tempFileDir: "/public/tmp/",
  })
);

// Sanitize data
// app.use(mongoSanitize());

// Set security headers
// app.use(helmet());

// Prevent XSS attacks
// app.use(xss());

// Rate limiting
// const limiter = rateLimit({
//   windowMs: 10 * 60 * 1000, // 10 mins
//   max: 100
// });
// app.use(limiter);

// Prevent http param pollution
// app.use(hpp());

// Enable CORS
app.use(cors());

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

// Mount routers
app.use(require("./routes"));

app.use(errorHandler);

const HTTPS_PORT = process.env.HTTPS_PORT || 3006;
const HTTP_PORT = process.env.HTTP_PORT || 3007;

// HTTPS SECURE KEY GENERATOR
// -------------------------------------------------------------------------------
const selfSigned = require("selfsigned"); //-
const attrs = [{ name: "commonName", value: "testspace.com" }]; //-
const pems = selfSigned.generate(attrs, { days: 365 }); //-
const options = {
  //-
  // key: fs.readFileSync('./config/ssl/privkey.pem'),                         //-
  // cert: fs.readFileSync('./config/ssl/fullchain.pem'),                      //-
  key: pems.private, //-
  cert: pems.cert, //-
  ca: pems.public, //-
}; //-
https.createServer(options, app).listen(HTTPS_PORT); //-
http.createServer(app).listen(HTTP_PORT); //-
console.log(`Server running in ${process.env.NODE_ENV} mode`); //-
console.log(`Https port ${HTTPS_PORT}`); //-
console.log(`Http port ${HTTP_PORT}`); //-
// -------------------------------------------------------------------------------

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  // server.close(() => process.exit(1));
});
