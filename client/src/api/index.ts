// import { axiosForBackend } from '@lark-apaas/client-toolkit-lite';
// import type { ListProjectsResponse } from '@shared/api.interface';

// API 函数封装
// 使用 axiosForBackend 发起请求
//
// 使用示例：
// export async function listProjects(): Promise<ListProjectsResponse> {
//   try {
//     const response = await axiosForBackend({
//       url: '/api/projects',
//       method: 'GET',
//     });
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// }

// TODO: 实现 API 接口调用
export const api = {
  // 项目相关
  getProjects: async () => {
    // TODO: 调用后端 API
    return [];
  },
  
  // 反馈相关
  getFeedbacks: async () => {
    // TODO: 调用后端 API
    return [];
  },
  
  // 报告相关
  getReports: async () => {
    // TODO: 调用后端 API
    return [];
  },
};
