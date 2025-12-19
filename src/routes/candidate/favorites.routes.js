import express from 'express';
import {
  getMyFavorites,
  addFavorite,
  removeFavorite,
} from '../../controllers/favorites.controller.js';

const router = express.Router();

// Lấy danh sách công việc yêu thích
router.get('/', getMyFavorites);

// Thêm vào yêu thích
router.post('/', addFavorite);

// Xóa khỏi yêu thích
router.delete('/:jobID', removeFavorite);

export default router;
