import mongoose from 'mongoose';

const labSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  labName: { type: String, required: true },
  ownerName: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  pincode: { type: String, required: true },
  googleMapsLink: { type: String },
  certificates: [{ type: String }], // Cloudinary URLs
  photos: [{ type: String }],
  operatingTimings: {
    open: { type: String, required: true }, // e.g. "08:00 AM"
    close: { type: String, required: true }, // e.g. "08:00 PM"
  },
  homeCollectionAvailable: { type: Boolean, default: false },
  description: { type: String },
  gstDetails: { type: String },
  serviceAreas: [{ type: String }], // Pincodes or areas
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  },
  rejectionReason: { type: String },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
}, { timestamps: true });

// Add text indexing for search
labSchema.index({ labName: 1 });
labSchema.index({ city: 1 });
labSchema.index({ pincode: 1 });
labSchema.index({ status: 1 });
labSchema.index({ createdAt: -1 });
labSchema.index({ labName: 'text', city: 'text', pincode: 'text' });

export default mongoose.model('Lab', labSchema);
