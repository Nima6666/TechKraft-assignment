import type { NextFunction, Request, Response } from "express";

export function responseHandler(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.response) {
    next();
    return;
  }

  const { statusCode = 200, message, data } = req.response;
  if (statusCode === 204) {
    res.status(204).send();
    return;
  }

  res.status(statusCode).json({
    ...(message ? { message } : {}),
    ...(data !== undefined ? { data } : {}),
  });
}
