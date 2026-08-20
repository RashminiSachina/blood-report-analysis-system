const mongoose = require('mongoose');

const parameterSchema = new mongoose.Schema({
  name: String,
  abbreviation: String,
  value: Number,
  unit: String,
  referenceRange: String,
  referenceSource: String,
  referenceLow: Number,
  referenceHigh: Number,
  status: String,
  explanation: String
});

const reportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    originalFileName: {
      type: String,
      required: true,
    },
    systemFileName: {
      type: String,
      required: true,
    },
    summary: {
      type: String,
      default: 'Summary unavailable.',
    },
    parameters: [parameterSchema],
    disclaimer: {
      type: String,
      default: 'This is an educational summary, not a medical diagnosis. Always discuss your results with a qualified healthcare professional.',
    },
  },
  {
    timestamps: true,
  }
);

// Unique compound index — prevents duplicate reports for the same file per user
reportSchema.index({ user: 1, systemFileName: 1 }, { unique: true });

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
