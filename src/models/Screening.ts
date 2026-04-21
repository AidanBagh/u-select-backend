import mongoose, { Schema, Model, Types } from 'mongoose';

export interface IRankedApplicant {
  applicantId?: Types.ObjectId;
  name?: string;
  score?: number;
  reasoning?: string;
  shortlisted: boolean;
}

export interface IScreening {
  jobId: Types.ObjectId;
  rankedApplicants: IRankedApplicant[];
  createdAt: Date;
  updatedAt: Date;
}

const rankedApplicantSchema = new Schema<IRankedApplicant>(
  {
    applicantId: { type: Schema.Types.ObjectId, ref: 'Applicant' },
    name: { type: String },
    score: { type: Number },
    reasoning: { type: String },
    shortlisted: { type: Boolean, default: false },
  },
  { _id: false }
);

const screeningSchema = new Schema<IScreening>(
  {
    jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    rankedApplicants: [rankedApplicantSchema],
  },
  { timestamps: true }
);

const Screening: Model<IScreening> = mongoose.model<IScreening>('Screening', screeningSchema);

export default Screening;
