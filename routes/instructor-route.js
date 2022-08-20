const router = require("express").Router();
const Course = require("../models/postCourse-model");

const authCheck = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    res.redirect("/auth/login");
  } else {
    next();
  }
};

router.get("/", authCheck, (req, res) => {
  res.render("instructor", { user: req.user });
});

router.get("/course", authCheck, async (req, res) => {
  let courseFound = await Course.find({ instructor: req.user.name });
  res.render("instructorCourse", { user: req.user, courses: courseFound });
});

router.get("/course/:title", authCheck, async (req, res) => {
  let editCourse = await Course.findOne({ title: req.params.title });
  console.log(editCourse);
  res.render("editCourse", { user: req.user, edit: editCourse });
});

router.put("/course/:title", authCheck, async (req, res) => {
  let { title } = req.params;
  let { content, price } = req.body;
  try {
    await Course.updateOne({ title }, { content, price });
    req.flash("success_msg", "Edit course success.");
    res.redirect("/instructor/course");
  } catch (err) {
    res.redirect(`/instructor/course/${title}`);
  }
});

router.get("/postcourse", authCheck, (req, res) => {
  res.render("postCourse", { user: req.user });
});

router.post("/postcourse", authCheck, async (req, res) => {
  let { title, content, price } = req.body;
  let newCourse = new Course({
    title,
    content,
    price,
    instructor: req.user.name,
  });

  try {
    await newCourse.save();
    req.flash("success_msg", "Post course success.");
    res.status(200).redirect("/instructor/course");
  } catch (err) {
    res.redirect("/instructor/postcourse");
  }
});

module.exports = router;