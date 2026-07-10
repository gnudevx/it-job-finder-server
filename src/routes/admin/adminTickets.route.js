import express from 'express';
import {
  getAdminTickets,
  getTicketById,
  replyToTicket,
  changeTicketStatus,
} from '../../controllers/adminTickets.controller.js';

const router = express.Router();

// ==========================
// Lấy tất cả ticket (Support + Feedback)
// ==========================
router.get('/', getAdminTickets);

// ==========================
// Lấy chi tiết một ticket
// ==========================
router.get('/:ticketId', getTicketById);

// ==========================
// Admin phản hồi ticket
// BODY: { content, type: "SUPPORT" | "FEEDBACK" }
// ==========================
router.post('/:ticketId/reply', replyToTicket);

// ==========================
// Admin đổi trạng thái ticket
// BODY: { status, type: "SUPPORT" | "FEEDBACK" }
// ==========================
router.patch('/:ticketId/status', changeTicketStatus);

export default router;
