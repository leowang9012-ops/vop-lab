// 项目管理 API 路由
// VoP Lab - 游戏玩家反馈智能分析平台

import { Router } from 'express';

const router = Router();

// 模拟项目数据
const mockProjects = [
  {
    id: 1,
    name: "星际冒险",
    description: "一款科幻题材的角色扮演游戏",
    platform: "iOS",
    status: "active",
    feedbackCount: 1247,
    createdAt: "2026-01-15T08:00:00Z",
    updatedAt: "2026-04-21T10:30:00Z",
  },
  {
    id: 2,
    name: "王国争霸",
    description: "策略战争游戏",
    platform: "Android",
    status: "active",
    feedbackCount: 892,
    createdAt: "2026-02-20T08:00:00Z",
    updatedAt: "2026-04-20T14:20:00Z",
  },
  {
    id: 3,
    name: "末日求生",
    description: "末日生存类游戏",
    platform: "PC",
    status: "active",
    feedbackCount: 567,
    createdAt: "2026-03-10T08:00:00Z",
    updatedAt: "2026-04-19T09:15:00Z",
  },
];

/**
 * POST /api/projects
 * 创建新项目
 */
router.post('/', async (req, res) => {
  try {
    const body = req.body;
    const newProject = {
      id: mockProjects.length + 1,
      name: body.name,
      description: body.description ?? null,
      platform: body.platform,
      status: "active",
      feedbackCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockProjects.push(newProject);

    res.status(201).json({
      success: true,
      data: newProject,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: '创建项目失败' },
    });
  }
});

/**
 * GET /api/projects
 * 列出所有项目
 */
router.get('/', async (_req, res) => {
  try {
    res.json({
      success: true,
      data: mockProjects,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: '获取项目列表失败' },
    });
  }
});

/**
 * GET /api/projects/:id
 * 获取项目详情
 */
router.get('/:id', async (req, res) => {
  try {
    const projectId = parseInt(req.params.id, 10);
    if (isNaN(projectId)) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_ID', message: '无效的项目ID' },
      });
      return;
    }

    const project = mockProjects.find(p => p.id === projectId);

    if (!project) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: '项目不存在' },
      });
      return;
    }

    res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: '获取项目详情失败' },
    });
  }
});

/**
 * PUT /api/projects/:id
 * 更新项目信息
 */
router.put('/:id', async (req, res) => {
  try {
    const projectId = parseInt(req.params.id, 10);
    if (isNaN(projectId)) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_ID', message: '无效的项目ID' },
      });
      return;
    }

    const projectIndex = mockProjects.findIndex(p => p.id === projectId);
    if (projectIndex === -1) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: '项目不存在' },
      });
      return;
    }

    const body = req.body;
    mockProjects[projectIndex] = {
      ...mockProjects[projectIndex],
      ...body,
      updatedAt: new Date().toISOString(),
    };

    res.json({
      success: true,
      data: mockProjects[projectIndex],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: '更新项目失败' },
    });
  }
});

/**
 * DELETE /api/projects/:id
 * 删除项目
 */
router.delete('/:id', async (req, res) => {
  try {
    const projectId = parseInt(req.params.id, 10);
    if (isNaN(projectId)) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_ID', message: '无效的项目ID' },
      });
      return;
    }

    const projectIndex = mockProjects.findIndex(p => p.id === projectId);
    if (projectIndex === -1) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: '项目不存在' },
      });
      return;
    }

    mockProjects.splice(projectIndex, 1);

    res.json({
      success: true,
      data: null,
      message: '项目已删除',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: '删除项目失败' },
    });
  }
});

export default router;
