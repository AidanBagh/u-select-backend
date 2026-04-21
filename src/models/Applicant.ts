import mongoose, { Schema, Model, Types } from 'mongoose';

export interface IWorkHistory {
  role?: string;
  company?: string;
  startDate?: string;
  endDate?: string;
  responsibilities: string[];
}

export interface IEducation {
  degree?: string;
  institution?: string;
  year?: string;
  field?: string;
}

export interface IApplicant {
  jobId: Types.ObjectId;
  name: string;
  email?: string;
  phone?: string;
  skills: string[];
  certifications: string[];
  experienceYears: number;
  workHistory: IWorkHistory[];
  education: IEducation[];
  summary?: string;
  source: 'structured' | 'upload';
  resumeData?: Buffer;
  resumeMimeType?: string;
  createdAt: Date;
  updatedAt: Date;
}

const workHistorySchema = new Schema<IWorkHistory>(
  {
    role: { type: String },
    company: { type: String },
    startDate: { type: String },
    endDate: { type: String },
    responsibilities: { type: [String], default: [] },
  },
  { _id: false }
);

const educationSchema = new Schema<IEducation>(
  {
    degree: { type: String },
    institution: { type: String },
    year: { type: String },
    field: { type: String },
  },
  { _id: false }
);

const applicantSchema = new Schema<IApplicant>(
  {
    jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
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

const Applicant: Model<IApplicant> = mongoose.model<IApplicant>('Applicant', applicantSchema);

export default Applicant;
