import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach Authorization Bearer token
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('knowsphere_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor for 401 handle
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto-redirect if we're on login page or demo mode
      console.warn('[API] Unauthorized request:', error.config?.url);
    }
    return Promise.reject(error);
  }
);

export const api = {
  // 1. Auth
  auth: {
    signup: (data) => client.post('/auth/signup', data).then(r => r.data),
    login: (data) => client.post('/auth/login', data).then(r => r.data),
    demoLogin: (role = 'researcher') => client.post('/auth/demo', { role }).then(r => r.data),
    getMe: () => client.get('/auth/me').then(r => r.data),
    logout: () => client.post('/auth/logout').then(r => r.data)
  },

  // 2. Projects
  projects: {
    list: (params) => client.get('/projects', { params }).then(r => r.data),
    get: (id) => client.get(`/projects/${id}`).then(r => r.data),
    create: (data) => client.post('/projects', data).then(r => r.data),
    update: (id, data) => client.put(`/projects/${id}`, data).then(r => r.data),
    delete: (id) => client.delete(`/projects/${id}`).then(r => r.data)
  },

  // 3. Documents
  documents: {
    listByProject: (projectId) => client.get(`/documents/project/${projectId}`).then(r => r.data),
    get: (id) => client.get(`/documents/${id}`).then(r => r.data),
    upload: (formData) => client.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(r => r.data),
    extractUrl: (data) => client.post('/documents/extract-url', data).then(r => r.data),
    importDoi: (data) => client.post('/documents/doi', data).then(r => r.data),
    createManual: (data) => client.post('/documents/manual', data).then(r => r.data),
    delete: (id) => client.delete(`/documents/${id}`).then(r => r.data)
  },

  // 4. AI Intelligence Pipeline
  ai: {
    analyze: (document_id) => client.post('/ai/analyze', { document_id }).then(r => r.data),
    chat: (data) => client.post('/ai/chat', data).then(r => r.data),
    search: (data) => client.post('/ai/search', data).then(r => r.data),
    compare: (data) => client.post('/ai/compare', data).then(r => r.data),
    getKnowledgeGraph: (project_id, refresh = false) => client.post('/ai/knowledge-graph', { project_id, refresh }).then(r => r.data),
    discoverGaps: (project_id) => client.post('/ai/gaps', { project_id }).then(r => r.data),
    generateReport: (data) => client.post('/ai/report', data).then(r => r.data),
    generateCitation: (document_id, style) => client.post('/ai/citation', { document_id, style }).then(r => r.data)
  },

  // 5. Notes
  notes: {
    list: (project_id) => client.get('/notes', { params: { project_id } }).then(r => r.data),
    create: (data) => client.post('/notes', data).then(r => r.data),
    update: (id, data) => client.put(`/notes/${id}`, data).then(r => r.data),
    delete: (id) => client.delete(`/notes/${id}`).then(r => r.data),
    aiAssist: (data) => client.post('/notes/ai-assist', data).then(r => r.data)
  },

  // 6. Reports
  reports: {
    list: (project_id) => client.get('/reports', { params: { project_id } }).then(r => r.data),
    get: (id) => client.get(`/reports/${id}`).then(r => r.data),
    export: (id, format = 'markdown') => client.post(`/reports/${id}/export`, { format }, {
      responseType: format === 'json' ? 'json' : 'blob'
    }).then(r => r.data)
  },

  // 7. Admin
  admin: {
    getStats: () => client.get('/admin/stats').then(r => r.data),
    getUsers: () => client.get('/admin/users').then(r => r.data),
    getHealth: () => client.get('/admin/health').then(r => r.data)
  }
};
