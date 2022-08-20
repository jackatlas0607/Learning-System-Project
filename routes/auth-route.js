const router = require("express").Router();
const passport = require("passport");
const bcrypt = require("bcrypt");
const User = require("../models/user-model");

router.get("/login", (req, res) => {
  res.render("login", { user: req.user });
});

router.get("/signup", (req, res) => {
  res.render("signup", { user: req.user });
});

router.get("/logout", (req, res) => {
  req.logOut();
  res.redirect("/");
});

router.post("/signup", async (req, res) => {
  let { name, email, password, role } = req.body;
  // check if the data is already in database
  const emailExist = await User.findOne({ email });
  if (emailExist) {
    req.flash("error_msg", "Email has already been registered.");
    res.redirect("/auth/signup");
  } else {
    const hash = await bcrypt.hash(password, 10);
    password = hash;
    let newUser = new User({ name, email, password, role });
    await newUser.save();
    req.flash("success_msg", "Registration succeeds. You can login now.");
    res.redirect("/auth/login");
  }
});

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/auth/login",
    failureFlash: "Wrong email or password.",
  }),
  (req, res) => {
    if (req.session.returnTo) {
      let newPath = req.session.returnTo;
      req.session.returnTo = "";
      res.redirect(newPath);
    } else {
      if (req.user.role === "instructor") {
        res.redirect("/instructor");
      } else {
        res.redirect("/student");
      }
    }
  }
);

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);

router.get(
  "/google/redirect",
  passport.authenticate("google"),
  async (req, res) => {
    let foundUser = await User.findOne({ googleID: req.user.googleID });
    if (foundUser.role === "undefined") {
      res.render("selectRole");
    } else {
      if (foundUser.role === "instructor") {
        res.redirect("/instructor");
      } else {
        res.redirect("/student");
      }
    }
  }
);

router.post("/selectRole", (req, res) => {
  let { role } = req.body;
  User.updateOne(
    { googleID: req.user.googleID },
    { role: role },
    { runValidators: true }
  )
    .then(() => {
      if (req.user.role === "instructor") {
        res.redirect("/instructor");
      } else {
        res.redirect("/student");
      }
    })
    .catch((err) => {
      req.flash("error_msg", "Please select role.");
      res.redirect("/auth/signup");
    });
});

module.exports = router;
