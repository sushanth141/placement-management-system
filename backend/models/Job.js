import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  location: { type: String },
  salary: { type: Number },
  type: { type: String, enum: ['full-time', 'internship', 'contract'], default: 'full-time' },
  eligibilityCriteria: {
    minCGPA: { type: Number, default: 0 },
    skills: [{ type: String }],
  },
  deadline: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Job', jobSchema);
