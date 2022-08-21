const router = require("express").Router();
const { application } = require("express");
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
  res.render("student", { user: req.user });
});

router.get("/course", authCheck, async (req, res) => {
  let courseFound = await Course.find({
    students: { $elemMatch: { name: req.user.name } },
  });
  res.render("studentCourse", {
    user: req.user,
    courses: courseFound,
  });
});

router.get("/enroll", authCheck, async (req, res) => {
  let foundCourse = await Course.find({});
  res.render("enroll", { user: req.user, courses: foundCourse });
});

router.delete("/enroll/:_id", authCheck, async (req, res) => {
  let { _id } = req.params;
  let deleteCourse = await Course.findOne({ _id });
  console.log(deleteCourse);
  const deleteIndex = deleteCourse.students.findIndex((object) => {
    return object.name == req.user.name;
  });
  console.log(deleteIndex);
  deleteCourse.students.splice(deleteIndex, 1);
  try {
    await deleteCourse.save();
    req.flash("success_msg", "Delete course success.");
    res.status(200).redirect("/student/course");
  } catch (err) {
    res.redirect("/student/course");
  }
});

router.post("/enroll/:_id", authCheck, async (req, res) => {
  let { _id } = req.params;
  let enrollCourse = await Course.findOne({ _id });
  console.log(enrollCourse);

  enrollCourse.students.push({ name: req.user.name });

  try {
    await enrollCourse.save();
    req.flash("success_msg", "Enroll course success.");
    res.status(200).redirect("/student/course");
  } catch (err) {
    res.redirect("/student/enroll");
  }
});

router.post("/searchcourse", authCheck, async (req, res) => {
  let { search } = req.body;
  let foundCourse = await Course.find({
    title: { $regex: ".*" + search + ".*", $options: "i" },
  });
  res.render("enroll", { user: req.user, courses: foundCourse });
});

module.exports = router;
