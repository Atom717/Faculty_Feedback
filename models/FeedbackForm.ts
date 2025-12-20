import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFeedbackForm extends Document {
  semester: string;
  teacherId: mongoose.Types.ObjectId;
  subjectName: string;
  createdBy: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FeedbackFormSchema: Schema = new Schema(
  {
    semester: {
      type: String,
      required: true,
    },
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subjectName: {
      type: String,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

FeedbackFormSchema.index({ teacherId: 1 });
FeedbackFormSchema.index({ isActive: 1 });

const FeedbackForm: Model<IFeedbackForm> =
  mongoose.models.FeedbackForm || mongoose.model<IFeedbackForm>('FeedbackForm', FeedbackFormSchema);

export default FeedbackForm;

