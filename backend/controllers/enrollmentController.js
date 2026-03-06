const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const Progress = require('../models/Progress');
const Lesson = require('../models/Lesson');
const Section = require('../models/Section');

exports.enrollInCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const existingEnrollment = await Enrollment.findOne({
      user: req.user._id,
      course: courseId
    });

    if (existingEnrollment) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    const enrollment = await Enrollment.create({
      user: req.user._id,
      course: courseId
    });

    await Course.findByIdAndUpdate(courseId, {
      $inc: { enrollmentsCount: 1 }
    });

    res.status(201).json(enrollment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ user: req.user._id, isActive: true })
      .populate({
        path: 'course',
        populate: { path: 'instructor', select: 'name avatar' }
      })
      .sort('-enrolledAt');

    const enrollmentsWithProgress = await Promise.all(
      enrollments.map(async (enrollment) => {
        const course = enrollment.course;
        
        const totalLessons = await Lesson.countDocuments({
          section: { $in: await Section.find({ course: course._id }).select('_id') }
        });

        const completedLessons = await Progress.countDocuments({
          user: req.user._id,
          course: course._id,
          isCompleted: true
        });

        const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

        return {
          ...enrollment.toObject(),
          progress,
          completedLessons,
          totalLessons
        };
      })
    );

    res.json(enrollmentsWithProgress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getEnrollmentStatus = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      user: req.user._id,
      course: req.params.courseId
    });

    res.json({ isEnrolled: !!enrollment, enrollment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.checkEnrollment = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (!req.user) {
      return res.json({ isEnrolled: false, canEnroll: true });
    }

    const enrollment = await Enrollment.findOne({
      user: req.user._id,
      course: req.params.courseId
    });

    res.json({ 
      isEnrolled: !!enrollment, 
      canEnroll: !enrollment || enrollment.isActive 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
