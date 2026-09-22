import { Request, Response, NextFunction } from "express";

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error(err); // full detail in your server logs only

  res.status(500).json({ success: false, status: "error", message: "Something went wrong. Please try again." });
}