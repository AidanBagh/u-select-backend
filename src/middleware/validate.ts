import type { RequestHandler } from 'express';

const validateJob: RequestHandler = (req, res, next) => {
  const { title, description } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ message: 'Title is required' });
  }
  if (!description || !description.trim()) {
    return res.status(400).json({ message: 'Description is required' });
  }

  // Sanitise weights if provided
  if (req.body.weights) {
    const { skills, experience, education, relevance } = req.body.weights;
    const vals = [skills, experience, education, relevance].filter((v) => v !== undefined);
    if (vals.some((v) => typeof v !== 'number' || v < 0 || v > 100)) {
      return res.status(400).json({ message: 'Weights must be numbers between 0 and 100' });
    }
  }

  next();
};

const validateStructuredApplicant: RequestHandler = (req, res, next) => {
  const { jobId, name } = req.body;

  if (!jobId) return res.status(400).json({ message: 'jobId is required' });
  if (!name || !name.trim()) return res.status(400).json({ message: 'Name is required' });

  next();
};

const validateUploadApplicant: RequestHandler = (req, res, next) => {
  if (!req.body.jobId) {
    return res.status(400).json({ message: 'jobId is required' });
  }
  next();
};

export { validateJob, validateStructuredApplicant, validateUploadApplicant };
