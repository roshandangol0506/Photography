import mongoose, { Schema } from "mongoose";

export interface ITestimonial extends mongoose.Document {
  name: string;
  role?: string;
  avatar?: string;
  message: string;
  rating: number;
  order: number;
  isActive: boolean;
}

const testimonialSchema = new Schema<ITestimonial>(
  {
    name: { type: String, required: true },
    role: { type: String },
    avatar: { type: String },
    message: { type: String, required: true },
    rating: { type: Number, default: 5, min: 1, max: 5 },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const Testimonial = mongoose.model<ITestimonial>(
  "testimonials",
  testimonialSchema,
);
export default Testimonial;
