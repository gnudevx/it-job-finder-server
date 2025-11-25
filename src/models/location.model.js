import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  code: String,
  name: String,
  type: String, // "province" | "district" | "ward"
  parent_code: String, // ví dụ: quận thuộc tỉnh nào
});
export default mongoose.model('Location', locationSchema, 'locations');
