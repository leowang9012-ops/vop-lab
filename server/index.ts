import express = require("express");
import type { Request, Response } from "express";

const port = Number(process.env.FORCE_SERVER_PORT) || 3000;
const host = process.env.FORCE_SERVER_HOST || "localhost";
const basePath = process.env.CLIENT_BASE_PATH || "/";

const app = express();
app.use(express.json());

// Health check
app.get(`${basePath}health`, (_req: Request, res: Response) => {
  res.json({ status: "ok", service: "vop-lab" });
});

// API routes
app.get(`${basePath}api/projects`, (_req: Request, res: Response) => {
  res.json({ success: true, data: [] });
});

app.get(`${basePath}api/feedback`, (_req: Request, res: Response) => {
  res.json({ success: true, data: [] });
});

app.get(`${basePath}api/analysis`, (_req: Request, res: Response) => {
  res.json({ success: true, data: [] });
});

app.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}${basePath}`);
});
