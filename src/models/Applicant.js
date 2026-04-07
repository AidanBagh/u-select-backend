const mongoose = require('mongoose');

const applicantSchema = new mongoose.Schema(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
    phone: { type: String, trim: true },
    skills: { type: [String], default: [] },
    experienceYears: { type: Number, default: 0 },
    education: { type: String },
    summary: { type: String },
    source: { type: String, enum: ['structured', 'upload'], required: true },
    resumeData: { type: Buffer },
    resumeMimeType: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Applicant', applicantSchema);
