import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema({
  candidateID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    required: true,
  },
  jobID: { type: mongoose.Schema.Types.ObjectId, ref: 'jobs', required: true },
  createdAt: { type: Date, default: Date.now },
});

const favorites = mongoose.model('favorites', favoriteSchema, 'favorites');
export default favorites;
