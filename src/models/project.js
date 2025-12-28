import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
      trim: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    status: {
      type: String,
      enum: ['On Track', 'At Risk', 'Critical', 'Completed'],
      default: 'On Track',
    },
    healthScore: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Client is required'],
    },
    employees: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate health score based on check-ins and feedback
projectSchema.methods.calculateHealthScore = async function() {
  const CheckIn = mongoose.model('CheckIn');
  const ClientFeedback = mongoose.model('ClientFeedback');
  const Risk = mongoose.model('Risk');

  // Get recent check-ins (last 4 weeks)
  const fourWeeksAgo = new Date();
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

  const recentCheckIns = await CheckIn.find({
    project: this._id,
    createdAt: { $gte: fourWeeksAgo },
  });

  const recentFeedback = await ClientFeedback.find({
    project: this._id,
    createdAt: { $gte: fourWeeksAgo },
  });

  const openRisks = await Risk.find({
    project: this._id,
    status: 'Open',
  });

  let score = 100;

  // Factor 1: Employee confidence (weight: 30%)
  if (recentCheckIns.length > 0) {
    const avgConfidence = recentCheckIns.reduce((sum, ci) => sum + ci.confidenceLevel, 0) / recentCheckIns.length;
    const confidenceScore = (avgConfidence / 5) * 30;
    score = score - 30 + confidenceScore;
  } else {
    score -= 15; // Penalize for no check-ins
  }

  // Factor 2: Client satisfaction (weight: 35%)
  if (recentFeedback.length > 0) {
    const avgSatisfaction = recentFeedback.reduce((sum, fb) => sum + fb.satisfactionRating, 0) / recentFeedback.length;
    const satisfactionScore = (avgSatisfaction / 5) * 35;
    score = score - 35 + satisfactionScore;
  } else {
    score -= 15; // Penalize for no feedback
  }

  // Factor 3: Timeline progress (weight: 20%)
  const now = new Date();
  const totalDuration = this.endDate - this.startDate;
  const elapsed = now - this.startDate;
  const timeProgress = (elapsed / totalDuration) * 100;

  if (recentCheckIns.length > 0) {
    const latestCheckIn = recentCheckIns[recentCheckIns.length - 1];
    const progressDiff = timeProgress - latestCheckIn.completionPercentage;
    
    if (progressDiff > 20) {
      score -= 20; // Behind schedule
    } else if (progressDiff > 10) {
      score -= 10;
    }
  }

  // Factor 4: Open risks (weight: 15%)
  const highRisks = openRisks.filter(r => r.severity === 'High').length;
  const mediumRisks = openRisks.filter(r => r.severity === 'Medium').length;
  const lowRisks = openRisks.filter(r => r.severity === 'Low').length;

  score -= (highRisks * 10 + mediumRisks * 5 + lowRisks * 2);

  // Ensure score is between 0 and 100
  score = Math.max(0, Math.min(100, Math.round(score)));

  // Update status based on score
  if (score >= 80) {
    this.status = 'On Track';
  } else if (score >= 60) {
    this.status = 'At Risk';
  } else {
    this.status = 'Critical';
  }

  this.healthScore = score;
  await this.save();

  return score;
};

const Project = mongoose.models.Project || mongoose.model('Project', projectSchema);

export default Project;