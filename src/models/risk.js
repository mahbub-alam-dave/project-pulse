import mongoose from 'mongoose';

const riskSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project is required'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required'],
    },
    title: {
      type: String,
      required: [true, 'Risk title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    severity: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      required: [true, 'Severity is required'],
      default: 'Medium',
    },
    mitigationPlan: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Open', 'Resolved'],
      default: 'Open',
    },
    resolvedAt: {
      type: Date,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const Risk = mongoose.models.Risk || mongoose.model('Risk', riskSchema);

export default Risk;