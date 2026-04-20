import mongoose, { Schema, model } from "mongoose";

export interface IGeneratedSales {
  _id: string;
  userId: mongoose.Types.ObjectId;
  productName: string;
  productDescription: string;
  features: string;
  targetAudience: string;
  price: string;
  usp: string;
  headline: string;
  subHeadline: string;
  benefitsSection: string;
  featuresBreakdown: string;
  socialProofPlaceholder: string;
  pricingDisplay: string;
  callToAction: string;
  fullHtml: string;
  createdAt: Date;
  updatedAt: Date;
}

const GeneratedSalesSchema = new Schema<IGeneratedSales>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    productDescription: {
      type: String,
      required: true,
    },
    features: {
      type: String,
      required: true,
    },
    targetAudience: {
      type: String,
      required: true,
    },
    price: {
      type: String,
      required: true,
    },
    usp: {
      type: String,
      required: true,
    },
    headline: {
      type: String,
      required: true,
    },
    subHeadline: {
      type: String,
      required: true,
    },
    benefitsSection: {
      type: String,
      required: true,
    },
    featuresBreakdown: {
      type: String,
      required: true,
    },
    socialProofPlaceholder: {
      type: String,
      required: true,
    },
    pricingDisplay: {
      type: String,
      required: true,
    },
    callToAction: {
      type: String,
      required: true,
    },
    fullHtml: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.GeneratedSales ||
  model<IGeneratedSales>("GeneratedSales", GeneratedSalesSchema);
