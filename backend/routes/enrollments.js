const express = require('express');
const router = express.Router();
const {
  enrollInCourse,
  getMyEnrollments,
  getEnrollmentStatus,
  checkEnrollment
} = require('../controllers/enrollmentController');
const { protect } = require('../middleware/auth');

router.post('/:courseId', protect, enrollInCourse);
router.get('/my', protect, getMyEnrollments);
router.get('/:courseId/status', protect, getEnrollmentStatus);
router.get('/:courseId/check', checkEnrollment);

module.exports = router;
