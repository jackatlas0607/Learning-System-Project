const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minLength: 2,
    maxLength: 30,
  },
  content: {
    type: String,
    required: true,
    maxLength: 5000,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
    max: 500,
  },
  students: {
    type: [{ name: String }],
    default: [],
  },
  date: {
    type: Date,
    default: Date.now,
  },
  instructor: {
    type: String,
  },
});

module.exports = mongoose.model("course", courseSchema);
