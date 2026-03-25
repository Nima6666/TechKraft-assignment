import type { NextFunction, Request, Response } from "express";

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const raw = req.header("x-header-isadmin");
  const ok = raw?.toLowerCase() === "true";
  if (!ok) {
    res.status(403).json({ message: "Admin access required" });
    return;
  }

  next();
}
