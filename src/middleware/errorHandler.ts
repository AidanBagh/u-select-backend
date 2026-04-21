import type { ErrorRequestHandler } from 'express';
import type { Error as MongooseError } from 'mongoose';

interface HttpError extends Error {
  code?: string;
  status?: number;
  statusCode?: number;
  kind?: string;
  errors?: Record<string, { message: string }>;
}

const errorHandler: ErrorRequestHandler = (err: HttpError, req, res, next) => {
  // Multer file-size / file-type errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ message: 'File exceeds the 7 MB limit' });
  }
  if (err.message && err.message.includes('Only CSV')) {
    return res.status(400).json({ message: err.message });
  }

  // Mongoose validation errors
  if (err.name === 'ValidationError' && err.errors) {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: messages.join(', ') });
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  console.error('[Error]', err.stack || err.message || err);

  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    message: status === 500 ? 'Internal server error' : err.message,
  });
};

export default errorHandler;
