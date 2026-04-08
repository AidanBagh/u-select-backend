const mongoose = require('mongoose');

const workHistorySchema = new mongoose.Schema(
  {
    role: { type: String },
    company: { type: String },
    startDate: { type: String },
    endDate: { type: String },
    responsibilities: { type: [String], default: [] },
  },
  { _id: false }
);

const educationSchema = new mongoose.Schema(
  {
    degree: { type: String },
    institution: { type: String },
    year: { type: String },
    field: { type: String },
  },
  { _id: false }
);

const applicantSchema = new mongoose.Schema(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
    phone: { type: String, trim: true },
    skills: { type: [String], default: [] },
    certifications: { type: [String], default: [] },
    experienceYears: { type: Number, default: 0 },
    workHistory: { type: [workHistorySchema], default: [] },
    education: { type: [educationSchema], default: [] },
    summary: { type: String },
    source: { type: String, enum: ['structured', 'upload'], required: true },
    resumeData: { type: Buffer },
    resumeMimeType: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Applicant', applicantSchema);
