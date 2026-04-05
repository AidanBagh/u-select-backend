const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    requirements: {
      type: [String],
      default: [],
    },
    weights: {
      skills: { type: Number, default: 40 },
      experience: { type: Number, default: 30 },
      education: { type: Number, default: 20 },
      relevance: { type: Number, default: 10 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Job', jobSchema);
