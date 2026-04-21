// Dashboard API 路由
// VoP Lab - 游戏玩家反馈智能分析平台

import { Router } from 'express';

const router = Router();

// 模拟数据
const mockDashboardData = {
  projectId: 1,
  projectName: "星际冒险",
  totalFeedback: 1247,
  processedFeedback: 892,
  pendingFeedback: 355,
  categoryBreakdown: {
    bug: 35,
    payment: 8,
    gameplay: 25,
    suggestion: 18,
    emotion: 9,
    other: 5,
  },
  sentimentBreakdown: {
    positive: 52,
    neutral: 28,
    negative: 20,
  },
  recentTrend: [
    { date: "04-15", count: 45 },
    { date: "04-16", count: 42 },
    { date: "04-17", count: 50 },
    { date: "04-18", count: 38 },
    { date: "04-19", count: 55 },
    { date: "04-20", count: 48 },
    { date: "04-21", count: 52 },
  ],
  topKeywords: [
    { word: "闪退", count: 89 },
    { word: "公会系统", count: 67 },
    { word: "副本难度", count: 54 },
    { word: "加载速度", count: 45 },
    { word: "画面精美", count: 38 },
  ],
  urgentCount: 12,
};

/**
 * GET /api/dashboard/:projectId
 * 获取 Dashboard 数据（统计摘要）
 */
router.get('/:projectId', async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId, 10);
    if (isNaN(projectId)) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_ID', message: '无效的项目ID' },
      });
      return;
    }

    res.json({
      success: true,
      data: {
        ...mockDashboardData,
        projectId,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: '获取Dashboard数据失败' },
    });
  }
});

/**
 * GET /api/dashboard/:projectId/trend
 * 获取反馈趋势数据（按天/周/月聚合）
 */
router.get('/:projectId/trend', async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId, 10);
    if (isNaN(projectId)) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_ID', message: '无效的项目ID' },
      });
      return;
    }

    res.json({
      success: true,
      data: mockDashboardData.recentTrend,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: '获取趋势数据失败' },
    });
  }
});

/**
 * GET /api/dashboard/:projectId/export
 * 导出 Dashboard 数据（CSV/PDF）
 */
router.get('/:projectId/export', async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId, 10);
    const format = (req.query.format as string) || 'csv';

    res.status(501).json({
      success: false,
      error: { code: 'NOT_IMPLEMENTED', message: '导出功能待实现' },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: '导出数据失败' },
    });
  }
});

export default router;
