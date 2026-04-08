const mongoose = require('mongoose');

const rankedApplicantSchema = new mongoose.Schema(
  {
    applicantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Applicant' },
    name: { type: String },
    score: { type: Number },
    reasoning: { type: String },
    shortlisted: { type: Boolean, default: false },
  },
  { _id: false }
);

const screeningSchema = new mongoose.Schema(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    rankedApplicants: [rankedApplicantSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Screening', screeningSchema);
