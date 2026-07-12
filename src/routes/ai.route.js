// routes/ai.route.js
// Node.js nhận request từ React, verify JWT, forward sang FastAPI

import express from 'express';
import axios from 'axios';
import FormData from 'form-data';
import mongoose from 'mongoose';

const router = express.Router();
const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000';

import multer from 'multer';
const upload = multer({ storage: multer.memoryStorage() }); // giữ file trong RAM

// ── Kết nối Database MongoDB riêng của Chatbot ─────────────────────────────────
let chatbotDbConnection = null;

const getChatbotDb = () => {
  if (chatbotDbConnection) return chatbotDbConnection;

  const uri = process.env.CHATBOT_MONGO_URI;
  const dbName = process.env.CHATBOT_MONGO_DB || 'cv_chatbot';

  if (!uri) {
    throw new Error('CHATBOT_MONGO_URI is not defined in environment variables');
  }

  chatbotDbConnection = mongoose.createConnection(uri, {
    dbName: dbName,
  });

  return chatbotDbConnection;
};

// ── Helper: forward request sang FastAPI ──────────────────────────────────────
const forwardToFastAPI = async (path, method, body, userId) => {
  const response = await fetch(`${FASTAPI_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-User-Id': userId,
      'X-User-Role': 'user',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const rawText = await response.text();

  let data;

  try {
    data = rawText ? JSON.parse(rawText) : {};
  } catch (err) {
    console.error('Error parsing JSON from FastAPI response:', err);

    return {
      status: response.status || 500,
      data: {
        message: 'AI service trả dữ liệu không hợp lệ',
        raw: rawText,
      },
    };
  }

  return {
    status: response.status,
    data,
  };
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
// Đọc trực tiếp từ MongoDB chatbot — KHÔNG cần Render FastAPI wake up
router.get('/chat/history/:sessionId', async (req, res) => {
  try {
    const connection = getChatbotDb();
    const db = connection.db;

    const userId = req.user.userId;
    const rawSession = req.params.sessionId;

    // Resolve session_id theo cùng logic Python:
    // resolve_session_id → "user:{userId}:{rawSession}" hoặc "user:{userId}:default"
    let sessionId;
    if (!rawSession || ['null', 'undefined', 'default', 'none'].includes(rawSession.toLowerCase())) {
      sessionId = `user:${userId}:default`;
    } else if (rawSession.startsWith('user:')) {
      sessionId = rawSession;
    } else {
      sessionId = `user:${userId}:${rawSession}`;
    }

    const messages = await db
      .collection('chat_history')
      .find(
        { session_id: sessionId, user_id: userId },
        { projection: { _id: 0, role: 1, content: 1, created_at: 1 } }
      )
      .sort({ created_at: 1 }) // cũ → mới
      .limit(50)
      .toArray();

    return res.status(200).json({
      session_id: sessionId,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      count: messages.length,
    });
  } catch (err) {
    console.error('Chat history error:', err);
    return res.status(500).json({ message: 'Lỗi lấy lịch sử chat', err });
  }
});

// ── DELETE /api/ai/chat/history/:sessionId ────────────────────────────────────
// Xóa history trực tiếp từ MongoDB chatbot + forward sang Render để đồng bộ session state
router.delete('/chat/history/:sessionId', async (req, res) => {
  try {
    const connection = getChatbotDb();
    const db = connection.db;

    const userId = req.user.userId;
    const rawSession = req.params.sessionId;

    let sessionId;
    if (!rawSession || ['null', 'undefined', 'default', 'none'].includes(rawSession.toLowerCase())) {
      sessionId = `user:${userId}:default`;
    } else if (rawSession.startsWith('user:')) {
      sessionId = rawSession;
    } else {
      sessionId = `user:${userId}:${rawSession}`;
    }

    // Xóa messages từ MongoDB trực tiếp
    await db.collection('chat_history').deleteMany({ session_id: sessionId, user_id: userId });

    // Cố gắng đồng bộ session state trên Render (mark_session_cleared)
    // Nếu Render đang ngủ thì bỏ qua — không block response
    try {
      await forwardToFastAPI(
        `/api/chat/history/${req.params.sessionId}`,
        'DELETE',
        null,
        userId,
      );
    } catch (_) {
      // Render offline → không sao, history đã xóa khỏi MongoDB rồi
    }

    return res.status(200).json({ message: 'Đã xóa lịch sử', session_id: sessionId });
  } catch (err) {
    console.error('Delete history error:', err);
    return res.status(500).json({ message: 'Lỗi xóa lịch sử chat', err });
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

    if (!req.file) {
      return res.status(400).json({
        message: 'Chưa chọn file',
      });
    }

    const formData = new FormData();

    formData.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const response = await axios.post(
      `${FASTAPI_URL}/api/cv/upload`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'X-User-Id': req.user?.userId,
          'X-User-Role': req.user?.role || 'user',
        },
      },
    );

    console.log('FastAPI status:', response.status);
    console.log('FastAPI response:', response.data);

    return res.status(response.status).json(response.data);
  } catch (err) {
    console.error('CV upload error:', err.response?.data || err.message);

    return res.status(err.response?.status || 502).json(
      err.response?.data || {
        message: 'Lỗi upload CV',
      },
    );
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
