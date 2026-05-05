import mongoose from 'mongoose';

const testSchema = new mongoose.Schema({
  labId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lab',
    required: true,
  },
  testName: { type: String, required: true },
  originalPrice: { type: Number, required: true },
  discountedPrice: { type: Number, required: true },
  description: { type: String },
  fastingRequired: { type: Boolean, default: false },
  reportDeliveryTime: { type: String, required: true }, // e.g., "24 Hours"
  homeCollectionAvailable: { type: Boolean, default: false },
  category: { type: String, required: true }, // e.g., "Blood", "Urine", "Full Body"
}, { timestamps: true });

testSchema.index({ testName: 1 });
testSchema.index({ category: 1 });
testSchema.index({ createdAt: -1 });
testSchema.index({ testName: 'text' });

export default mongoose.model('Test', testSchema);
