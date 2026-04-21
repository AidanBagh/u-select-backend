import mongoose, { Schema, Model } from 'mongoose';

export interface IJobWeights {
  skills: number;
  experience: number;
  education: number;
  relevance: number;
}

export interface IJob {
  title: string;
  description: string;
  requirements: string[];
  weights: IJobWeights;
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema<IJob>(
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

const Job: Model<IJob> = mongoose.model<IJob>('Job', jobSchema);

export default Job;
