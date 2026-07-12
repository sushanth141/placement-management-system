import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'company', 'admin'], default: 'student' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  rollNumber: { type: String, trim: true },
  mustChangePassword: { type: Boolean, default: true },
  resetRequested: { type: Boolean, default: false },
  profile: {
    phone: { type: String },
    branch: { type: String },
    passingYear: { type: Number },
    cgpa: { type: Number },
    resume: { type: String },
    photo: { type: String },
    aadharProof: { type: String },
    skills: [{ type: String }],
    companyName: { type: String },
    website: { type: String },
  },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function (entered) {
  return await bcrypt.compare(entered, this.password);
};

export default mongoose.model('User', userSchema);
