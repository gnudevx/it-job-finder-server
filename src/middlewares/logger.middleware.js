// middlewares/loggerMiddleware.js
import logger from '../config/logger.js';

export const httpLogger = (req, res, next) => {
  const userId = req.user?.userId || 'anonymous';
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(
      `[${req.method}] ${req.originalUrl} ${res.statusCode} - ${duration}ms`,
      {
        userId,
      },
    );
  });

  next();
};

export const errorLogger = (err, req, res, next) => {
  const userId = req.user?.userId || 'anonymous';
  logger.error(`[${req.method}] ${req.originalUrl} - ${err.message}`, {
    userId,
    stack: err.stack,
  });
  next(err);
};
