import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  labId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lab',
    required: true,
  },
  tests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true,
  }],
  patientDetails: {
    fullName: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
  },
  slot: { type: Date, required: true },
  prescriptionUrl: { type: String }, // Optional
  notes: { type: String },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Sample Collected', 'Processing', 'Report Uploaded', 'Completed', 'Cancelled'],
    default: 'Pending',
  },
  paymentId: { type: String },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed'],
    default: 'Pending'
  },
  amountPaid: { type: Number, required: true },
  reportUrl: { type: String }, // Cloudinary PDF URL
}, { timestamps: true });

export default mongoose.model('Booking', bookingSchema);
