const express = require("express");
const app = express();
const ejs = require("ejs");
const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");
const authRoute = require("./routes/auth-route");
const studentRoute = require("./routes/student-route");
const instructorRoute = require("./routes/instructor-route");
require("./config/passport");
const passport = require("passport");
const session = require("express-session");
const flash = require("connect-flash");
const methodOverride = require("method-override");
const port = process.env.PORT || 3000;

mongoose
  .connect(process.env.DB_CONNECT, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connect to mongodb atlas.");
  })
  .catch((err) => {
    console.log(err);
  });

// middleware
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

app.use("/auth", authRoute);
app.use("/student", studentRoute);
app.use("/instructor", instructorRoute);

app.get("/", (req, res) => {
  res.render("index", { user: req.user });
});

app.get("/*", (req, res) => {
  res.status(404).send("Page not found.");
});

app.listen(port, () => {
  console.log("Server is running on port " + port + ".");
});
