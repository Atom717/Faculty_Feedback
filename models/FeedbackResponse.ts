import mongoose, { Schema, Document, Model } from 'mongoose';

export type Rating = 1 | 2 | 3; // Bad, Average, Good

export interface IFeedbackResponse extends Document {
  formId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  ratings: {
    regularConductance: Rating;
    teachingQuality: Rating;
    interactionDoubtSolving: Rating;
  };
  submittedAt: Date;
  createdAt: Date;
}

const FeedbackResponseSchema: Schema = new Schema(
  {
    formId: {
      type: Schema.Types.ObjectId,
      ref: 'FeedbackForm',
      required: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ratings: {
      regularConductance: {
        type: Number,
        enum: [1, 2, 3],
        required: true,
      },
      teachingQuality: {
        type: Number,
        enum: [1, 2, 3],
        required: true,
      },
      interactionDoubtSolving: {
        type: Number,
        enum: [1, 2, 3],
        required: true,
      },
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index to prevent duplicate submissions
FeedbackResponseSchema.index({ formId: 1, studentId: 1 }, { unique: true });
FeedbackResponseSchema.index({ formId: 1 });
FeedbackResponseSchema.index({ studentId: 1 });

const FeedbackResponse: Model<IFeedbackResponse> =
  mongoose.models.FeedbackResponse || mongoose.model<IFeedbackResponse>('FeedbackResponse', FeedbackResponseSchema);

export default FeedbackResponse;

