import mongoose, { Schema, model } from "mongoose";

export interface IGeneratedContent {
  _id: string;
  userId: mongoose.Types.ObjectId;
  contentType: string;
  topic: string;
  keywords: string;
  targetAudience: string;
  tone: string;
  outputContent: string;
  createdAt: Date;
}

const GeneratedContentSchema = new Schema<IGeneratedContent>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    contentType: {
      type: String,
      required: true,
    },
    topic: {
      type: String,
      required: true,
    },
    keywords: {
      type: String,
      required: true,
    },
    targetAudience: {
      type: String,
      required: true,
    },
    tone: {
      type: String,
      required: true,
    },
    outputContent: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.GeneratedContent ||
  model<IGeneratedContent>("GeneratedContent", GeneratedContentSchema);
