import { Router } from 'express';

const router = Router();

// Mock data for analysis reports
interface Report {
  id: number;
  projectId: number;
  title: string;
  periodStart: string;
  periodEnd: string;
  totalFeedback: number;
  categoryDistribution: Record<string, number>;
  sentimentDistribution: Record<string, number>;
  topKeywords: string[];
  urgentIssues: number;
  insights: string;
  createdAt: string;
}

const mockReports: Report[] = [
  {
    id: 1,
    projectId: 1,
    title: '星际冒险 - 2026年4月第三周反馈分析报告',
    periodStart: '2026-04-15',
    periodEnd: '2026-04-21',
    totalFeedback: 156,
    categoryDistribution: { bug: 35, feature: 25, balance: 18, performance: 12, ui: 7, other: 3 },
    sentimentDistribution: { positive: 52, neutral: 28, negative: 20 },
    topKeywords: ['闪退', '公会系统', '副本难度', '加载速度'],
    urgentIssues: 3,
    insights: '本周整体情感倾向偏正面，主要问题集中在闪退Bug和副本难度平衡上。',
    createdAt: '2026-04-21T08:00:00Z',
  },
];

// Get analysis reports list
router.get('/:projectId', (req, res) => {
  const projectId = parseInt(req.params.projectId, 10);
  if (isNaN(projectId)) {
    res.status(400).json({ success: false, error: { code: 'INVALID_ID', message: '无效的项目ID' } });
    return;
  }

  const reports = mockReports.filter(r => r.projectId === projectId);
  res.json({
    success: true,
    data: {
      data: reports,
      pagination: { page: 1, pageSize: 10, total: reports.length, totalPages: 1 },
    },
  });
});

// Get single report
router.get('/:projectId/:reportId', (req, res) => {
  const projectId = parseInt(req.params.projectId, 10);
  const reportId = parseInt(req.params.reportId, 10);

  if (isNaN(projectId) || isNaN(reportId)) {
    res.status(400).json({ success: false, error: { code: 'INVALID_ID', message: '无效的ID' } });
    return;
  }

  const report = mockReports.find(r => r.projectId === projectId && r.id === reportId);
  if (!report) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: '报告不存在' } });
    return;
  }

  res.json({ success: true, data: report });
});

// Generate new report
router.post('/:projectId/generate', (req, res) => {
  const projectId = parseInt(req.params.projectId, 10);
  if (isNaN(projectId)) {
    res.status(400).json({ success: false, error: { code: 'INVALID_ID', message: '无效的项目ID' } });
    return;
  }

  const newReport = {
    id: mockReports.length + 1,
    projectId,
    title: '新分析报告',
    periodStart: req.body.periodStart || '2026-04-21',
    periodEnd: req.body.periodEnd || '2026-04-21',
    totalFeedback: 100,
    categoryDistribution: {},
    sentimentDistribution: {},
    topKeywords: [],
    urgentIssues: 0,
    insights: '',
    createdAt: new Date().toISOString(),
  };

  mockReports.push(newReport);
  res.status(201).json({ success: true, data: newReport });
});

// Delete report
router.delete('/:projectId/:reportId', (req, res) => {
  const projectId = parseInt(req.params.projectId, 10);
  const reportId = parseInt(req.params.reportId, 10);

  if (isNaN(projectId) || isNaN(reportId)) {
    res.status(400).json({ success: false, error: { code: 'INVALID_ID', message: '无效的ID' } });
    return;
  }

  const index = mockReports.findIndex(r => r.projectId === projectId && r.id === reportId);
  if (index === -1) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: '报告不存在' } });
    return;
  }

  mockReports.splice(index, 1);
  res.json({ success: true, data: null, message: '报告已删除' });
});

export default router;
