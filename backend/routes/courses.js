const express = require('express');
const router = express.Router();
const {
  getCourses,
  getCourseBySlug,
  createCourse,
  updateCourse,
  deleteCourse,
  getInstructorCourses,
  addSection,
  updateSection,
  deleteSection,
  addLesson,
  updateLesson,
  deleteLesson,
  getLessonById,
  getCategories
} = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/auth');

router.get('/categories', getCategories);
router.get('/', getCourses);
router.get('/:slug', getCourseBySlug);
router.get('/instructor/courses', protect, authorize('instructor', 'admin'), getInstructorCourses);
router.post('/', protect, authorize('instructor', 'admin'), createCourse);
router.put('/:id', protect, authorize('instructor', 'admin'), updateCourse);
router.delete('/:id', protect, authorize('instructor', 'admin'), deleteCourse);

router.post('/:id/sections', protect, authorize('instructor', 'admin'), addSection);
router.put('/sections/:sectionId', protect, authorize('instructor', 'admin'), updateSection);
router.delete('/sections/:sectionId', protect, authorize('instructor', 'admin'), deleteSection);

router.post('/sections/:sectionId/lessons', protect, authorize('instructor', 'admin'), addLesson);
router.put('/lessons/:lessonId', protect, authorize('instructor', 'admin'), updateLesson);
router.delete('/lessons/:lessonId', protect, authorize('instructor', 'admin'), deleteLesson);
router.get('/lessons/:lessonId', getLessonById);

module.exports = router;
