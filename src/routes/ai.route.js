// routes/ai.route.js
// Node.js nhận request từ React, verify JWT, forward sang FastAPI

import express from 'express';

const router = express.Router();
const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000';

// Dùng FormData của Web API (Node 18+) thay vì form-data package
const { FormData, Blob } = await import('node-fetch');

import multer from 'multer';
const upload = multer({ storage: multer.memoryStorage() }); // giữ file trong RAM

// ── Helper: forward request sang FastAPI ──────────────────────────────────────
const forwardToFastAPI = async (path, method, body, userId) => {
  const response = await fetch(`${FASTAPI_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-User-Id': userId, // FastAPI đọc header này thay vì verify JWT lại
      'X-User-Role': 'user',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();
  return { status: response.status, data };
};

// ── POST /api/ai/chat ─────────────────────────────────────────────────────────
router.post('/chat', async (req, res) => {
  try {
    const { message, session_id, mode, job_position } = req.body;

    if (!message || !session_id) {
      return res.status(400).json({ message: 'Thiếu message hoặc session_id' });
    }

    const { status, data } = await forwardToFastAPI(
      '/api/chat/',
      'POST',
      { message, session_id, mode: mode || 'cv_advisor', job_position },
      req.user.userId,
    );

    return res.status(status).json(data);
  } catch (err) {
    console.error('AI chat error:', err);
    return res.status(502).json({ message: 'Lỗi kết nối AI service', err });
  }
});

// ── GET /api/ai/chat/history/:sessionId ──────────────────────────────────────
router.get('/chat/history/:sessionId', async (req, res) => {
  try {
    const { status, data } = await forwardToFastAPI(
      `/api/chat/history/${req.params.sessionId}`,
      'GET',
      null,
      req.user.userId,
    );
    return res.status(status).json(data);
  } catch (err) {
    return res.status(502).json({ message: 'Lỗi kết nối AI service', err });
  }
});

// ── DELETE /api/ai/chat/history/:sessionId ────────────────────────────────────
router.delete('/chat/history/:sessionId', async (req, res) => {
  try {
    const { status, data } = await forwardToFastAPI(
      `/api/chat/history/${req.params.sessionId}`,
      'DELETE',
      null,
      req.user.userId,
    );
    return res.status(status).json(data);
  } catch (err) {
    return res.status(502).json({ message: 'Lỗi kết nối AI service', err });
  }
});

// ── GET /api/ai/tokens ────────────────────────────────────────────────────────
router.get('/tokens', async (req, res) => {
  try {
    const { status, data } = await forwardToFastAPI(
      '/api/chat/tokens',
      'GET',
      null,
      req.user.userId,
    );
    return res.status(status).json(data);
  } catch (err) {
    return res.status(502).json({ message: 'Lỗi kết nối AI service', err });
  }
});

// ── POST /api/ai/cv/upload ────────────────────────────────────────────────────
// CV upload cần multipart/form-data → pipe thẳng sang FastAPI
router.post('/cv/upload', upload.single('file'), async (req, res) => {
  try {
    console.log('=== CV UPLOAD HIT ===');
    console.log('user:', req.user);
    console.log('file:', req.file?.originalname);

    if (!req.file) return res.status(400).json({ message: 'Chưa chọn file' });

    const formData = new FormData();
    const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
    formData.append('file', blob, req.file.originalname);

    console.log('Calling FastAPI at:', `${FASTAPI_URL}/api/cv/upload`);

    const response = await fetch(`${FASTAPI_URL}/api/cv/upload`, {
      method: 'POST',
      headers: {
        'X-User-Id': req.user?.userId,
        'X-User-Role': req.user?.role || 'user',
      },
      body: formData,
    });

    console.log('FastAPI status:', response.status);
    const rawText = await response.text();
    console.log('FastAPI response:', rawText);

    return res.status(response.status).json(JSON.parse(rawText));
  } catch (err) {
    console.error('CV upload error:', err.message);
    return res.status(502).json({ message: 'Lỗi upload CV' });
  }
});

// ── GET /api/ai/cv/status/:cvId ───────────────────────────────────────────────
router.get('/cv/status/:cvId', async (req, res) => {
  try {
    const { status, data } = await forwardToFastAPI(
      `/api/cv/status/${req.params.cvId}`,
      'GET',
      null,
      req.user.userId,
    );
    return res.status(status).json(data);
  } catch (err) {
    return res.status(502).json({ message: 'Lỗi kết nối AI service', err });
  }
});

export default router;
