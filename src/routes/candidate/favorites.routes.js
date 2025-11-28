import express from 'express';
import { verifyToken } from '../../middlewares/jwt.js';
import {
  getMyFavorites,
  addFavorite,
  removeFavorite,
} from '../../controllers/favorites.controller.js';

const router = express.Router();

// Lấy danh sách công việc yêu thích
router.get('/', verifyToken, getMyFavorites);

// Thêm vào yêu thích
router.post('/', verifyToken, addFavorite);

// Xóa khỏi yêu thích
router.delete('/:jobID', verifyToken, removeFavorite);

export default router;
