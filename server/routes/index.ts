import type { Router } from "express";

// 简化路由注册，前端使用模拟数据
export function registerRoutes(router: Router) {
  // API 路由占位 - 实际功能由前端模拟数据实现
  router.get("/api/health", (_req, res) => {
    res.json({ success: true, message: "VoP Lab API 服务正常" });
  });
}
