import type { Router } from "express";

export function viewRouter(router: Router) {
  // 视图路由 - 由前端处理
  router.get("*", (_req, res) => {
    res.redirect("/");
  });
}
