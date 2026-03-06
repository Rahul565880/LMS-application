import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data)
};

export const courseService = {
  getCourses: (params) => api.get('/courses', { params }),
  getCourseBySlug: (slug) => api.get(`/courses/${slug}`),
  createCourse: (data) => api.post('/courses', data),
  updateCourse: (id, data) => api.put(`/courses/${id}`, data),
  deleteCourse: (id) => api.delete(`/courses/${id}`),
  getInstructorCourses: () => api.get('/courses/instructor/courses'),
  getCategories: () => api.get('/courses/categories'),
  addSection: (courseId, data) => api.post(`/courses/${courseId}/sections`, data),
  updateSection: (sectionId, data) => api.put(`/courses/sections/${sectionId}`, data),
  deleteSection: (sectionId) => api.delete(`/courses/sections/${sectionId}`),
  addLesson: (sectionId, data) => api.post(`/courses/sections/${sectionId}/lessons`, data),
  updateLesson: (lessonId, data) => api.put(`/courses/lessons/${lessonId}`, data),
  deleteLesson: (lessonId) => api.delete(`/courses/lessons/${lessonId}`)
};

export const enrollmentService = {
  enrollInCourse: (courseId) => api.post(`/enrollments/${courseId}`),
  getMyEnrollments: () => api.get('/enrollments/my'),
  getEnrollmentStatus: (courseId) => api.get(`/enrollments/${courseId}/status`),
  checkEnrollment: (courseId) => api.get(`/enrollments/${courseId}/check`)
};

export const progressService = {
  markLessonComplete: (lessonId) => api.post(`/progress/lesson/${lessonId}`),
  getCourseProgress: (courseId) => api.get(`/progress/course/${courseId}`),
  getLessonProgress: (lessonId) => api.get(`/progress/lesson/${lessonId}`),
  updateWatchProgress: (lessonId, data) => api.put(`/progress/lesson/${lessonId}`, data),
  getNextLesson: (courseId, currentLessonId) => api.get(`/progress/next/${courseId}/${currentLessonId}`),
  getPrevLesson: (courseId, currentLessonId) => api.get(`/progress/prev/${courseId}/${currentLessonId}`)
};

export default api;
