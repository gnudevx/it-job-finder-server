import Candidate from '../models/candidate.model.js';
import Favorite from '../models/favorites.model.js';
import Job from '../models/jobs.model.js';

// Lấy các job đã lưu
export const getMyFavorites = async (req, res) => {
  try {
    const candidateID = req.user.id;

    const favorites = await Favorite.find({ candidateID }).populate('jobID');

    res.status(200).json({ success: true, data: favorites });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lưu job yêu thích
export const addFavorite = async (req, res) => {
  try {
    const userId = req.user.userId;
    const candidateID = await Candidate.findOne({ userId }).then(
      (candidate) => candidate._id,
    );

    const { jobID } = req.body;

    // Kiểm tra job có tồn tại không
    const job = await Job.findById(jobID);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Check đã lưu chưa
    const existing = await Favorite.findOne({ candidateID, jobID });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Job already in favorites',
      });
    }

    const newFav = await Favorite.create({ candidateID, jobID });

    res.status(201).json({
      success: true,
      message: 'Added to favorites',
      data: newFav,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Xóa job khỏi danh sách yêu thích
export const removeFavorite = async (req, res) => {
  try {
    const userId = req.user.userId;
    const candidateID = await Candidate.findOne({ userId }).then(
      (candidate) => candidate._id,
    );
    const { jobID } = req.params;

    const deleted = await Favorite.findOneAndDelete({ candidateID, jobID });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Favorite not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Removed from favorites',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
