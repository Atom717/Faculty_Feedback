import mongoose, { Schema, Document, Model } from 'mongoose';
import { Year, Branch, Division } from './StudentProfile';

export interface IFormTargetGroup extends Document {
  formId: mongoose.Types.ObjectId;
  year: Year;
  branch: Branch;
  division: Division;
  createdAt: Date;
}

const FormTargetGroupSchema: Schema = new Schema(
  {
    formId: {
      type: Schema.Types.ObjectId,
      ref: 'FeedbackForm',
      required: true,
    },
    year: {
      type: String,
      enum: ['FE', 'SE', 'TE', 'BE'],
      required: true,
    },
    branch: {
      type: String,
      enum: ['CE', 'CSE', 'EXTC'],
      required: true,
    },
    division: {
      type: String,
      enum: ['A', 'B', 'C', 'D'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure unique year+branch+division per form
FormTargetGroupSchema.index({ formId: 1, year: 1, branch: 1, division: 1 }, { unique: true });
// Index for querying forms by target group
FormTargetGroupSchema.index({ year: 1, branch: 1, division: 1 });

const FormTargetGroup: Model<IFormTargetGroup> =
  mongoose.models.FormTargetGroup || mongoose.model<IFormTargetGroup>('FormTargetGroup', FormTargetGroupSchema);

export default FormTargetGroup;

