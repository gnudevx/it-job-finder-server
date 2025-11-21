import mongoose from "mongoose";

const locationSchema = new mongoose.Schema({
  name: { type: String, required: true }
});

export default mongoose.model("Location", locationSchema, "locations");