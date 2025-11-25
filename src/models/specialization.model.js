import mongoose from 'mongoose';

// Schema con cho Domain (Kiến thức ngành)
const DomainSchema = new mongoose.Schema({
  code: { type: String, required: true },
  name: { type: String, required: true },
});

// Schema cha cho Specialization (Vị trí chuyên môn)
const SpecializationSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true }, // Vd: 'it-software'
  name: { type: String, required: true }, // Vd: 'IT - Phần mềm'
  domains: [DomainSchema], // Mảng chứa các kiến thức ngành liên quan
});

export default mongoose.model('Specialization', SpecializationSchema);
