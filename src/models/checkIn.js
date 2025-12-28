import mongoose from 'mongoose';

const checkInSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project is required'],
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employee is required'],
    },
    progressSummary: {
      type: String,
      required: [true, 'Progress summary is required'],
      trim: true,
    },
    blockers: {
      type: String,
      trim: true,
    },
    confidenceLevel: {
      type: Number,
      required: [true, 'Confidence level is required'],
      min: 1,
      max: 5,
    },
    completionPercentage: {
      type: Number,
      required: [true, 'Completion percentage is required'],
      min: 0,
      max: 100,
    },
    weekStartDate: {
      type: Date,
      required: true,
    },
    weekEndDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure one check-in per employee per project per week
checkInSchema.index({ project: 1, employee: 1, weekStartDate: 1 }, { unique: true });

const CheckIn = mongoose.models.CheckIn || mongoose.model('CheckIn', checkInSchema);

export default CheckIn;