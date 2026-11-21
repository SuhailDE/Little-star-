import multer from 'multer';
import { env } from '../config/env.js';

export function notFoundApiHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
}

export function errorHandler(err, _req, res, _next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'An unexpected server error occurred.';

  if (err instanceof multer.MulterError) {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'Image file exceeds the 5 MB size limit.';
    } else {
      message = `File upload error: ${err.message}`;
    }
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    const messages = Object.values(err.errors || {}).map((e) => e.message);
    message = messages.join(', ') || 'Validation error.';
  } else if (err.code === 11000) {
    statusCode = 409;
    message = 'A record with this unique identifier already exists.';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid record identifier format.';
  }

  if (statusCode >= 500 && env.isProduction) {
    message = 'Internal server error.';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(err.details ? { details: err.details } : {}),
  });
}
