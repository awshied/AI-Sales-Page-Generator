// src/models/User.ts
import mongoose, { Schema, model } from "mongoose";

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password?: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Nama harus diisi"],
    },
    email: {
      type: String,
      required: [true, "Email harus diisi"],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      select: false,
    },
    image: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.User || model<IUser>("User", UserSchema);
