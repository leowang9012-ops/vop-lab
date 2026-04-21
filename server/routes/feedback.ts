// 反馈管理 API 路由 - 简化版本
// VoP Lab - 游戏玩家反馈智能分析平台

import { Router } from 'express';
import type { Request, Response } from 'express';

const router = Router();

// 模拟反馈数据
interface MockFeedback {
  id: number;
  projectId: number;
  content: string;
  source: string;
  createdAt: Date;
  processedAt?: Date;
}

const mockFeedbacks: MockFeedback[] = [
  { id: 1, projectId: 1, content: "游戏在 iPhone 15 上闪退", source: "appstore", createdAt: new Date(), processedAt: new Date() },
  { id: 2, projectId: 1, content: "希望能增加公会系统", source: "wechat", createdAt: new Date() },
  { id: 3, projectId: 2, content: "联盟战奖励发放延迟", source: "email", createdAt: new Date() },
];

// 模拟项目数据
const mockProjects = [
  { id: 1, name: "星际冒险" },
  { id: 2, name: "王国争霸" },
];

interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

interface ErrorResponse {
  success: false;
  error: { code: string; message: string };
}

/**
 * POST /api/feedback/upload
 * 上传 CSV/Excel 文件并解析入库
 */
router.post('/upload', async (req: Request, res: Response) => {
  try {
    const { projectId, source } = req.body;

    if (!projectId || !source) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_PARAMS', message: '缺少 projectId 或 source 参数' },
      } as ErrorResponse);
      return;
    }

    res.status(201).json({
      success: true,
      data: {
        projectId: parseInt(projectId, 10),
        source,
        imported: 10,
        failed: 0,
        errors: [],
      },
      message: '文件上传成功，已解析入库',
    } as SuccessResponse<unknown>);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'UPLOAD_ERROR', message: '文件上传处理失败' },
    } as ErrorResponse);
  }
});

/**
 * POST /api/feedback/batch
 * 批量导入反馈数据
 */
router.post('/batch', async (req: Request, res: Response) => {
  try {
    const { projectId, feedbacks } = req.body;
    const project = mockProjects.find(p => p.id === projectId);
    
    if (!project) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: '项目不存在' },
      } as ErrorResponse);
      return;
    }

    res.status(201).json({
      success: true,
      data: {
        imported: feedbacks?.length || 0,
        failed: 0,
      },
    } as SuccessResponse<unknown>);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: '批量导入失败' },
    } as ErrorResponse);
  }
});

/**
 * GET /api/feedback/:projectId
 * 获取某项目的反馈列表
 */
router.get('/:projectId', async (req: Request, res: Response) => {
  try {
    const projectIdParam = req.params.projectId;
    const projectId = parseInt(projectIdParam as string, 10);
    if (isNaN(projectId)) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_ID', message: '无效的项目ID' },
      } as ErrorResponse);
      return;
    }

    const { page = '1', pageSize = '10' } = req.query as { page?: string; pageSize?: string };
    const pageNum = parseInt(page, 10);
    const pageSizeNum = parseInt(pageSize, 10);

    const filtered = mockFeedbacks.filter(f => f.projectId === projectId);
    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSizeNum);

    const offset = (pageNum - 1) * pageSizeNum;
    const data = filtered.slice(offset, offset + pageSizeNum);

    res.json({
      success: true,
      data: {
        data,
        pagination: {
          page: pageNum,
          pageSize: pageSizeNum,
          total,
          totalPages,
        },
      },
    } as SuccessResponse<unknown>);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: '获取反馈列表失败' },
    } as ErrorResponse);
  }
});

/**
 * POST /api/feedback/:projectId/process
 * 触发 AI 处理
 */
router.post('/:projectId/process', async (req: Request, res: Response) => {
  try {
    const projectIdParam = req.params.projectId;
    const projectId = parseInt(projectIdParam as string, 10);
    if (isNaN(projectId)) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_ID', message: '无效的项目ID' },
      } as ErrorResponse);
      return;
    }

    const project = mockProjects.find(p => p.id === projectId);
    if (!project) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: '项目不存在' },
      } as ErrorResponse);
      return;
    }

    const pendingCount = mockFeedbacks.filter(f => f.projectId === projectId && !f.processedAt).length;

    res.json({
      success: true,
      data: {
        projectId,
        pendingCount,
        status: 'processing',
        message: `已提交 ${pendingCount} 条反馈进行AI处理`,
      },
    } as SuccessResponse<unknown>);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: '触发AI处理失败' },
    } as ErrorResponse);
  }
});

/**
 * GET /api/feedback/:projectId/processed
 * 获取已处理反馈列表
 */
router.get('/:projectId/processed', async (req: Request, res: Response) => {
  try {
    const projectIdParam = req.params.projectId;
    const projectId = parseInt(projectIdParam as string, 10);
    if (isNaN(projectId)) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_ID', message: '无效的项目ID' },
      } as ErrorResponse);
      return;
    }

    const processed = mockFeedbacks.filter(f => f.projectId === projectId && f.processedAt);

    res.json({
      success: true,
      data: processed,
    } as SuccessResponse<unknown>);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: '获取已处理反馈列表失败' },
    } as ErrorResponse);
  }
});

export default router;
