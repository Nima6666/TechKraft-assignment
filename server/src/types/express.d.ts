import "express";

declare global {
  namespace Express {
    interface Request {
      response?: {
        statusCode?: number;
        message?: string;
        data?: unknown;
      };
    }
  }
}

export {};
