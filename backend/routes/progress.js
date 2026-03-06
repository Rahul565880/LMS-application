const express = require('express');
const router = express.Router();
const {
  markLessonComplete,
  getCourseProgress,
  getLessonProgress,
  updateWatchProgress,
  getNextLesson,
  getPrevLesson
} = require('../controllers/progressController');
const { protect } = require('../middleware/auth');

router.post('/lesson/:lessonId', protect, markLessonComplete);
router.get('/course/:courseId', protect, getCourseProgress);
router.get('/lesson/:lessonId', protect, getLessonProgress);
router.put('/lesson/:lessonId', protect, updateWatchProgress);
router.get('/next/:courseId/:currentLessonId', protect, getNextLesson);
router.get('/prev/:courseId/:currentLessonId', protect, getPrevLesson);

module.exports = router;
