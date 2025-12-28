import mongoose from 'mongoose';

const clientFeedbackSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project is required'],
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Client is required'],
    },
    satisfactionRating: {
      type: Number,
      required: [true, 'Satisfaction rating is required'],
      min: 1,
      max: 5,
    },
    communicationRating: {
      type: Number,
      required: [true, 'Communication rating is required'],
      min: 1,
      max: 5,
    },
    comments: {
      type: String,
      trim: true,
    },
    issueFlagged: {
      type: Boolean,
      default: false,
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

// Ensure one feedback per client per project per week
clientFeedbackSchema.index({ project: 1, client: 1, weekStartDate: 1 }, { unique: true });

const ClientFeedback = mongoose.models.ClientFeedback || mongoose.model('ClientFeedback', clientFeedbackSchema);

export default ClientFeedback;