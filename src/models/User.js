import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    enum: ['patient', 'lab_owner', 'super_admin'],
    default: 'patient',
  },
  labApplicationStatus: {
    type: String,
    enum: ['none', 'pending', 'approved', 'rejected'],
    default: 'none',
  },
  name: {
    type: String,
  },
  age: {
    type: Number,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
  },
  address: {
    type: String,
  },
  city: {
    type: String,
  },
  pincode: {
    type: String,
  },
  savedLabs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lab'
  }],
}, { timestamps: true });

userSchema.index({ role: 1 });
userSchema.index({ labApplicationStatus: 1 });
userSchema.index({ createdAt: -1 });

export default mongoose.model('User', userSchema);
