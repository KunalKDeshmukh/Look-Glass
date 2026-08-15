import { Request, Response, NextFunction } from "express";

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ error: "That route doesn't exist." });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction): void {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Something went wrong on our end." });
}
