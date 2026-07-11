import mongoose, { Schema } from "mongoose";

const productSchema = new Schema({
  file: {
    type: String,
    required: true,
  },
  like: {
    type: Boolean,
    default: false,
    required: true,
  },
  view: {
    type: Number,
  },
  created_date: {
    type: Date,
    default: Date.now,
  },
  updated_date: {
    type: Date,
    default: Date.now,
  },
});

const Product = mongoose.model("Product", productSchema, "product");

export default Product;
