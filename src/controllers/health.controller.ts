import { Request, Response } from 'express';

export const checkHealth = (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Project W API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
};
